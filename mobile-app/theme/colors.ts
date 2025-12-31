/**
 * Brainy Color Palette
 * Matching the web's "Light Premium Glass" theme
 */

export const colors = {
    // Primary Brand
    primary: '#2563EB',        // Electric Blue
    primaryLight: '#3B82F6',
    primaryDark: '#1D4ED8',

    // Background Gradient
    background: {
        start: '#FFFFFF',
        middle: '#F8FAFC',
        end: '#EFF6FF',
    },

    // Glassmorphism
    glass: {
        background: 'rgba(255, 255, 255, 0.8)',
        backgroundSolid: '#FFFFFF',
        border: '#DBEAFE',
        blur: 10,
    },

    // Text Colors
    text: {
        primary: '#0F172A',      // Dark Slate
        secondary: '#475569',
        muted: '#94A3B8',
        inverse: '#FFFFFF',
    },

    // Semantic Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    live: '#EF4444',           // Red for live indicator

    // Surface Colors
    surface: {
        card: '#FFFFFF',
        elevated: '#F8FAFC',
        overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Border Colors
    border: {
        light: '#E2E8F0',
        default: '#CBD5E1',
        glass: '#DBEAFE',
    },
} as const;

export type Colors = typeof colors;
