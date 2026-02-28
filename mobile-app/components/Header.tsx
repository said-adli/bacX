import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '@/theme';
import { LivePulse } from '@/components/ui/LivePulse';
import { useLivePulse } from '@/hooks/useLivePulse';

/**
 * Header Component
 * App header with live pulse indicator
 */

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    rightContent?: React.ReactNode;
}

export function Header({ title, showBack = false, rightContent }: HeaderProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { isLive, title: liveTitle } = useLivePulse();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                {/* Left side (back button or logo) */}
                <View style={styles.left}>
                    {showBack ? (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons
                                name="chevron-forward"
                                size={24}
                                color={colors.text.primary}
                            />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.logo}>
                            <Text style={styles.logoText}>B</Text>
                        </View>
                    )}
                </View>

                {/* Center (title or live indicator) */}
                <View style={styles.center}>
                    {title ? (
                        <Text style={styles.title} numberOfLines={1}>
                            {title}
                        </Text>
                    ) : isLive ? (
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/live')}
                            activeOpacity={0.8}
                        >
                            <LivePulse isLive={isLive} title={liveTitle || 'مباشر الآن'} />
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.brandName}>Brainy</Text>
                    )}
                </View>

                {/* Right side */}
                <View style={styles.right}>
                    {rightContent || (
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/profile')}
                            style={styles.profileButton}
                        >
                            <Ionicons
                                name="person-circle-outline"
                                size={28}
                                color={colors.text.secondary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.glass.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
        ...shadows.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        height: 56,
    },
    left: {
        width: 48,
        alignItems: 'flex-start',
    },
    center: {
        flex: 1,
        alignItems: 'center',
    },
    right: {
        width: 48,
        alignItems: 'flex-end',
    },
    logo: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 18,
        fontWeight: typography.weights.bold,
        color: colors.text.inverse,
    },
    brandName: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        textAlign: 'center',
    },
    backButton: {
        padding: spacing.xs,
    },
    profileButton: {
        padding: spacing.xs,
    },
});
