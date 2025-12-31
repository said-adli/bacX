import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '@/theme';

/**
 * Button Component
 * Primary and Secondary variants matching Brainy design
 */

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
            style={[
                styles.base,
                sizeStyles[size],
                variantStyles[variant],
                isDisabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.text.inverse : colors.primary}
                    size="small"
                />
            ) : (
                <>
                    {icon}
                    <Text
                        style={[
                            styles.text,
                            textSizeStyles[size],
                            textVariantStyles[variant],
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    text: {
        fontWeight: typography.weights.semibold,
        textAlign: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
});

const sizeStyles = StyleSheet.create({
    sm: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
    },
    md: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
    },
    lg: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing['2xl'],
        borderRadius: borderRadius.lg,
    },
});

const variantStyles = StyleSheet.create({
    primary: {
        backgroundColor: colors.primary,
        ...shadows.md,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
});

const textSizeStyles = StyleSheet.create({
    sm: {
        fontSize: typography.sizes.sm,
    },
    md: {
        fontSize: typography.sizes.base,
    },
    lg: {
        fontSize: typography.sizes.lg,
    },
});

const textVariantStyles = StyleSheet.create({
    primary: {
        color: colors.text.inverse,
    },
    secondary: {
        color: colors.primary,
    },
    ghost: {
        color: colors.primary,
    },
});
