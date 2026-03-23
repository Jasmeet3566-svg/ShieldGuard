import { useEffect } from 'react';
import { useRouter, Slot } from 'expo-router';
import { useAuth } from '../AuthContext';

export default function ProtectedLayout() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/'); // redirect to login
        }
    }, [user, loading]);

    if (loading) return null;

    return <Slot />;
}