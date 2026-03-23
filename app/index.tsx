import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, useWindowDimensions, Platform, Modal, ScrollView } from 'react-native';
import { Shield, Mail, Lock, Eye, EyeOff, Smartphone, Globe, ShieldCheck, Activity, XCircle, Building2, User, Phone } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from './client';
import { useAuth } from './AuthContext';
//import { Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeInLeft
} from 'react-native-reanimated';


export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [subscribeVisible, setSubscribeVisible] = useState(false);
  const [subForm, setSubForm] = useState({
    companyName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: ''
  });
  const [subShowPw, setSubShowPw] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const [registeredData, setRegisteredData] = useState<{
    companyCode: string;
    email: string;
  } | null>(null);

  const handleFinish = async () => {
    if (!subForm.companyName || !subForm.adminEmail || !subForm.adminPassword) {
      setSubError('Company name, email and password are required.');
      return;
    }

    setSubLoading(true);
    setSubError('');

    try {
      const res = await API.post('/auth/register', subForm);

      setRegisteredData({
        companyCode: res.data.companyCode,
        email: res.data.email
      });

      setSubscribeVisible(false);
      setSuccessVisible(true);

    } catch (err: any) {
      setSubError(
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed'
      );
    } finally {
      setSubLoading(false);
    }
  };

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    companyCode: ''
  });
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = windowWidth > 800 && Platform.OS === 'web';

  const scrollY = useSharedValue(0);

  useEffect(() => {
    if (isLargeScreen) {
      scrollY.value = withRepeat(
        withTiming(-1000, {
          duration: 40000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      scrollY.value = 0;
    }
  }, [isLargeScreen]);

  const animatedScrollStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value }],
  }));
  const updateSub = (field: string, value: string) => {
    setSubError('');
    setSubForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleLogin = async () => {

    setLoading(true);

    try {
      console.log("REQUEST BODY:", loginData);

      const res = await API.post('/auth/login', loginData);

      console.log("RESPONSE DATA:", res.data);

      await login(res.data);

      router.replace('/portal');

    } catch (err: any) {
      console.error("FULL ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed";

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* LEFT PANEL: Form */}
      <View style={[styles.leftPanel, !isLargeScreen && styles.fullPanel, { position: 'relative' }]}>
        <Animated.View entering={FadeInLeft.duration(1000)} style={styles.formContainer}>
          <View style={styles.logoRow}>
            <View style={styles.logoDot}>
              <Shield size={24} color="#f97316" />
            </View>
            <Text style={styles.logoText}>ShieldGuard</Text>
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue monitoring your perimeter.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                placeholder="guard.id@shieldguard.com"
                style={styles.input}
                value={loginData.email}
                onChangeText={(text) =>
                  setLoginData(prev => ({ ...prev, email: text }))
                }
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Code</Text>
            <View style={styles.inputWrapper}>
              <Building2 size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter company code"
                style={styles.input}
                value={loginData.companyCode}
                onChangeText={(text) =>
                  setLoginData(prev => ({ ...prev, companyCode: text }))
                }
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity><Text style={styles.forgotLink}>Forgot Password?</Text></TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={loginData.password}
                onChangeText={(text) =>
                  setLoginData(prev => ({ ...prev, password: text }))
                }
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signInButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.signInButtonText}>
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialButtons}>
            <SocialButton icon={<FontAwesome5 name="google" size={20} color="#000" />} label="Continue with Google" />
            <SocialButton icon={<FontAwesome5 name="facebook" size={20} color="#1877F2" />} label="Continue with Facebook" />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to ShieldGuard? </Text>
            <TouchableOpacity><Text style={styles.signUpLink}>Sign Up</Text></TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Subscribe button ── */}
        <TouchableOpacity style={styles.subscribeBtn} onPress={() => setSubscribeVisible(true)}>
          <Text style={styles.subscribeBtnText}>✦ Subscribe</Text>
        </TouchableOpacity>
      </View>

      {/* ── Subscribe Modal ── */}
      <Modal visible={subscribeVisible} transparent animationType="fade" onRequestClose={() => setSubscribeVisible(false)}>
        <View style={styles.subOverlay}>
          <View style={styles.subModal}>
            <View style={styles.subHeader}>
              <View>
                <Text style={styles.subTitle}>Get Started</Text>
                <Text style={styles.subSubtitle}>Create your organisation account</Text>
              </View>
              <TouchableOpacity onPress={() => setSubscribeVisible(false)}>
                <XCircle size={26} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.subBody} keyboardShouldPersistTaps="handled">
              <SubField icon={<Building2 size={16} color="#94a3b8" />} label="Company Name" value={subForm.companyName} onChange={(v: string) => updateSub('companyName', v)} placeholder="Acme Security Ltd." />
              <SubField icon={<User size={16} color="#94a3b8" />} label="Admin Name" value={subForm.adminName} onChange={(v: string) => updateSub('adminName', v)} placeholder="John Doe" />
              <SubField icon={<Mail size={16} color="#94a3b8" />} label="Admin Email" value={subForm.adminEmail} onChange={(v: string) => updateSub('adminEmail', v)} placeholder="admin@company.com" keyboardType="email-address" />
              <SubField icon={<Lock size={16} color="#94a3b8" />} label="Password" value={subForm.adminPassword} onChange={(v: string) => updateSub('adminPassword', v)} placeholder="••••••••" secureTextEntry={!subShowPw}
                right={<TouchableOpacity onPress={() => setSubShowPw(p => !p)}>{subShowPw ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}</TouchableOpacity>} />
              <SubField icon={<Phone size={16} color="#94a3b8" />} label="Admin Phone" value={subForm.adminPhone} onChange={(v: string) => updateSub('adminPhone', v)} placeholder="+91 9XXXXXXXXX" keyboardType="phone-pad" />
            </ScrollView>

            {subError ? <Text style={styles.subError}>{subError}</Text> : null}
            <View style={styles.subFooter}>
              <TouchableOpacity style={[styles.finishBtn, subLoading && styles.finishBtnDisabled]} onPress={handleFinish} disabled={subLoading}>
                <Text style={styles.finishBtnText}>{subLoading ? 'Registering…' : 'Finish →'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Success / Company Code Modal ── */}
      <Modal visible={successVisible} transparent animationType="fade" onRequestClose={() => setSuccessVisible(false)}>
        <View style={styles.subOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>🎉</Text>
            </View>
            <Text style={styles.successTitle}>You're registered!</Text>
            <Text style={styles.successSub}>Your organisation account is ready. Use the code below to invite team members.</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Company Code</Text>
              <Text style={styles.codeValue}>{registeredData?.companyCode}</Text>
            </View>
            <Text style={styles.codeEmail}>{registeredData?.email}</Text>
            <TouchableOpacity style={styles.finishBtn} onPress={() => setSuccessVisible(false)}>
              <Text style={styles.finishBtnText}>Go to Login →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* RIGHT PANEL: Scrolling Features (Desktop Only) */}
      {isLargeScreen && (
        <View style={styles.rightPanel}>
          <Animated.View style={[styles.scrollingContent, animatedScrollStyle]}>
            <FeatureCard title="2-5x" subtitle="Faster Response" detail="Across all monitored sectors" icon={<Activity size={40} color="#f97316" />} />
            <FeatureCard title="0%" subtitle="Security Breach" detail="Universal coverage system" icon={<ShieldCheck size={40} color="#f97316" />} />
            <FeatureCard title="50M+" subtitle="Checkpoints" detail="Verified daily globally" icon={<Globe size={40} color="#f97316" />} />
            <FeatureCard title="100%" subtitle="Uptime" detail="Critical infrastructure ready" icon={<Smartphone size={40} color="#f97316" />} />
            {/* Duplicates for seamless loop */}
            <FeatureCard title="2-5x" subtitle="Faster Response" detail="Across all monitored sectors" icon={<Activity size={40} color="#f97316" />} />
            <FeatureCard title="0%" subtitle="Security Breach" detail="Universal coverage system" icon={<ShieldCheck size={40} color="#f97316" />} />
          </Animated.View>
        </View>
      )}
    </View>
  );
}

