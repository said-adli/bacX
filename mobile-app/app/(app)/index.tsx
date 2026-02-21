import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth, useLivePulse } from '@/hooks';
import { Header, GlassCard, LivePulse } from '@/components';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { db } from '@/lib/firebase';

/**
 * Dashboard Screen
 * Main home screen with poetry, countdown, agenda, and feed
 */

// Weekly schedule (matching web)
const weeklySchedule = [
    { day: 'الأحد', time: '17:00', subject: 'الرياضيات', topic: 'الدوال العددية', status: 'upcoming' },
    { day: 'الإثنين', time: '17:00', subject: 'الفيزياء', topic: 'التحولات النووية', status: 'upcoming' },
    { day: 'الثلاثاء', time: '18:00', subject: 'العلوم', topic: 'التركيب الضوئي', status: 'completed' },
    { day: 'الأربعاء', time: '17:00', subject: 'الرياضيات', topic: 'الأعداد المركبة', status: 'upcoming' },
    { day: 'الخميس', time: '17:00', subject: 'الفيزياء', topic: 'الظواهر الكهربائية', status: 'upcoming' },
];

interface Announcement {
    id: string;
    content: string;
    createdAt: { toDate: () => Date };
}

export default function DashboardScreen() {
    const { userData } = useAuth();
    const { isLive, title: liveTitle } = useLivePulse();
    const [refreshing, setRefreshing] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    const bacDate = new Date('2025-06-01T08:00:00');
    // Calculate initial days left directly in state initializer
    const [daysLeft] = useState(() => {
        const now = new Date();
        return Math.max(0, differenceInDays(bacDate, now));
    });

    const displayName = userData?.displayName?.split(' ')[0] || 'طالب';

    useEffect(() => {
        // Listen to announcements
        const unsubscribe = db
            .collection('announcements')
            .orderBy('createdAt', 'desc')
            .limit(3)
            .onSnapshot(
                (snapshot) => {
                    const items = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Announcement[];
                    setAnnouncements(items);
                },
                (error) => console.error('Announcements error:', error)
            );

        return () => unsubscribe();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate refresh
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    // Calculate progress
    const startDate = new Date('2024-09-01');
    const totalDays = differenceInDays(bacDate, startDate);
    const daysElapsed = totalDays - daysLeft;
    const progressPercent = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

    return (
        <LinearGradient
            colors={[colors.background.start, colors.background.middle, colors.background.end]}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Welcome */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>مرحباً، {displayName} 👋</Text>
                        <Text style={styles.welcomeSubtitle}>استمر في رحلة التفوق</Text>
                    </View>

                    {/* Live Alert */}
                    {isLive && (
                        <GlassCard style={styles.liveCard}>
                            <View style={styles.liveContent}>
                                <LivePulse isLive={isLive} compact />
                                <View style={styles.liveInfo}>
                                    <Text style={styles.liveTitle}>{liveTitle || 'البث المباشر'}</Text>
                                    <Text style={styles.liveSubtitle}>انضم الآن!</Text>
                                </View>
                            </View>
                        </GlassCard>
                    )}

                    {/* Poetry Block */}
                    <GlassCard style={styles.poetryCard}>
                        <Ionicons
                            name="sparkles"
                            size={20}
                            color={colors.text.muted}
                            style={styles.poetryIcon}
                        />
                        <Text style={styles.poetryText}>
                            العِلمُ يَرفَعُ بَيْتاً لا عِمادَ لَهُ{'\n'}
                            والجَهلُ يَهدِمُ بَيْتَ العِزِّ والشَّرَفِ
                        </Text>
                        <Text style={styles.poetryAuthor}>— الإمام علي بن أبي طالب</Text>
                    </GlassCard>

                    {/* Countdown Block */}
                    <GlassCard style={styles.block}>
                        <View style={styles.blockHeader}>
                            <Ionicons name="time-outline" size={18} color={colors.text.muted} />
                            <Text style={styles.blockTitle}>العد التنازلي</Text>
                        </View>

                        <View style={styles.countdownRow}>
                            <View>
                                <Text style={styles.daysNumber}>{daysLeft}</Text>
                                <Text style={styles.daysLabel}>يوم متبقي للبكالوريا</Text>
                            </View>
                            <Text style={styles.bacDate}>
                                {format(bacDate, 'd MMMM yyyy', { locale: ar })}
                            </Text>
                        </View>

                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                        </View>

                        <View style={styles.progressLabels}>
                            <Text style={styles.progressLabel}>سبتمبر 2024</Text>
                            <Text style={styles.progressLabel}>{Math.round(progressPercent)}% من السنة</Text>
                            <Text style={styles.progressLabel}>جوان 2025</Text>
                        </View>
                    </GlassCard>

                    {/* Agenda Block */}
                    <GlassCard style={styles.block}>
                        <View style={styles.blockHeader}>
                            <Ionicons name="calendar-outline" size={18} color={colors.text.muted} />
                            <Text style={styles.blockTitle}>البرنامج الأسبوعي</Text>
                        </View>

                        {weeklySchedule.map((item, index) => (
                            <View key={index} style={styles.agendaRow}>
                                <Text style={styles.agendaTime}>{item.time}</Text>
                                <Text style={styles.agendaSubject}>{item.subject}</Text>
                                <Text style={styles.agendaTopic}>{item.topic}</Text>
                                <View style={[
                                    styles.statusBadge,
                                    item.status === 'completed' ? styles.statusComplete : styles.statusUpcoming
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        item.status === 'completed' ? styles.statusTextComplete : styles.statusTextUpcoming
                                    ]}>
                                        {item.status === 'completed' ? 'مكتمل' : 'قادم'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </GlassCard>

                    {/* Announcements Block */}
                    <GlassCard style={styles.block}>
                        <View style={styles.blockHeader}>
                            <Ionicons name="notifications-outline" size={18} color={colors.text.muted} />
                            <Text style={styles.blockTitle}>الإعلانات</Text>
                        </View>

                        {announcements.length === 0 ? (
                            <Text style={styles.emptyText}>لا توجد إعلانات</Text>
                        ) : (
                            announcements.map((ann) => (
                                <View key={ann.id} style={styles.announcementRow}>
                                    <Ionicons name="megaphone-outline" size={16} color={colors.text.muted} />
                                    <View style={styles.announcementContent}>
                                        <Text style={styles.announcementText}>{ann.content}</Text>
                                        <Text style={styles.announcementTime}>
                                            {ann.createdAt?.toDate
                                                ? format(ann.createdAt.toDate(), 'd MMM، HH:mm', { locale: ar })
                                                : 'الآن'}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </GlassCard>

                    <View style={styles.bottomPadding} />
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
    welcomeSection: {
        marginBottom: spacing.xl,
    },
    welcomeTitle: {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        textAlign: 'right',
    },
    welcomeSubtitle: {
        fontSize: typography.sizes.base,
        color: colors.text.muted,
        textAlign: 'right',
        marginTop: spacing.xs,
    },
    liveCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderColor: colors.live,
        marginBottom: spacing.lg,
    },
    liveContent: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: spacing.md,
    },
    liveInfo: {
        flex: 1,
    },
    liveTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        textAlign: 'right',
    },
    liveSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.live,
        textAlign: 'right',
    },
    poetryCard: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    poetryIcon: {
        marginBottom: spacing.md,
    },
    poetryText: {
        fontSize: typography.sizes.lg,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 32,
    },
    poetryAuthor: {
        fontSize: typography.sizes.sm,
        color: colors.text.muted,
        marginTop: spacing.md,
    },
    block: {
        marginBottom: spacing.lg,
    },
    blockHeader: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    blockTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
    },
    countdownRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    daysNumber: {
        fontSize: 40,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
    },
    daysLabel: {
        fontSize: typography.sizes.sm,
        color: colors.text.muted,
        textAlign: 'right',
    },
    bacDate: {
        fontSize: typography.sizes.sm,
        color: colors.text.muted,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.surface.elevated,
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    progressLabels: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
    },
    progressLabel: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
    },
    agendaRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    agendaTime: {
        width: 50,
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
        fontVariant: ['tabular-nums'],
        textAlign: 'right',
    },
    agendaSubject: {
        width: 70,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.text.primary,
        textAlign: 'right',
        marginRight: spacing.md,
    },
    agendaTopic: {
        flex: 1,
        fontSize: typography.sizes.sm,
        color: colors.text.muted,
        textAlign: 'right',
        marginRight: spacing.md,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    statusComplete: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    statusUpcoming: {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
    },
    statusText: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
    },
    statusTextComplete: {
        color: colors.success,
    },
    statusTextUpcoming: {
        color: colors.primary,
    },
    emptyText: {
        fontSize: typography.sizes.sm,
        color: colors.text.muted,
        textAlign: 'center',
        paddingVertical: spacing.lg,
    },
    announcementRow: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    announcementContent: {
        flex: 1,
    },
    announcementText: {
        fontSize: typography.sizes.sm,
        color: colors.text.primary,
        textAlign: 'right',
    },
    announcementTime: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
        textAlign: 'right',
        marginTop: spacing.xs,
    },
    bottomPadding: {
        height: spacing['2xl'],
    },
});
