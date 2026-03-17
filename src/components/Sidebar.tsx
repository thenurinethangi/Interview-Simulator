'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Clock, X, Brain, FolderOpen, FileText, BookOpen, LogOut, UserRound } from 'lucide-react';

interface SessionItem {
    id: string;
    mode: string;
    input: string;
    createdAt: string;
    questionCount: number;
    answeredCount: number;
    avgScore: string | null;
}

interface MeUser {
    id: string;
    email: string;
    name: string | null;
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [user, setUser] = useState<MeUser | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        fetch('/api/sessions')
            .then(r => r.json())
            .then(d => { setSessions(d.sessions || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [pathname]);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(async (r) => {
                if (!r.ok) return null;
                const data = await r.json();
                return data?.user ?? null;
            })
            .then((u) => setUser(u))
            .catch(() => setUser(null));
    }, []);

    const handleDelete = async (id: string) => {
        if (deletingId || !confirm('Delete this session? This cannot be undone.')) return;
        setDeletingId(id);
        try {
            const res = await fetch('/api/sessions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete session');
            }
            setSessions(prev => prev.filter(s => s.id !== id));
            if (pathname === `/session/${id}`) router.push('/');
        } catch (err: any) {
            alert(err.message || 'Failed to delete session');
        } finally {
            setDeletingId(null);
        }
    };

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/auth/login');
            router.refresh();
        } catch {
            alert('Logout failed');
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&display=swap');
                
                *, *::before, *::after { box-sizing: border-box; }

                :root {
                    --bg-main:   #ffffff;
                    --bg-alt:    #f7f8fc;
                    --ink:       #0d1220;
                    --ink-soft:  #3d4460;
                    --ink-muted: #8b90a8;
                    --border:    #e2e8f0;
                    --teal:      #00c2a8;
                    --teal-dim:  rgba(0,194,168,0.08);
                }

                .sidebar {
                    width: 260px;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background: var(--bg-main);
                    border-right: 1px solid var(--border);
                    overflow: hidden;
                    font-family: 'Syne', sans-serif;
                }

                /* Brand (Matches Landing Page) */
                .sb-brand {
                    display: flex; align-items: center; gap: 10px;
                    padding: 24px 20px 20px; flex-shrink: 0;
                    text-decoration: none;
                }
                .sb-brand-icon {
                    width: 28px; height: 28px;
                    background: var(--teal-dim); border: 1px solid rgba(0,194,168,0.2);
                    border-radius: 8px; display: flex; align-items: center; justify-content: center;
                }
                .sb-brand-name {
                    font-size: 14px; font-weight: 700;
                    letter-spacing: 0.08em; color: var(--ink);
                }
                .sb-brand-name em { font-style: normal; color: var(--teal); }

                /* New session */
                .sb-new-wrap { padding: 0 16px 16px; flex-shrink: 0; border-bottom: 1px solid var(--border); }
                .sb-new-btn {
                    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
                    padding: 10px 14px; background: var(--ink); color: #fff;
                    border: none; border-radius: 8px; font-size: 13.5px; font-weight: 600;
                    font-family: 'Syne', sans-serif; cursor: pointer; transition: background 0.15s;
                }
                .sb-new-btn:hover { background: #000; }

                /* Nav */
                .sb-nav { padding: 16px 12px 8px; flex-shrink: 0; }
                .sb-nav-link {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 12px; border-radius: 8px;
                    font-size: 13.5px; font-weight: 500; color: var(--ink-soft);
                    text-decoration: none; transition: all 0.15s;
                }
                .sb-nav-link:hover { background: var(--bg-alt); color: var(--ink); }
                .sb-nav-link.active { background: var(--teal-dim); color: #009985; font-weight: 600; }

                /* Section label */
                .sb-section-label {
                    padding: 16px 24px 8px; font-size: 10px; font-weight: 700;
                    letter-spacing: 0.1em; text-transform: uppercase;
                    color: var(--ink-muted); flex-shrink: 0;
                }

                /* Sessions list */
                .sb-sessions {
                    flex: 1; overflow-y: auto; padding: 0 12px 16px;
                    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
                }
                .sb-sessions::-webkit-scrollbar { width: 4px; }
                .sb-sessions::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

                /* Skeleton */
                .sb-skeleton {
                    height: 38px; border-radius: 8px; background: var(--bg-alt);
                    margin-bottom: 4px; animation: pulse 1.5s ease-in-out infinite;
                }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }

                .sb-empty {
                    display: flex; flex-direction: column; align-items: center; gap: 8px;
                    padding: 32px 16px; text-align: center; color: var(--ink-muted);
                }
                .sb-empty svg { opacity: 0.5; }
                .sb-empty span { font-size: 12px; font-weight: 500; }

                /* Session row */
                .sb-row {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 12px; border-radius: 8px; cursor: pointer;
                    border: 1px solid transparent; transition: all 0.15s; margin-bottom: 2px;
                }
                .sb-row:hover { background: var(--bg-alt); }
                .sb-row.active {
                    background: #fff; border-color: var(--border);
                    box-shadow: 0 2px 8px rgba(13,18,32,0.04);
                }

                .sb-row-icon {
                    display: flex; align-items: center; justify-content: center;
                    color: var(--ink-muted); transition: color 0.15s;
                }
                .sb-row.active .sb-row-icon { color: var(--teal); }

                .sb-row-label {
                    flex: 1; font-size: 13.5px; color: var(--ink-soft);
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    font-weight: 500; transition: color 0.15s;
                }
                .sb-row.active .sb-row-label { color: var(--ink); font-weight: 600; }
                .sb-row:hover .sb-row-label { color: var(--ink); }

                .sb-del {
                    opacity: 0; display: flex; align-items: center; justify-content: center;
                    width: 22px; height: 22px; border-radius: 4px;
                    border: none; background: transparent; cursor: pointer; color: var(--ink-muted);
                    transition: all 0.15s; flex-shrink: 0; padding: 0;
                }
                .sb-row:hover .sb-del { opacity: 1; }
                .sb-del:hover { background: #fee2e2; color: #ef4444; }
                .sb-del:disabled { opacity: 0.3 !important; cursor: not-allowed; }

                /* Footer */
                .sb-footer {
                    padding: 12px; border-top: 1px solid var(--border);
                    flex-shrink: 0; background: var(--bg-alt);
                }

                .sb-profile {
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    background: #fff;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .sb-profile-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 0;
                }

                .sb-avatar {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: var(--bg-alt);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--ink-soft);
                    flex-shrink: 0;
                }

                .sb-user-meta {
                    min-width: 0;
                }

                .sb-user-name {
                    font-size: 12.5px;
                    font-weight: 600;
                    color: var(--ink);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.3;
                }

                .sb-user-email {
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--ink-muted);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.3;
                }

                .sb-logout-btn {
                    width: 100%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    padding: 8px 10px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    background: #fff;
                    color: var(--ink-soft);
                    font-size: 12px;
                    font-weight: 600;
                    font-family: 'Syne', sans-serif;
                    cursor: pointer;
                    transition: border-color 0.15s, background 0.15s, color 0.15s;
                }

                .sb-logout-btn:hover:not(:disabled) {
                    border-color: #cfd6e5;
                    background: #f7f8fc;
                    color: var(--ink);
                }

                .sb-logout-btn:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }

                .sb-footer-text {
                    font-size: 11px;
                    color: var(--ink-muted);
                    font-weight: 500;
                    text-align: center;
                    margin-top: 10px;
                }
            `}</style>

            <aside className="sidebar">
                <Link href="/" className="sb-brand">
                    <div className="sb-brand-icon"><Brain size={16} color="var(--teal)" /></div>
                    <span className="sb-brand-name"><em>Intelli</em>View</span>
                </Link>

                <div className="sb-new-wrap">
                    <button className="sb-new-btn" onClick={() => router.push('/')} type="button">
                        <Plus size={14} />
                        New Study Session
                    </button>
                </div>

                <nav className="sb-nav">
                    <Link href="/history" className={`sb-nav-link${pathname === '/history' ? ' active' : ''}`}>
                        <Clock size={16} />
                        Study History
                    </Link>
                </nav>

                <p className="sb-section-label">Recent Modules</p>

                <div className="sb-sessions">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="sb-skeleton" style={{ opacity: 1 - i * 0.12 }} />
                        ))
                    ) : sessions.length === 0 ? (
                        <div className="sb-empty">
                            <FolderOpen size={24} />
                            <span>No active modules</span>
                        </div>
                    ) : (
                        sessions.map(s => {
                            const active = pathname === `/session/${s.id}`;
                            const label = s.input.length > 30 ? s.input.slice(0, 30) + '…' : s.input;
                            return (
                                <div
                                    key={s.id}
                                    className={`sb-row${active ? ' active' : ''}`}
                                    onClick={() => router.push(`/session/${s.id}`)}
                                >
                                    <div className="sb-row-icon">
                                        {s.mode === 'cv' ? <FileText size={14} /> : <BookOpen size={14} />}
                                    </div>
                                    <span className="sb-row-label" title={s.input}>{label}</span>
                                    <button
                                        className="sb-del"
                                        onClick={e => { e.stopPropagation(); handleDelete(s.id); }}
                                        disabled={deletingId === s.id}
                                        aria-label="Delete session"
                                        type="button"
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="sb-footer">
                    <div className="sb-profile">
                        <div className="sb-profile-row">
                            <div className="sb-avatar">
                                <UserRound size={14} />
                            </div>
                            <div className="sb-user-meta">
                                <p className="sb-user-name">{user?.name || 'Student'}</p>
                                <p className="sb-user-email">{user?.email || 'Signed in user'}</p>
                            </div>
                        </div>
                        <button
                            className="sb-logout-btn"
                            onClick={handleLogout}
                            type="button"
                            disabled={loggingOut}
                        >
                            <LogOut size={13} />
                            {loggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                    <p className="sb-footer-text">Powered by Groq AI</p>
                </div>
            </aside>
        </>
    );
}