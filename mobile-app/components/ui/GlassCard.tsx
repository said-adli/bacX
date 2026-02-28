import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, borderRadius, spacing, shadows } from '@/theme';

/**
 * GlassCard Component
 * Implements Brainy glassmorphism design:
 * - bg-white/80
 * - #DBEAFE border
 * - 10px blur
 */

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    variant?: 'default' | 'elevated' | 'flat';
}

export function GlassCard({
    children,
    style,
    intensity = 80,
    variant = 'default',
}: GlassCardProps) {
    return (
        <View style={[styles.wrapper, variantStyles[variant], style]}>
            <BlurView
                intensity={intensity}
                tint="light"
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.glass.border,
        overflow: 'hidden',
        backgroundColor: colors.glass.background,
    },
    content: {
        padding: spacing.lg,
    },
});

const variantStyles = StyleSheet.create({
    default: {
        ...shadows.glass,
    },
    elevated: {
        ...shadows.lg,
        borderColor: colors.border.light,
    },
    flat: {
        shadowOpacity: 0,
        elevation: 0,
    },
});