function SocialButton({ icon, label }: any) {
  return (
    <TouchableOpacity style={styles.socialBtn}>
      {icon}
      <Text style={styles.socialBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SubField({ icon, label, value, onChange, placeholder, secureTextEntry, keyboardType, right }: any) {
  return (
    <View style={styles.subInputGroup}>
      <Text style={styles.subLabel}>{label}</Text>
      <View style={styles.subInputWrapper}>
        <View style={styles.subInputIcon}>{icon}</View>
        <TextInput
          style={styles.subInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="none"
        />
        {right}
      </View>
    </View>
  );
}

function FeatureCard({ title, subtitle, detail, icon }: any) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureInfo}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
        <Text style={styles.featureDetail}>{detail}</Text>
      </View>
      <View style={styles.featureIconBox}>
        {icon}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  leftPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  rightPanel: {
    flex: 0.65,
    backgroundColor: '#fffcf9',
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
  },
  fullPanel: {
    flex: 1,
  },
  formContainer: {
    width: '100%',
    maxWidth: 420,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 40,
  },
  logoDot: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerTextContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  forgotLink: {
    fontSize: 14,
    color: '#64748b',
    textDecorationLine: 'underline',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  signInButton: {
    backgroundColor: '#ea580c',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  dividerText: {
    color: '#94a3b8',
    marginHorizontal: 12,
    fontSize: 13,
  },
  socialButtons: {
    gap: 12,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  signUpLink: {
    color: '#ea580c',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollingContent: {
    padding: 40,
    paddingTop: 100,
    gap: 24,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f8fafc',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ea580c',
    lineHeight: 52,
  },
  featureSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  featureDetail: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  featureIconBox: {
    width: 80,
    height: 80,
    backgroundColor: '#fff7ed',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── Subscribe button
  subscribeBtn: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ea580c',
  },
  // ── Subscribe modal
  subOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subModal: {
    width: 440,
    maxWidth: '95%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  subBody: {
    padding: 24,
    gap: 16,
  },
  subInputGroup: {
    gap: 4,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  subInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    backgroundColor: '#f8fafc',
    gap: 8,
  },
  subInputIcon: {
    justifyContent: 'center',
  },
  subInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  subFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'flex-end',
  },
  finishBtn: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  finishBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  finishBtnDisabled: {
    opacity: 0.6,
  },
  subError: {
    marginHorizontal: 24,
    marginTop: 8,
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
  },
  // ── Success modal
  successModal: {
    width: 360,
    maxWidth: '92%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  successIconText: {
    fontSize: 36,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  codeBox: {
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#fed7aa',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginVertical: 8,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ea580c',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ea580c',
    letterSpacing: 4,
  },
  codeEmail: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 8,
  },
});
