import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Header, GlassCard, Button } from '@/components';
import { useAuth } from '@/hooks';
import { db } from '@/lib/firebase';
import { colors, spacing, typography, borderRadius } from '@/theme';

/**
 * Lesson Screen
 * Video player for individual lessons
 */

const { width: screenWidth } = Dimensions.get('window');
const playerHeight = (screenWidth - 32) * (9 / 16);

interface LessonData {
    title: string;
    description: string;
    videoUrl: string;
    subject: string;
    isLocked: boolean;
    duration: string;
}

export default function LessonScreen() {
    const { id: lessonId } = useLocalSearchParams<{ id: string }>();
    const { isSubscribed } = useAuth();
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!lessonId) return;

        const fetchLesson = async () => {
            try {
                const doc = await db.collection('lessons').doc(lessonId).get();
                if (doc.exists) {
                    setLesson(doc.data() as LessonData);
                } else {
                    setError('الدرس غير موجود');
                }
            } catch (err) {
                console.error('Lesson fetch error:', err);
                setError('حدث خطأ في تحميل الدرس');
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [lessonId]);

    // Loading
    if (loading) {
        return (
            <LinearGradient
                colors={[colors.background.start, colors.background.middle, colors.background.end]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.container} edges={['top']}>
                    <Header title="الدرس" showBack />
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // Error
    if (error || !lesson) {
        return (
            <LinearGradient
                colors={[colors.background.start, colors.background.middle, colors.background.end]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.container} edges={['top']}>
                    <Header title="الدرس" showBack />
                    <View style={styles.centered}>
                        <GlassCard style={styles.errorCard}>
                            <Text style={styles.errorText}>{error || 'الدرس غير موجود'}</Text>
                        </GlassCard>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // Premium content check
    const canAccess = !lesson.isLocked || isSubscribed;

    if (!canAccess) {
        return (
            <LinearGradient
                colors={[colors.background.start, colors.background.middle, colors.background.end]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.container} edges={['top']}>
                    <Header title={lesson.title} showBack />
                    <View style={styles.centered}>
                        <GlassCard style={styles.lockedCard}>
                            <Text style={styles.lockEmoji}>🔒</Text>
                            <Text style={styles.lockedTitle}>محتوى حصري</Text>
                            <Text style={styles.lockedText}>
                                هذا الدرس متاح لمشتركي Premium فقط
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

    // Extract YouTube ID from URL
    const getYoutubeId = (url: string): string | null => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : url; // Return url as-is if it's already an ID
    };

    const videoId = getYoutubeId(lesson.videoUrl);

    return (
        <LinearGradient
            colors={[colors.background.start, colors.background.middle, colors.background.end]}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header showBack />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Video Player */}
                    <View style={styles.playerContainer}>
                        {videoId ? (
                            <YoutubePlayer
                                height={playerHeight}
                                width={screenWidth - 32}
                                videoId={videoId}
                                play={false}
                            />
                        ) : (
                            <View style={styles.playerPlaceholder}>
                                <Text style={styles.placeholderText}>الفيديو غير متوفر</Text>
                            </View>
                        )}
                    </View>

                    {/* Lesson Info */}
                    <GlassCard style={styles.infoCard}>
                        <Text style={styles.lessonTitle}>{lesson.title}</Text>

                        <View style={styles.metaRow}>
                            <View style={styles.subjectBadge}>
                                <Text style={styles.subjectText}>{lesson.subject}</Text>
                            </View>
                            {lesson.duration && (
                                <Text style={styles.duration}>{lesson.duration}</Text>
                            )}
                        </View>

                        {lesson.description && (
                            <>
                                <View style={styles.divider} />
                                <Text style={styles.sectionTitle}>الوصف</Text>
                                <Text style={styles.description}>{lesson.description}</Text>
                            </>
                        )}
                    </GlassCard>

                    <View style={styles.footer} />
                </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    errorCard: {
        alignItems: 'center',
        padding: spacing['2xl'],
    },
    errorText: {
        fontSize: typography.sizes.base,
        color: colors.error,
        textAlign: 'center',
    },
    lockedCard: {
        alignItems: 'center',
        padding: spacing['2xl'],
        maxWidth: 300,
    },
    lockEmoji: {
        fontSize: 48,
        marginBottom: spacing.lg,
    },
    lockedTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    lockedText: {
        fontSize: typography.sizes.base,
        color: colors.text.muted,
        textAlign: 'center',
        lineHeight: 24,
    },
    subscribeButton: {
        marginTop: spacing.xl,
        width: '100%',
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
    placeholderText: {
        fontSize: typography.sizes.base,
        color: colors.text.muted,
    },
    infoCard: {
        alignItems: 'flex-end',
    },
    lessonTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        textAlign: 'right',
        marginBottom: spacing.md,
    },
    metaRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: spacing.md,
    },
    subjectBadge: {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    subjectText: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    duration: {
        fontSize: typography.sizes.sm,
        color: colors.text.muted,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: colors.border.light,
        marginVertical: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        textAlign: 'right',
        marginBottom: spacing.sm,
        alignSelf: 'flex-end',
    },
    description: {
        fontSize: typography.sizes.base,
        color: colors.text.secondary,
        textAlign: 'right',
        lineHeight: 24,
    },
    footer: {
        height: spacing['2xl'],
    },
});
