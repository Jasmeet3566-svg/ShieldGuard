import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    type UserType = {
        loggedIn: boolean;
    };

    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    const getToken = async () => {
        if (Platform.OS === 'web') {
            return localStorage.getItem('accessToken');
        } else {
            return await AsyncStorage.getItem('accessToken');
        }
    };

    // 🔥 AUTO LOGIN
    useEffect(() => {
        const checkAuth = async () => {
            const token = await getToken();

            if (token) {
                setUser({ loggedIn: true });
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (data: any) => {
        if (Platform.OS === 'web') {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
        } else {
            await AsyncStorage.setItem('accessToken', data.accessToken);
            await AsyncStorage.setItem('refreshToken', data.refreshToken);
        }

        setUser({ loggedIn: true });
    };

    const logout = async () => {
        if (Platform.OS === 'web') {
            localStorage.clear();
        } else {
            await AsyncStorage.clear();
        }

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);