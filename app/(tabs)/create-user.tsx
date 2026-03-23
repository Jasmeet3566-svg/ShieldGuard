import API from '@/app/client';
import { ThemedText } from '@/components/themed-text';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type UserType = 'ADMIN' | 'OFFICER' | 'GUARD';

const USER_TYPES: UserType[] = ['ADMIN', 'OFFICER', 'GUARD'];

export default function CreateUserScreen() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        companyCode: '',
        userType: 'OFFICER' as UserType,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const set = (key: keyof typeof form) => (value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        const { name, email, password, phone, companyCode } = form;
        if (!name || !email || !password || !phone || !companyCode) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        try {
            const res = await API.post('/auth/create/user', form);
            setSuccess(`User "${res.data.name}" created successfully!`);
            setForm({ name: '', email: '', password: '', phone: '', companyCode: '', userType: 'OFFICER' });
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to create user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ThemedText type="title" style={styles.title}>Create User</ThemedText>

            <View style={styles.form}>
                <Field label="Name" value={form.name} onChangeText={set('name')} placeholder="e.g. Ray Sharma" />
                <Field label="Email" value={form.email} onChangeText={set('email')} placeholder="e.g. ray@shield.com" keyboardType="email-address" autoCapitalize="none" />
                <Field label="Password" value={form.password} onChangeText={set('password')} placeholder="Password" secureTextEntry />
                <Field label="Phone" value={form.phone} onChangeText={set('phone')} placeholder="e.g. 9999999999" keyboardType="phone-pad" />
                <Field label="Company Code" value={form.companyCode} onChangeText={set('companyCode')} placeholder="e.g. REENA" autoCapitalize="characters" />

                <Text style={styles.label}>User Type</Text>
                <View style={styles.segmentRow}>
                    {USER_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.segment, form.userType === type && styles.segmentActive]}
                            onPress={() => setForm((prev) => ({ ...prev, userType: type }))}>
                            <Text style={[styles.segmentText, form.userType === type && styles.segmentTextActive]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {success ? <Text style={styles.success}>{success}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Create User</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

function Field({
    label,
    ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) {
    return (
        <View style={styles.fieldWrapper}>
            <Text style={styles.label}>{label}</Text>
            <TextInput style={styles.input} placeholderTextColor="#666" {...props} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0c',
    },
    content: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 64 : 40,
        paddingBottom: 40,
    },
    title: {
        color: '#fff',
        marginBottom: 28,
    },
    form: {
        gap: 4,
    },
    fieldWrapper: {
        marginBottom: 16,
    },
    label: {
        color: '#9BA1A6',
        fontSize: 13,
        marginBottom: 6,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#1c1c1e',
        color: '#fff',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#2c2c2e',
    },
    segmentRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    segment: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2c2c2e',
        alignItems: 'center',
        backgroundColor: '#1c1c1e',
    },
    segmentActive: {
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
    },
    segmentText: {
        color: '#9BA1A6',
        fontSize: 13,
        fontWeight: '600',
    },
    segmentTextActive: {
        color: '#fff',
    },
    error: {
        color: '#f87171',
        fontSize: 13,
        marginBottom: 12,
        backgroundColor: '#3b0000',
        padding: 10,
        borderRadius: 8,
    },
    success: {
        color: '#4ade80',
        fontSize: 13,
        marginBottom: 12,
        backgroundColor: '#002b1a',
        padding: 10,
        borderRadius: 8,
    },
    button: {
        backgroundColor: '#8b5cf6',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
