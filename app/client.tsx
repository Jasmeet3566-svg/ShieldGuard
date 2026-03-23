import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

const API = axios.create({
    baseURL: 'https://security-portal-2ghh.onrender.com',
});

// Registered by AuthContext so the client can update React state on forced logout
let _logoutCallback: (() => void) | null = null;
export const setLogoutCallback = (fn: () => void) => {
    _logoutCallback = fn;
};

const getToken = async () => {
    if (Platform.OS === 'web') return localStorage.getItem('accessToken');
    return await AsyncStorage.getItem('accessToken');
};

const getRefreshToken = async () => {
    if (Platform.OS === 'web') return localStorage.getItem('refreshToken');
    return await AsyncStorage.getItem('refreshToken');
};

const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now() + 30_000; // 30s buffer
    } catch {
        return true;
    }
};

const saveAccessToken = async (token: string) => {
    if (Platform.OS === 'web') {
        localStorage.setItem('accessToken', token);
    } else {
        await AsyncStorage.setItem('accessToken', token);
    }
};

const clearTokens = async () => {
    if (Platform.OS === 'web') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    } else {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
    }
};

// In-flight lock so concurrent requests don't trigger multiple simultaneous refreshes
let refreshPromise: Promise<string | null> | null = null;

// Calls /auth/refresh and saves the new access token. Returns null if it fails.
const tryRefresh = (): Promise<string | null> => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) return null;
        try {
            const res = await axios.post(
                'https://security-portal-2ghh.onrender.com/auth/refresh',
                { refreshToken }
            );
            const newToken = res.data.accessToken;
            await saveAccessToken(newToken);
            return newToken;
        } catch {
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

// 🔐 Request interceptor — proactively refresh if access token is already expired
API.interceptors.request.use(async (config) => {
    let token = await getToken();

    if (token && isTokenExpired(token)) {
        const newToken = await tryRefresh();
        if (newToken) {
            token = newToken;
        } else {
            // Refresh token also expired — force logout
            await clearTokens();
            _logoutCallback?.();
            return Promise.reject(new Error('Session expired. Please log in again.'));
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 🔁 Response interceptor — handle unexpected 401s (e.g. clock skew)
API.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const newToken = await tryRefresh();
            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return API(originalRequest);
            }

            // Refresh failed — force logout
            await clearTokens();
            _logoutCallback?.();
        }

        return Promise.reject(error);
    }
);

export default API;