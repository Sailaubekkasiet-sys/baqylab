'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar, MobileNav } from './Sidebar';

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const pathname = usePathname();

    // Landing, login, register pages are full-width (no sidebar)
    const isPublicPage = !session || pathname === '/' || pathname === '/login' || pathname === '/register';

    return (
        <div className="flex flex-col min-h-screen relative">
            {!isPublicPage && <Sidebar />}
            <div className={`flex-1 flex flex-col min-w-0 ${isPublicPage ? '' : 'lg:ml-64'}`}>
                <Navbar />
                {!isPublicPage && <MobileNav />}
                <main className={`flex-1 overflow-y-auto w-full ${isPublicPage ? '' : 'p-4 md:p-8 max-w-7xl mx-auto'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
