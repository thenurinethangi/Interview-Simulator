'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Clock, ChevronRight } from 'lucide-react';

interface SessionItem {
    id: string;
    mode: string;
    input: string;
    createdAt: string;
    questionCount: number;
    answeredCount: number;
    avgScore: string | null;
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/sessions')
            .then(r => r.json())
            .then(d => { setSessions(d.sessions || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [pathname]);

    return (
        <aside className="w-[248px] shrink-0 flex flex-col h-screen bg-[#f9f9f9] border-r border-[#e5e7eb] overflow-hidden">

            {/* Brand */}
            <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[#e5e7eb]">
                <div className="w-7 h-7 rounded-lg bg-[#0d0d0d] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">P</span>
                </div>
                <span className="text-sm font-semibold text-[#0d0d0d] tracking-tight">PrepAI</span>
            </div>

            {/* New session */}
            <div className="px-3 pt-3">
                <button
                    onClick={() => router.push('/')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0d0d0d] text-white text-sm font-medium hover:bg-[#1f1f1f] transition-colors"
                >
                    <Plus size={14} />
                    New session
                </button>
            </div>

            {/* Nav */}
            <nav className="px-3 pt-2 space-y-0.5">
                <Link
                    href="/history"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        pathname === '/history'
                            ? 'bg-[#e5e7eb] text-[#0d0d0d] font-medium'
                            : 'text-[#374151] hover:bg-[#efefef]'
                    }`}>
                    <Clock size={14} className="flex-shrink-0" />
                    History
                </Link>
            </nav>

            <div className="px-4 pt-4 pb-1">
                <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">Recent</p>
            </div>

            {/* Sessions */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="skeleton h-9 rounded-lg" />
                    ))
                ) : sessions.length === 0 ? (
                    <p className="text-xs text-[#9ca3af] px-2 py-2">No sessions yet</p>
                ) : (
                    sessions.map(s => {
                        const active = pathname === `/session/${s.id}`;
                        return (
                            <Link
                                key={s.id}
                                href={`/session/${s.id}`}
                                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors group ${
                                    active
                                        ? 'bg-[#e5e7eb] text-[#0d0d0d] font-medium'
                                        : 'text-[#374151] hover:bg-[#efefef]'
                                }`}>
                                <MessageSquare size={13} className="flex-shrink-0 text-[#9ca3af]" />
                                <span className="truncate flex-1 text-xs">{s.input.length > 38 ? s.input.slice(0, 38) + '...' : s.input}</span>
                                <ChevronRight size={11} className="flex-shrink-0 text-[#d1d5db] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#e5e7eb]">
                <p className="text-[11px] text-[#9ca3af]">Powered by GPT-4o-mini</p>
            </div>
        </aside>
    );
}
