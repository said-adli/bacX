import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Header, GlassCard, Button } from '@/components';
import { useLivePulse, useAuth } from '@/hooks';
import { db } from '@/lib/firebase';
import { colors, spacing, typography, borderRadius } from '@/theme';

/**
 * Live Stream Screen
 * Shows the live stream when admin is broadcasting
 */

const { width: screenWidth } = Dimensions.get('window');
const playerHeight = (screenWidth - 32) * (9 / 16); // 16:9 aspect ratio

export default function LiveScreen() {
    const { isLive, title, subject, loading: liveLoading } = useLivePulse();
    const { isSubscribed, isAuthenticated } = useAuth();
    const [youtubeId, setYoutubeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLive || !isSubscribed) {
            setYoutubeId(null);
            setLoading(false);
            return;
        }

        // Fetch secret stream ID for subscribed users
        const unsubscribe = db
            .collection('secret_stream')
            .doc('current')
            .onSnapshot(
                (doc) => {
                    if (doc.exists) {
                        setYoutubeId(doc.data()?.youtubeId || null);
                    } else {
                        setYoutubeId(null);
                    }
                    setLoading(false);
                },
                (err) => {
                    console.error('Secret stream error:', err);
                    setError('غير مصرح لك بمشاهدة البث');
                    setLoading(false);
                }
            );

        return () => unsubscribe();
    }, [isLive, isSubscribed]);

    const isDataLoading = liveLoading || loading;

    // Not authenticated
    if (!isAuthenticated) {
        return (
            <LinearGradient
                colors={[colors.background.start, colors.background.middle, colors.background.end]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.container} edges={['top']}>
                    <Header title="البث المباشر" />
                    <View style={styles.centered}>
                        <GlassCard style={styles.messageCard}>
                            <Text style={styles.messageTitle}>يرجى تسجيل الدخول</Text>
                            <Text style={styles.messageText}>
                                يجب تسجيل الدخول لمشاهدة البث المباشر
                            </Text>
                        </GlassCard>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // Loading
    if (isDataLoading) {
        return (
            <LinearGradient
                colors={[colors.background.start, colors.background.middle, colors.background.end]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.container} edges={['top']}>
                    <Header title="البث المباشر" />
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>جاري التحميل...</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // Not live
    if (!isLive) {
        return (
            <LinearGradient
                colors={[colors.background.start, colors.background.middle, colors.background.end]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.container} edges={['top']}>
                    <Header title="البث المباشر" />
                    <View style={styles.centered}>
                        <GlassCard style={styles.messageCard}>
                            <View style={styles.offlineIcon}>
                                <Text style={styles.offlineEmoji}>📺</Text>
                            </View>
                            <Text style={styles.messageTitle}>لا يوجد بث حالياً</Text>
                            <Text style={styles.messageText}>
                                سيتم إشعارك عند بدء البث القادم
                            </Text>
                        </GlassCard>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // Not subscribed
    if (!isSubscribed) {
        return (
            <LinearGradient
                colors={[colors.background.start, colors.background.middle, colors.background.end]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.container} edges={['top']}>
                    <Header title="البث المباشر" />
                    <View style={styles.centered}>
                        <GlassCard style={styles.messageCard}>
                            <View style={styles.lockIcon}>
                                <Text style={styles.lockEmoji}>🔒</Text>
                            </View>
                            <Text style={styles.messageTitle}>محتوى حصري</Text>
                            <Text style={styles.messageText}>
                                يتطلب اشتراك Premium للوصول إلى البث المباشر
                            </Text>
                            <Button
                                title="اشترك الآن"
                                onPress={() => { }}
                                style={styles.subscribeButton}
                            />
                        </GlassCard>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // Error
    if (error) {
        return (
            <LinearGradient
                colors={[colors.background.start, colors.background.middle, colors.background.end]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.container} edges={['top']}>
                    <Header title="البث المباشر" />
                    <View style={styles.centered}>
                        <GlassCard style={styles.messageCard}>
                            <Text style={styles.errorText}>{error}</Text>
                        </GlassCard>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // Live stream
    return (
        <LinearGradient
            colors={[colors.background.start, colors.background.middle, colors.background.end]}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header />

                <View style={styles.content}>
                    {/* Live Badge */}
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>مباشر الآن</Text>
                    </View>

                    {/* Video Player */}
                    <View style={styles.playerContainer}>
                        {youtubeId ? (
                            <YoutubePlayer
                                height={playerHeight}
                                width={screenWidth - 32}
                                videoId={youtubeId}
                                play={true}
                            />
                        ) : (
                            <View style={styles.playerPlaceholder}>
                                <ActivityIndicator size="large" color={colors.primary} />
                            </View>
                        )}
                    </View>

                    {/* Stream Info */}
                    <GlassCard style={styles.infoCard}>
                        <Text style={styles.streamTitle}>{title || 'البث المباشر'}</Text>
                        {subject && (
                            <View style={styles.subjectBadge}>
                                <Text style={styles.subjectText}>{subject}</Text>
                            </View>
                        )}
                    </GlassCard>
                </View>
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
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    loadingText: {
        fontSize: typography.sizes.base,
        color: colors.text.muted,
        marginTop: spacing.lg,
    },
    messageCard: {
        alignItems: 'center',
        padding: spacing['2xl'],
        maxWidth: 300,
    },
    offlineIcon: {
        marginBottom: spacing.lg,
    },
    offlineEmoji: {
        fontSize: 48,
    },
    lockIcon: {
        marginBottom: spacing.lg,
    },
    lockEmoji: {
        fontSize: 48,
    },
    messageTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    messageText: {
        fontSize: typography.sizes.base,
        color: colors.text.muted,
        textAlign: 'center',
        lineHeight: 24,
    },
    errorText: {
        fontSize: typography.sizes.base,
        color: colors.error,
        textAlign: 'center',
    },
    subscribeButton: {
        marginTop: spacing.xl,
        width: '100%',
    },
    liveBadge: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: spacing.sm,
        alignSelf: 'flex-end',
        marginBottom: spacing.md,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.live,
    },
    liveText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.live,
    },
    playerContainer: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    playerPlaceholder: {
        height: playerHeight,
        backgroundColor: colors.surface.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.lg,
    },
    infoCard: {
        alignItems: 'flex-end',
    },
    streamTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        textAlign: 'right',
    },
    subjectBadge: {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        marginTop: spacing.sm,
    },
    subjectText: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
});
