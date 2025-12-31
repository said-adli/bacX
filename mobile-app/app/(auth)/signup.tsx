import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks';
import { Button, GlassCard } from '@/components';
import { colors, spacing, typography, borderRadius } from '@/theme';

/**
 * Signup Screen
 * Create new account with email/password
 */
export default function SignupScreen() {
  const router = useRouter();
  const { signup, loading, error } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSignup = async () => {
    setLocalError('');
    
    if (!displayName.trim()) {
      setLocalError('الرجاء إدخال الاسم');
      return;
    }
    if (!email.trim()) {
      setLocalError('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    if (!password) {
      setLocalError('الرجاء إدخال كلمة المرور');
      return;
    }
    if (password.length < 6) {
      setLocalError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('كلمتا المرور غير متطابقتين');
      return;
    }

    try {
      await signup(email.trim(), password, displayName.trim());
      router.replace('/(app)');
    } catch {
      // Error is handled by AuthProvider
    }
  };

  const displayError = localError || error;

  return (
    <LinearGradient
      colors={[colors.background.start, colors.background.middle, colors.background.end]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>B</Text>
              </View>
              <Text style={styles.brandName}>Brainy</Text>
            </View>

            {/* Signup Card */}
            <GlassCard style={styles.card}>
              <Text style={styles.title}>إنشاء حساب</Text>

              {/* Error Message */}
              {displayError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{displayError}</Text>
                </View>
              )}

              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>الاسم الكامل</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="أدخل اسمك"
                  placeholderTextColor={colors.text.muted}
                  autoCapitalize="words"
                  textAlign="right"
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>البريد الإلكتروني</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textAlign="right"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>كلمة المرور</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.muted}
                  secureTextEntry
                  textAlign="right"
                />
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>تأكيد كلمة المرور</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.muted}
                  secureTextEntry
                  textAlign="right"
                />
              </View>

              {/* Signup Button */}
              <Button
                title="إنشاء حساب"
                onPress={handleSignup}
                loading={loading}
                style={styles.button}
              />

              {/* Login Link */}
              <View style={styles.linkContainer}>
                <Text style={styles.linkText}>لديك حساب بالفعل؟ </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}>تسجيل الدخول</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  brandName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  card: {
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  input: {
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  button: {
    marginTop: spacing.md,
  },
  linkContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  linkText: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
  },
  link: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});
