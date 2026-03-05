import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';
import { I18nProvider } from '@/components/I18nProvider';
import { AccessibilityProvider } from '@/components/AccessibilityProvider';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { LayoutShell } from '@/components/LayoutShell';

export const metadata: Metadata = {
    title: 'BaqyLab — Next-generation IT Education',
    description: 'Modern LMS platform for CS education with rubric builder, code review, submission versioning and AI assistant.',
    keywords: ['LMS', 'education', 'computer science', 'IT', 'learning', 'programming'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body className="font-sans antialiased">
                <AccessibilityProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <I18nProvider>
                                <LayoutShell>
                                    {children}
                                </LayoutShell>
                                <AccessibilityPanel />
                            </I18nProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </AccessibilityProvider>
            </body>
        </html>
    );
}

