import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, spacing, typography } from '@/theme';

/**
 * LivePulse Component
 * Animated red pulsing indicator for when admin is live
 */

interface LivePulseProps {
    isLive: boolean;
    title?: string;
    compact?: boolean;
}

export function LivePulse({ isLive, title, compact = false }: LivePulseProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        if (isLive) {
            // Create pulsing animation
            const pulseLoop = Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(pulseAnim, {
                            toValue: 1.4,
                            duration: 800,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 0,
                            duration: 800,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 0.6,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            );

            pulseLoop.start();

            return () => pulseLoop.stop();
        }
    }, [isLive, pulseAnim, opacityAnim]);

    if (!isLive) {
        return null;
    }

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <View style={styles.dotContainer}>
                    <Animated.View
                        style={[
                            styles.pulseRing,
                            {
                                transform: [{ scale: pulseAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    />
                    <View style={styles.dot} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.dotContainer}>
                <Animated.View
                    style={[
                        styles.pulseRing,
                        {
                            transform: [{ scale: pulseAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                />
                <View style={styles.dot} />
            </View>
            <Text style={styles.text}>{title || 'مباشر الآن'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: 100,
    },
    compactContainer: {
        padding: spacing.xs,
    },
    dotContainer: {
        width: 12,
        height: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.live,
    },
    pulseRing: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.live,
    },
    text: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.live,
    },
});
