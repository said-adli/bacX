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
 * Login Screen
 * Email/Password authentication
 */
export default function LoginScreen() {
    const router = useRouter();
    const { login, loading, error } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const handleLogin = async () => {
        setLocalError('');

        if (!email.trim()) {
            setLocalError('الرجاء إدخال البريد الإلكتروني');
            return;
        }
        if (!password) {
            setLocalError('الرجاء إدخال كلمة المرور');
            return;
        }

        try {
            await login(email.trim(), password);
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
                            <Text style={styles.tagline}>منصتك للتفوق في البكالوريا</Text>
                        </View>

                        {/* Login Card */}
                        <GlassCard style={styles.card}>
                            <Text style={styles.title}>تسجيل الدخول</Text>

                            {/* Error Message */}
                            {displayError && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{displayError}</Text>
                                </View>
                            )}

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

                            {/* Login Button */}
                            <Button
                                title="تسجيل الدخول"
                                onPress={handleLogin}
                                loading={loading}
                                style={styles.button}
                            />

                            {/* Signup Link */}
                            <View style={styles.linkContainer}>
                                <Text style={styles.linkText}>ليس لديك حساب؟ </Text>
                                <Link href="/(auth)/signup" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.link}>إنشاء حساب</Text>
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
        marginBottom: spacing['3xl'],
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    logoText: {
        fontSize: 40,
        fontWeight: typography.weights.bold,
        color: colors.text.inverse,
    },
    brandName: {
        fontSize: typography.sizes['3xl'],
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    tagline: {
        fontSize: typography.sizes.base,
        color: colors.text.muted,
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
        marginBottom: spacing.lg,
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
