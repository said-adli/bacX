import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { BackButton } from "@/components/ui/BackButton";
import { GlobalErrorBoundary as ErrorBoundary } from "@/components/GlobalErrorBoundary";
import { AppShell } from "@/components/layout/AppShell";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: 'swap',
});

// --- SEO & VIEWPORT ---
export const viewport: Viewport = {
  themeColor: '#1E40AF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "Brainy - Where Intelligence Meets Excellence",
    template: "%s | Brainy",
  },
  description: "منصة Brainy التعليمية الذكية لطلاب البكالوريا في الجزائر. تجربة دراسية متميزة تجمع بين التقنية المتقدمة والمحتوى الأكاديمي الراقي.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body className={`${ibmPlexSansArabic.variable} antialiased bg-background text-foreground font-sans selection:bg-gold/30`}>
        <NextTopLoader
          color="#D4AF37"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #D4AF37,0 0 5px #D4AF37"
        />
        <AuthProvider>
          <ErrorBoundary>
            <AppShell>
              <BackButton />
              {children}
            </AppShell>
            <Toaster
              position="bottom-center"
              richColors
              theme="dark"
              toastOptions={{
                className: "bg-glass border-glass-border text-foreground font-sans backdrop-blur-xl",
                style: {
                  fontFamily: 'var(--font-sans)',
                  background: 'rgba(2, 2, 2, 0.8)',
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
