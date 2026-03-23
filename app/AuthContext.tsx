import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { setLogoutCallback } from './client';

const AuthContext = createContext<any>(null);

const BASE_URL = 'https://security-portal-2ghh.onrender.com';

export const AuthProvider = ({ children }: any) => {
    type UserType = {
        loggedIn: boolean;
        email?: string;
        userType?: string;
        companyCode?: string;
    };

    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    const getStorage = async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') return localStorage.getItem(key);
        return await AsyncStorage.getItem(key);
    };

    const clearStorage = async () => {
        if (Platform.OS === 'web') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userType');
            localStorage.removeItem('companyCode');
        } else {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('userEmail');
            await AsyncStorage.removeItem('userType');
            await AsyncStorage.removeItem('companyCode');
        }
    };

    const isTokenExpired = (token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    };

    const logout = async () => {
        const refreshToken = await getStorage('refreshToken');
        if (refreshToken) {
            try {
                await axios.post(`${BASE_URL}/auth/logout`, { refreshToken });
            } catch {
                // Ignore logout API errors — still clear local state
            }
        }
        await clearStorage();
        setUser(null);
    };

    // Register a lightweight logout with the API client so it can force-logout
    // when the refresh token is expired mid-session (tokens already cleared by client)
    useEffect(() => {
        setLogoutCallback(() => setUser(null));
    }, []);

    // 🔥 SESSION CHECK ON STARTUP
    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = await getStorage('accessToken');
            const refreshToken = await getStorage('refreshToken');

            if (accessToken && !isTokenExpired(accessToken)) {
                // ✅ Access token valid — good to go
                const email = await getStorage('userEmail');
                const userType = await getStorage('userType');
                const companyCode = await getStorage('companyCode');
                setUser({ loggedIn: true, email: email ?? undefined, userType: userType ?? undefined, companyCode: companyCode ?? undefined });
            } else if (refreshToken && !isTokenExpired(refreshToken)) {
                // ⏳ Access token expired but refresh token still valid
                const email = await getStorage('userEmail');
                const userType = await getStorage('userType');
                const companyCode = await getStorage('companyCode');
                setUser({ loggedIn: true, email: email ?? undefined, userType: userType ?? undefined, companyCode: companyCode ?? undefined });
            } else {
                // ❌ Both tokens missing or expired — call logout API and clear
                if (refreshToken) {
                    try {
                        await axios.post(`${BASE_URL}/auth/logout`, { refreshToken });
                    } catch {
                        // ignore
                    }
                }
                await clearStorage();
                setUser(null);
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (data: any) => {
        if (Platform.OS === 'web') {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            if (data.email) localStorage.setItem('userEmail', data.email);
            if (data.userType) localStorage.setItem('userType', data.userType);
            if (data.companyCode) localStorage.setItem('companyCode', data.companyCode);
        } else {
            await AsyncStorage.setItem('accessToken', data.accessToken);
            await AsyncStorage.setItem('refreshToken', data.refreshToken);
            if (data.email) await AsyncStorage.setItem('userEmail', data.email);
            if (data.userType) await AsyncStorage.setItem('userType', data.userType);
            if (data.companyCode) await AsyncStorage.setItem('companyCode', data.companyCode);
        }

        setUser({ loggedIn: true, email: data.email, userType: data.userType, companyCode: data.companyCode });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);