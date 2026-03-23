import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
    baseURL: 'https://security-portal-2ghh.onrender.com',
});

const getToken = async () => {
    if (Platform.OS === 'web') {
        return localStorage.getItem('accessToken');
    } else {
        return await AsyncStorage.getItem('accessToken');
    }
};

const getRefreshToken = async () => {
    if (Platform.OS === 'web') {
        return localStorage.getItem('refreshToken');
    } else {
        return await AsyncStorage.getItem('refreshToken');
    }
};

// 🔐 Request interceptor
API.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 🔁 Response interceptor (AUTO REFRESH)
API.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = await getRefreshToken();

            const res = await axios.post(
                'https://security-portal-2ghh.onrender.com/auth/refresh',
                { refreshToken }
            );

            const newAccessToken = res.data.accessToken;

            if (Platform.OS === 'web') {
                localStorage.setItem('accessToken', newAccessToken);
            } else {
                await AsyncStorage.setItem('accessToken', newAccessToken);
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return API(originalRequest);
        }

        return Promise.reject(error);
    }
);

export default API;