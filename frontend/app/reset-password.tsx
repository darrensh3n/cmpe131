import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(true);
  const [exchangeError, setExchangeError] = useState('');

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  // Exchange the recovery code for a session when the screen mounts
  useEffect(() => {
    async function exchangeCode() {
      try {
        const url = await Linking.getInitialURL();
        if (!url) { setExchangeError('Invalid reset link.'); return; }
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) setExchangeError(error.message);
      } finally {
        setIsExchanging(false);
      }
    }
    exchangeCode();
  }, []);

  async function handleReset() {
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      await supabase.auth.signOut();
      router.replace('/(auth)/login' as any);
    }
  }

  if (isExchanging) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.blue} />
        <Text style={styles.loadingText}>Verifying reset link…</Text>
      </SafeAreaView>
    );
  }

  if (exchangeError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.exchangeErrorText}>{exchangeError}</Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login' as any)} activeOpacity={0.7} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#050D1A', '#091E3A', '#0A3060', '#0055A2']}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#FFFFFF', '#F4F7FC']}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
          />
          <View style={styles.cardContent}>
            <View style={styles.iconRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed-outline" size={28} color={Colors.blue} />
              </View>
            </View>

            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>Choose a strong password for your SJSU account.</Text>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>New Password</Text>
              <View style={[styles.inputRow, error && password.length < 6 ? styles.inputError : null]}>
                <TextInput
                  style={styles.inputInner}
                  placeholder="At least 6 characters"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={t => { setPassword(t); setError(''); }}
                  textContentType="newPassword"
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn} activeOpacity={0.7} hitSlop={8}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputRow, error && password !== confirmPassword ? styles.inputError : null]}>
                <TextInput
                  style={styles.inputInner}
                  placeholder="Re-enter your password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={confirmPassword}
                  onChangeText={t => { setConfirmPassword(t); setError(''); }}
                  onSubmitEditing={handleReset}
                  returnKeyType="go"
                  textContentType="newPassword"
                />
                <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn} activeOpacity={0.7} hitSlop={8}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              onPress={handleReset}
              onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
              onPressOut={() => { btnScale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
              disabled={isLoading}
            >
              <Animated.View style={[styles.buttonWrapper, btnStyle]}>
                <LinearGradient
                  colors={[Colors.goldLight, Colors.gold, Colors.goldDark]}
                  locations={[0, 0.5, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  {isLoading
                    ? <ActivityIndicator color="#1A0F00" />
                    : <Text style={styles.buttonText}>Update Password →</Text>
                  }
                </LinearGradient>
              </Animated.View>
            </Pressable>

            <TouchableOpacity onPress={() => router.replace('/(auth)/login' as any)} activeOpacity={0.7} style={styles.cancelWrapper}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050D1A',
  },
  safe: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.offWhite,
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  loadingText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  exchangeErrorText: {
    fontSize: 15,
    color: Colors.error,
    textAlign: 'center',
    lineHeight: 22,
  },
  backLink: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.blue,
  },
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  cardContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  fieldWrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.offWhite,
    paddingHorizontal: Spacing.md,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    paddingLeft: Spacing.sm,
    paddingVertical: 4,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  buttonWrapper: {
    borderRadius: Radius.md,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
    marginTop: Spacing.xs,
  },
  button: {
    borderRadius: Radius.md,
    paddingVertical: 17,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A0F00',
    letterSpacing: 0.5,
  },
  cancelWrapper: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
