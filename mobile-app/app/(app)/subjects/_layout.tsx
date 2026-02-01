import React from 'react';
import { Stack } from 'expo-router';

/**
 * Subjects Stack Navigator
 */
export default function SubjectsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_left',
            }}
        />
    );
}
