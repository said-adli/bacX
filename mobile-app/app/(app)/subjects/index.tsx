import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Header, SubjectCard, GlassCard } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { db } from '@/lib/firebase';

/**
 * Subjects List Screen
 * Displays all available subjects with REAL lesson counts from Firestore
 */

// Subject metadata only - counts come from database
const subjectMeta = [
    { id: 'math', name: 'الرياضيات', icon: 'calculator-outline' as const },
    { id: 'physics', name: 'الفيزياء', icon: 'flask-outline' as const },
    { id: 'science', name: 'العلوم الطبيعية', icon: 'leaf-outline' as const },
    { id: 'arabic', name: 'الأدب العربي', icon: 'book-outline' as const },
    { id: 'languages', name: 'اللغات الأجنبية', icon: 'language-outline' as const },
    { id: 'philosophy', name: 'الفلسفة', icon: 'school-outline' as const },
];

export default function SubjectsScreen() {
    const router = useRouter();
    const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const counts: Record<string, number> = {};

                // Fetch counts for each subject
                await Promise.all(
                    subjectMeta.map(async (subject) => {
                        const snapshot = await db
                            .collection('lessons')
                            .where('subject', '==', subject.id)
                            .get();
                        counts[subject.id] = snapshot.size;
                    })
                );

                setLessonCounts(counts);
            } catch (error) {
                console.error('Failed to fetch lesson counts:', error);
                // Set all to 0 - never fake data
                const zeros: Record<string, number> = {};
                subjectMeta.forEach(s => zeros[s.id] = 0);
                setLessonCounts(zeros);
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, []);

    // Calculate real totals
    const totalLessons = Object.values(lessonCounts).reduce((sum, count) => sum + count, 0);
    const subjectsWithContent = Object.values(lessonCounts).filter(c => c > 0).length;

    const handleSubjectPress = (subjectId: string) => {
        router.push(`/(app)/subjects/${subjectId}`);
    };

    if (loading) {
        return (
            <LinearGradient
                colors={[colors.background.start, colors.background.middle, colors.background.end]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.container} edges={['top']}>
                    <Header title="المواد الدراسية" />
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={[colors.background.start, colors.background.middle, colors.background.end]}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header title="المواد الدراسية" />

                <FlatList
                    data={subjectMeta}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>كتالوج المواد</Text>
                                <Text style={styles.subtitle}>اختر المادة للوصول إلى الدروس والتمارين</Text>
                            </View>

                            {/* Real Stats */}
                            <View style={styles.statsRow}>
                                <GlassCard style={styles.statCard}>
                                    <Text style={styles.statValue}>
                                        {totalLessons === 0 ? 'قريباً' : totalLessons}
                                    </Text>
                                    <Text style={styles.statLabel}>إجمالي الدروس</Text>
                                </GlassCard>
                                <GlassCard style={styles.statCard}>
                                    <Text style={styles.statValue}>{subjectsWithContent}</Text>
                                    <Text style={styles.statLabel}>مواد متاحة</Text>
                                </GlassCard>
                            </View>

                            {/* Section Title */}
                            <Text style={styles.sectionTitle}>المواد المتاحة</Text>
                        </>
                    }
                    renderItem={({ item }) => {
                        const lessonsCount = lessonCounts[item.id] || 0;
                        return (
                            <SubjectCard
                                id={item.id}
                                name={item.name}
                                icon={item.icon}
                                lessonsCount={lessonsCount}
                                completedCount={0} // Will implement real progress tracking separately
                                onPress={() => handleSubjectPress(item.id)}
                            />
                        );
                    }}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListFooterComponent={<View style={styles.footer} />}
                />
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
    listContent: {
        padding: spacing.lg,
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        textAlign: 'right',
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: colors.text.muted,
        textAlign: 'right',
        marginTop: spacing.xs,
    },
    statsRow: {
        flexDirection: 'row-reverse',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    statValue: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
    },
    statLabel: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
        marginTop: spacing.xs,
    },
    sectionTitle: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        color: colors.text.secondary,
        textAlign: 'right',
        marginBottom: spacing.md,
    },
    separator: {
        height: spacing.md,
    },
    footer: {
        height: spacing['2xl'],
    },
});
