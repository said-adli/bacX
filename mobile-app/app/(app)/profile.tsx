import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header, GlassCard, Button } from '@/components';
import { useAuth } from '@/hooks';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

/**
 * Profile Screen
 * User profile and settings
 */

export default function ProfileScreen() {
    const router = useRouter();
    const { userData, isSubscribed, isAdmin, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'تسجيل الخروج',
            'هل أنت متأكد من تسجيل الخروج؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'تسجيل الخروج',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    const menuItems = [
        {
            id: 'subscription',
            icon: 'card-outline' as const,
            title: 'الاشتراك',
            subtitle: isSubscribed ? 'مشترك Premium' : 'غير مشترك',
            badge: isSubscribed ? 'فعال' : null,
        },
        {
            id: 'notifications',
            icon: 'notifications-outline' as const,
            title: 'الإشعارات',
            subtitle: 'إدارة الإشعارات',
        },
        {
            id: 'devices',
            icon: 'phone-portrait-outline' as const,
            title: 'الأجهزة',
            subtitle: 'إدارة الأجهزة المتصلة',
        },
        {
            id: 'support',
            icon: 'help-circle-outline' as const,
            title: 'الدعم',
            subtitle: 'تواصل معنا',
        },
        {
            id: 'about',
            icon: 'information-circle-outline' as const,
            title: 'حول التطبيق',
            subtitle: 'الإصدار 1.0.0',
        },
    ];

    return (
        <LinearGradient
            colors={[colors.background.start, colors.background.middle, colors.background.end]}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header title="حسابي" />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Card */}
                    <GlassCard style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {userData?.displayName?.charAt(0) || 'B'}
                            </Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>
                                {userData?.displayName || 'طالب'}
                            </Text>
                            <Text style={styles.profileEmail}>
                                {userData?.email}
                            </Text>
                            <View style={styles.badges}>
                                {isAdmin && (
                                    <View style={styles.adminBadge}>
                                        <Text style={styles.adminBadgeText}>مدير</Text>
                                    </View>
                                )}
                                {isSubscribed && (
                                    <View style={styles.premiumBadge}>
                                        <Text style={styles.premiumBadgeText}>Premium</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </GlassCard>

                    {/* Menu Items */}
                    <View style={styles.menuSection}>
                        {menuItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuIconContainer}>
                                    <Ionicons
                                        name={item.icon}
                                        size={22}
                                        color={colors.text.secondary}
                                    />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                </View>
                                {item.badge && (
                                    <View style={styles.menuBadge}>
                                        <Text style={styles.menuBadgeText}>{item.badge}</Text>
                                    </View>
                                )}
                                <Ionicons
                                    name="chevron-back"
                                    size={20}
                                    color={colors.text.muted}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Logout Button */}
                    <Button
                        title="تسجيل الخروج"
                        onPress={handleLogout}
                        variant="secondary"
                        style={styles.logoutButton}
                    />

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
    profileCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: spacing.lg,
        marginBottom: spacing.xl,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 28,
        fontWeight: typography.weights.bold,
        color: colors.text.inverse,
    },
    profileInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    profileName: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        textAlign: 'right',
    },
    profileEmail: {
        fontSize: typography.sizes.sm,
        color: colors.text.muted,
        textAlign: 'right',
        marginTop: spacing.xs,
    },
    badges: {
        flexDirection: 'row-reverse',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    adminBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    adminBadgeText: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
        color: colors.error,
    },
    premiumBadge: {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    premiumBadgeText: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
        color: colors.primary,
    },
    menuSection: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border.light,
        overflow: 'hidden',
        ...shadows.sm,
    },
    menuItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.md,
    },
    menuContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    menuTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text.primary,
        textAlign: 'right',
    },
    menuSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.text.muted,
        textAlign: 'right',
        marginTop: 2,
    },
    menuBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        marginLeft: spacing.sm,
    },
    menuBadgeText: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
        color: colors.success,
    },
    logoutButton: {
        marginTop: spacing['2xl'],
    },
    footer: {
        height: spacing['2xl'],
    },
});
