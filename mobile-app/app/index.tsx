import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks';
import { LoadingScreen } from '@/components/ui';

/**
 * Index Route
 * Redirects to auth or app based on authentication state
 */
export default function Index() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingScreen message="جاري التحميل..." />;
    }

    if (isAuthenticated) {
        return <Redirect href="/(app)" />;
    }

    return <Redirect href="/(auth)/login" />;
}
