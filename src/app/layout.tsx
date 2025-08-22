
'use client';

import React, { useEffect } from 'react';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { CopilotProvider } from '@/hooks/use-copilot.tsx';
import MainLayout from '@/components/Layout/MainLayout';
import { Toaster } from "@/components/ui/sonner";
import { TransliterationProvider } from '@/components/transliteration-provider';
import { CartProvider } from '@/hooks/use-cart';
import { AuthProvider, useAuth } from '@/app/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;


const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const publicPaths = ['/login', '/onboarding'];
    const isPublicPage = publicPaths.includes(pathname);

    useEffect(() => {
        if (loading) return;

        if (isAuthenticated && isPublicPage) {
            if (user?.isDoctor) {
                router.push('/dashboard');
            } else if (user?.isStudent) {
                router.push('/medhayu/profile');
            }
        }
        
        if (!isAuthenticated && !isPublicPage) {
            router.push('/login');
        }

    }, [isAuthenticated, loading, pathname, user, router, isPublicPage]);

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }
    
    if (isPublicPage) {
        return <>{children}</>;
    }

    if (isAuthenticated) {
        return <MainLayout>{children}</MainLayout>;
    }
    
    return null; // Should be redirected, but good to have a fallback
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:wght@400;700&family=PT+Sans:wght@400;700&family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <div id="bg-mask"></div>
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <CopilotProvider>
                  <CartProvider>
                    <TransliterationProvider>
                      <AppLayout>{children}</AppLayout>
                      <Toaster />
                    </TransliterationProvider>
                  </CartProvider>
              </CopilotProvider>
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
