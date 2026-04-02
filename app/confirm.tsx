import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type Status = 'loading' | 'success' | 'error';

export default function OrderConfirmScreen() {
  const { token, action } = useLocalSearchParams<{ token: string; action: string }>();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !action) {
      setStatus('error');
      setMessage('Invalid confirmation link. Please contact support.');
      return;
    }

    const confirm = async () => {
      try {
        await axios.get('http://localhost:8080/api/orders/confirm', {
          params: { token, action },
        });
        setStatus('success');
        setMessage(
          action === 'ACCEPT'
            ? 'You have successfully accepted the order. The team has been notified.'
            : 'You have rejected the order. The team has been notified.'
        );
      } catch (err: any) {
        setStatus('error');
        setMessage(
          err?.response?.data?.message ??
            err?.message ??
            'Something went wrong. The link may have expired or already been used.'
        );
      }
    };

    confirm();
  }, [token, action]);

  const isAccept = action === 'ACCEPT';

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        {/* Logo / Brand */}
        <Text style={styles.brand}>Antigravity</Text>

        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color="#6366f1" style={{ marginBottom: 20 }} />
            <Text style={styles.heading}>Processing your response…</Text>
            <Text style={styles.sub}>Please wait a moment.</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={[styles.iconWrap, isAccept ? styles.iconWrapGreen : styles.iconWrapRed]}>
              {isAccept
                ? <CheckCircle2 size={52} color="#10b981" />
                : <XCircle size={52} color="#ef4444" />
              }
            </View>
            <Text style={[styles.heading, isAccept ? styles.headingGreen : styles.headingRed]}>
              Order {isAccept ? 'Accepted' : 'Rejected'}
            </Text>
            <Text style={styles.sub}>{message}</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <View style={styles.iconWrapAmber}>
              <XCircle size={52} color="#f59e0b" />
            </View>
            <Text style={[styles.heading, styles.headingAmber]}>Action Failed</Text>
            <Text style={styles.sub}>{message}</Text>
          </>
        )}

        <View style={styles.divider} />
        <Text style={styles.footer}>
          © {new Date().getFullYear()} Antigravity Security Solutions. If you received this in error, please ignore it.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: Platform.OS === 'web' ? 420 : '100%',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  brand: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrapGreen: { backgroundColor: '#f0fdf4' },
  iconWrapRed: { backgroundColor: '#fef2f2' },
  iconWrapAmber: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  headingGreen: { color: '#059669' },
  headingRed: { color: '#dc2626' },
  headingAmber: { color: '#d97706' },
  sub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    width: '100%',
    marginTop: 32,
    marginBottom: 16,
  },
  footer: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
