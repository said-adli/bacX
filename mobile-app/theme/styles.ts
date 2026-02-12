import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';

/**
 * Shared styles for Brainy mobile app
 * Implements glassmorphism and consistent design patterns
 */

export const typography = {
    // Font families - using system fonts that support Arabic
    fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
    }),

    // Font sizes
    sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },

    // Font weights
    weights: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
};

export const shadows = StyleSheet.create({
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    glass: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
});

export const commonStyles = StyleSheet.create({
    // Container styles
    container: {
        flex: 1,
        backgroundColor: colors.background.end,
    },

    safeArea: {
        flex: 1,
    },

    screenPadding: {
        paddingHorizontal: spacing.lg,
    },

    // Glass Card
    glassCard: {
        backgroundColor: colors.glass.background,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.glass.border,
        padding: spacing.lg,
        ...shadows.glass,
    },

    // Card variants
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border.light,
        padding: spacing.lg,
        ...shadows.md,
    },

    // Typography
    heading1: {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        textAlign: 'right' as const,
    },

    heading2: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        textAlign: 'right' as const,
    },

    heading3: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        textAlign: 'right' as const,
    },

    bodyText: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.normal,
        color: colors.text.secondary,
        textAlign: 'right' as const,
        lineHeight: 24,
    },

    smallText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.normal,
        color: colors.text.muted,
        textAlign: 'right' as const,
    },

    // Button styles
    buttonPrimary: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        ...shadows.md,
    },

    buttonPrimaryText: {
        color: colors.text.inverse,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
    },

    buttonSecondary: {
        backgroundColor: 'transparent',
        borderRadius: borderRadius.lg,
        borderWidth: 1.5,
        borderColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },

    buttonSecondaryText: {
        color: colors.primary,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
    },

    // Input styles
    input: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border.light,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        fontSize: typography.sizes.base,
        color: colors.text.primary,
        textAlign: 'right' as const,
    },

    inputFocused: {
        borderColor: colors.primary,
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: colors.border.light,
        marginVertical: spacing.lg,
    },

    // Row
    row: {
        flexDirection: 'row-reverse' as const,
        alignItems: 'center' as const,
    },

    rowSpaceBetween: {
        flexDirection: 'row-reverse' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
    },

    // Center
    center: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
});
