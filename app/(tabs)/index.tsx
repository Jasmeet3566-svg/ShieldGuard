import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Rocket, Zap, Shield, Layout } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 800 });
    scale.value = withSpring(1);
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0c', '#16161a']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.cardContainer, cardStyle]}>
          <View style={styles.glassCard}>
            <Animated.View style={[styles.iconContainer, iconStyle]}>
              <Rocket size={64} color="#8b5cf6" />
            </Animated.View>

            <Text style={styles.title}>Future Unified App</Text>
            <Text style={styles.subtitle}>
              Experience the pinnacle of modern design with our high-performance Unified React Native application.
            </Text>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => setCount(c => c + 1)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Interactions: {count}</Text>
            </TouchableOpacity>

            <View style={styles.featuresGrid}>
              <FeatureItem 
                icon={<Zap size={24} color="#8b5cf6" />} 
                title="Unified Power" 
                desc="One codebase serving both Web and Mobile seamlessly." 
              />
              <FeatureItem 
                icon={<Shield size={24} color="#8b5cf6" />} 
                title="Secure App" 
                desc="Enterprise mobile security patterns implemented." 
              />
              <FeatureItem 
                icon={<Layout size={24} color="#8b5cf6" />} 
                title="Modern UI" 
                desc="Premium glassmorphic aesthetic for all platforms." 
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

function FeatureItem({ icon, title, desc }: FeatureItemProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => (scale.value = withSpring(1.05))}
      onPressOut={() => (scale.value = withSpring(1))}
    >
      <Animated.View style={[styles.featureItem, animatedStyle]}>
        <View style={styles.featureIcon}>{icon}</View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  glassCard: {
    padding: 30,
    borderRadius: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  featuresGrid: {
    width: '100%',
    gap: 16,
  },
  featureItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureIcon: {
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
});
