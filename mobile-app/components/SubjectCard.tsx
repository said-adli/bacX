import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '@/theme';

/**
 * SubjectCard Component
 * Displays a subject with progress indicator
 */

interface SubjectCardProps {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    lessonsCount: number;
    completedCount: number;
    onPress: () => void;
}

export function SubjectCard({
    name,
    icon,
    lessonsCount,
    completedCount,
    onPress,
}: SubjectCardProps) {
    const progress = lessonsCount > 0 ? Math.round((completedCount / lessonsCount) * 100) : 0;
    const status = completedCount === 0 ? 'new' : completedCount === lessonsCount ? 'complete' : 'progress';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.container}
        >
            {/* Icon */}
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={24} color={colors.text.secondary} />
            </View>

            {/* Info */}
            <View style={styles.info}>
                <View style={styles.titleRow}>
                    <Text style={styles.name}>{name}</Text>
                    <View style={[styles.badge, badgeStyles[status]]}>
                        <Text style={[styles.badgeText, badgeTextStyles[status]]}>
                            {status === 'complete' ? 'مكتمل' : status === 'progress' ? 'جاري' : 'جديد'}
                        </Text>
                    </View>
                </View>
                <View style={styles.stats}>
                    <Text style={styles.statText}>{lessonsCount} درس</Text>
                    <Text style={styles.statDivider}>•</Text>
                    <Text style={styles.statText}>{completedCount} مكتمل</Text>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>التقدم</Text>
                    <Text style={styles.progressValue}>{progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progress}%` },
                            status === 'complete' && styles.progressComplete,
                        ]}
                    />
                </View>
            </View>

            {/* Arrow */}
            <Ionicons
                name="chevron-back"
                size={20}
                color={colors.text.muted}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.lg,
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border.light,
        ...shadows.sm,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface.elevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
        marginRight: spacing.sm,
    },
    titleRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: 4,
    },
    name: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        textAlign: 'right',
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
    },
    stats: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: spacing.sm,
    },
    statText: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
    },
    statDivider: {
        color: colors.text.muted,
    },
    progressContainer: {
        width: 80,
    },
    progressHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
    },
    progressValue: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.surface.elevated,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: colors.text.secondary,
    },
    progressComplete: {
        backgroundColor: colors.success,
    },
});

const badgeStyles = StyleSheet.create({
    new: {
        backgroundColor: colors.surface.elevated,
    },
    progress: {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
    },
    complete: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
});

const badgeTextStyles = StyleSheet.create({
    new: {
        color: colors.text.muted,
    },
    progress: {
        color: colors.primary,
    },
    complete: {
        color: colors.success,
    },
});
