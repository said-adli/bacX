import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider, type UserProfile } from "@/context/AuthContext";
import { Toaster } from "sonner";

import { GlobalErrorBoundary as ErrorBoundary } from "@/components/GlobalErrorBoundary";


import { createClient } from "@/utils/supabase/server"; // Use Supabase Server Client


const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: 'swap',
});

import { Amiri, Cinzel } from "next/font/google"; // Import Amiri and Cinzel

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

// --- SEO & VIEWPORT ---
export const viewport: Viewport = {
  themeColor: '#2563EB', // Electric Blue
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "Brainy | بوابة النخبة الأكاديمية",
    template: "%s | Brainy",
  },
  description: "رحلة سينمائية نحو النجاح في البكالوريا.",
  keywords: ["brainy", "bac dz", "bac algeria", "تعليم", "بكالوريا", "دروس", "منصة تعليمية"],
  authors: [{ name: "Brainy Team" }],
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: "https://brainy-dz.vercel.app",
    siteName: "Brainy",
    title: "Brainy - منصة التفوق الأكاديمي",
    description: "استعد للبكالوريا مع أفضل الأساتذة في بيئة تعليمية ذكية.",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brainy - منصة التفوق الأكاديمي",
    description: "استعد للبكالوريا مع أفضل الأساتذة في بيئة تعليمية ذكية.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // --- SERVER AUTH HYDRATION (SUPABASE) ---
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialUser = null;
  let initialProfile: UserProfile | null = null;

  if (user) {
    initialUser = user;

    // Try fetch profile for role
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
      initialProfile = {
        id: user.id,
        email: user.email || '',
        full_name: profile.full_name || user.user_metadata?.full_name || '',
        // wilaya: undefined, // Let it be undefined or fetch if needed
        // major: undefined,
        role: profile.role || 'student',
        is_profile_complete: profile.is_profile_complete || false,
        created_at: profile.created_at || new Date().toISOString()
      };
    }
  }

  return (
    <html lang="ar" dir="rtl" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${ibmPlexSansArabic.variable} ${playfairDisplay.variable} ${amiri.variable} ${cinzel.variable} antialiased bg-background text-foreground font-sans selection:bg-primary/30`}>
        <AuthProvider initialUser={initialUser} hydratedProfile={initialProfile}>
          <ErrorBoundary>
            {children}
            <Toaster
              position="bottom-center"
              richColors
              theme="dark"
              toastOptions={{
                className: "glass-panel text-foreground font-sans",
                style: {
                  fontFamily: 'var(--font-sans)',
                  background: 'rgba(10, 10, 15, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFF'
                }
              }}
            />
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
