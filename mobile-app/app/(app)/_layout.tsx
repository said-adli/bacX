import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useLivePulse } from '@/hooks';
import { View, StyleSheet } from 'react-native';

/**
 * App Tab Navigator
 * Main authenticated app navigation
 */
export default function AppLayout() {
    const { isLive } = useLivePulse();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text.muted,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'الرئيسية',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="subjects"
                options={{
                    title: 'المواد',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="live"
                options={{
                    title: 'مباشر',
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <Ionicons name="radio-outline" size={size} color={isLive ? colors.live : color} />
                            {isLive && <View style={styles.liveDot} />}
                        </View>
                    ),
                    tabBarLabelStyle: [styles.tabLabel, isLive && styles.liveLabel],
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'حسابي',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
            {/* Hidden screens */}
            <Tabs.Screen
                name="lesson/[id]"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.glass.backgroundSolid,
        borderTopColor: colors.border.light,
        paddingTop: 8,
        height: 85,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    liveLabel: {
        color: colors.live,
    },
    liveDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.live,
    },
});
