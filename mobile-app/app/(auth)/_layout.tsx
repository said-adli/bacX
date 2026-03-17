import React from 'react';
import { Stack } from 'expo-router';

/**
 * Auth Layout
 * Stack navigator for authentication screens
 */
export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_left',
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
        </Stack>
    );
}
