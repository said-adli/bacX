import { useEffect } from 'react';

interface VideoHotkeysParams {
    togglePlay: () => void;
    toggleMute: () => void;
    toggleFullscreen: () => void;
    seekBy: (seconds: number) => void;
    isEnabled: boolean;
}

export function useVideoHotkeys({
    togglePlay,
    toggleMute,
    toggleFullscreen,
    seekBy,
    isEnabled
}: VideoHotkeysParams) {
    useEffect(() => {
        if (!isEnabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Guard: Ignore if user is typing in an input, textarea, or contenteditable
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            switch (e.code) {
                case 'Space':
                case 'KeyK':
                    e.preventDefault(); // Prevent page scroll
                    togglePlay();
                    break;
                case 'ArrowRight':
                case 'KeyL':
                    e.preventDefault();
                    seekBy(5); // +10s standard, but 5s feels snappier for short content
                    break;
                case 'ArrowLeft':
                case 'KeyJ':
                    e.preventDefault();
                    seekBy(-5);
                    break;
                case 'KeyM':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEnabled, togglePlay, toggleMute, toggleFullscreen, seekBy]);
}
