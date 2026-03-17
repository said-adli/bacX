
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

/**
 * Subject Units Screen
 * Displays units for a specific subject
 */

// Sample units data (in production, this would come from Firestore)
const getUnitsForSubject = (subjectId: string) => {
    const unitsMap: Record<string, Array<{ id: string; title: string; lessons: number; completed: number }>> = {
        math: [
            { id: 'unit1', title: 'الدوال العددية', lessons: 10, completed: 5 },
            { id: 'unit2', title: 'الأعداد المركبة', lessons: 8, completed: 3 },
            { id: 'unit3', title: 'التحليل والتكامل', lessons: 12, completed: 2 },
            { id: 'unit4', title: 'الاحتمالات', lessons: 8, completed: 2 },
            { id: 'unit5', title: 'الهندسة في الفضاء', lessons: 7, completed: 0 },
        ],
        physics: [
            { id: 'unit1', title: 'التحولات النووية', lessons: 8, completed: 4 },
            { id: 'unit2', title: 'الظواهر الكهربائية', lessons: 10, completed: 2 },
            { id: 'unit3', title: 'الميكانيك', lessons: 12, completed: 2 },
            { id: 'unit4', title: 'الكهرومغناطيسية', lessons: 8, completed: 0 },
        ],
        science: [
            { id: 'unit1', title: 'التركيب الضوئي', lessons: 8, completed: 8 },
            { id: 'unit2', title: 'علم الوراثة', lessons: 10, completed: 8 },
            { id: 'unit3', title: 'المناعة', lessons: 8, completed: 4 },
            { id: 'unit4', title: 'التكاثر', lessons: 6, completed: 2 },
        ],
        arabic: [
            { id: 'unit1', title: 'الشعر الحر', lessons: 7, completed: 3 },
            { id: 'unit2', title: 'النثر الأدبي', lessons: 8, completed: 2 },
            { id: 'unit3', title: 'البلاغة', lessons: 6, completed: 0 },
            { id: 'unit4', title: 'النقد الأدبي', lessons: 7, completed: 0 },
        ],
        languages: [
            { id: 'unit1', title: 'Grammar', lessons: 6, completed: 4 },
            { id: 'unit2', title: 'Writing', lessons: 8, completed: 3 },
            { id: 'unit3', title: 'Reading Comprehension', lessons: 6, completed: 2 },
            { id: 'unit4', title: 'Text Analysis', lessons: 5, completed: 1 },
        ],
        philosophy: [
            { id: 'unit1', title: 'الفلسفة اليونانية', lessons: 5, completed: 0 },
            { id: 'unit2', title: 'الفلسفة الإسلامية', lessons: 6, completed: 0 },
            { id: 'unit3', title: 'الفلسفة الحديثة', lessons: 6, completed: 0 },
            { id: 'unit4', title: 'مباحث فلسفية', lessons: 5, completed: 0 },
        ],
    };
    return unitsMap[subjectId] || [];
};

const subjectNames: Record<string, string> = {
    math: 'الرياضيات',
    physics: 'الفيزياء',
    science: 'العلوم الطبيعية',
    arabic: 'الأدب العربي',
    languages: 'اللغات الأجنبية',
    philosophy: 'الفلسفة',
};

export default function SubjectUnitsScreen() {
    const { id: subjectId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const units = getUnitsForSubject(subjectId || '');
    const subjectName = subjectNames[subjectId || ''] || 'المادة';

    const handleUnitPress = (unitId: string) => {
        router.push(`/ (app) / subjects / ${subjectId}/${unitId}`);
    };

    return (
        <LinearGradient
            colors={[colors.background.start, colors.background.middle, colors.background.end]}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header title={subjectName} showBack />

                <FlatList
                    data={units}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View style={styles.header}>
                            <Text style={styles.title}>الوحدات</Text>
                            <Text style={styles.subtitle}>{units.length} وحدات</Text>
                        </View>
                    }
                    renderItem={({ item, index }) => {
                        const progress = Math.round((item.completed / item.lessons) * 100);
                        const isComplete = item.completed === item.lessons;

                        return (
                            <TouchableOpacity
                                onPress={() => handleUnitPress(item.id)}
                                activeOpacity={0.7}
                                style={styles.unitCard}
                            >
                                <View style={styles.unitNumber}>
                                    <Text style={styles.unitNumberText}>{index + 1}</Text>
                                </View>
                                <View style={styles.unitInfo}>
                                    <Text style={styles.unitTitle}>{item.title}</Text>
                                    <View style={styles.unitMeta}>
                                        <Text style={styles.unitLessons}>{item.lessons} دروس</Text>
                                        <Text style={styles.unitDot}>•</Text>
                                        <Text style={[
                                            styles.unitProgress,
                                            isComplete && styles.unitProgressComplete
                                        ]}>
                                            {progress}% مكتمل
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.progressCircle}>
                                    <View style={[
                                        styles.progressCircleFill,
                                        { height: `${progress}%` },
                                        isComplete && styles.progressCircleComplete
                                    ]} />
                                </View>
                                <Ionicons
                                    name="chevron-back"
                                    size={20}
                                    color={colors.text.muted}
                                />
                            </TouchableOpacity>
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
        fontSize: typography.sizes.xl,
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
    unitCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border.light,
        padding: spacing.lg,
        gap: spacing.md,
        ...shadows.sm,
    },
    unitNumber: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface.elevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unitNumberText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        color: colors.text.secondary,
    },
    unitInfo: {
        flex: 1,
    },
    unitTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        textAlign: 'right',
    },
    unitMeta: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    unitLessons: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
    },
    unitDot: {
        color: colors.text.muted,
    },
    unitProgress: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
    },
    unitProgressComplete: {
        color: colors.success,
    },
    progressCircle: {
        width: 8,
        height: 40,
        borderRadius: 4,
        backgroundColor: colors.surface.elevated,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    progressCircleFill: {
        width: '100%',
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    progressCircleComplete: {
        backgroundColor: colors.success,
    },
    separator: {
        height: spacing.md,
    },
    footer: {
        height: spacing['2xl'],
    },
});
