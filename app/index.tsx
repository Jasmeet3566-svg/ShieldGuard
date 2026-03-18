import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Dimensions, Platform, ScrollView, Image } from 'react-native';
import { Shield, Mail, Lock, Eye, EyeOff, Facebook, Chrome as Google, Smartphone, Globe, ShieldCheck, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  FadeInLeft,
  FadeInRight 
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const IS_LARGE_SCREEN = isWeb && width > 800;

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
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
    }
  }, []);

  const animatedScrollStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value }],
  }));

  const handleLogin = () => {
    router.replace('/portal');
  };

  return (
    <View style={styles.container}>
      {/* LEFT PANEL: Form */}
      <View style={[styles.leftPanel, !isLargeScreen && styles.fullPanel]}>
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
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialButtons}>
            <SocialButton icon={<Google size={20} color="#000" />} label="Continue with Google" />
            <SocialButton icon={<Facebook size={20} color="#1877F2" />} label="Continue with Facebook" />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to ShieldGuard? </Text>
            <TouchableOpacity><Text style={styles.signUpLink}>Sign Up</Text></TouchableOpacity>
          </View>
        </Animated.View>
      </View>

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
});
