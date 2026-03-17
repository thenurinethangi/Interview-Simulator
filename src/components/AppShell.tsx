'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideSidebar = pathname === '/landing' || pathname?.startsWith('/auth');

    return (
        <>
            {!hideSidebar && <Sidebar />}
            <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative">
                {children}
            </main>
        </>
    );
}
