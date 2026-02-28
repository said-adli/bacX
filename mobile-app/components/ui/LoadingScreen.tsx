import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '@/theme';

/**
 * LoadingScreen Component
 * Full-screen loading state with Brainy branding
 */

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
    return (
        <LinearGradient
            colors={[colors.background.start, colors.background.middle, colors.background.end]}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logo}>
                    <Text style={styles.logoText}>B</Text>
                </View>

                {/* Loading indicator */}
                <ActivityIndicator
                    size="large"
                    color={colors.primary}
                    style={styles.spinner}
                />

                {/* Message */}
                {message && (
                    <Text style={styles.message}>{message}</Text>
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    logoText: {
        fontSize: 32,
        fontWeight: typography.weights.bold,
        color: colors.text.inverse,
    },
    spinner: {
        marginTop: 8,
    },
    message: {
        marginTop: 16,
        fontSize: typography.sizes.base,
        color: colors.text.muted,
        textAlign: 'center',
    },
});
