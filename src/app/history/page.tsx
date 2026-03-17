import { db } from "@/lib/db";
import Link from 'next/link';
import { Clock, BookOpen, FileText, Trophy, TrendingUp, BarChart3, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function ScoreBadge({ score }: { score: number }) {
    const color = score >= 8 ? '#0a8f7d' : score >= 6 ? '#0d1220' : score >= 4 ? '#b55f14' : '#c0392b';
    const bg = score >= 8 ? 'rgba(0,194,168,0.12)' : score >= 6 ? '#f3f5fa' : score >= 4 ? '#fff4e8' : '#fef0ee';
    const border = score >= 8 ? 'rgba(0,194,168,0.28)' : score >= 6 ? '#dde3ef' : score >= 4 ? '#f3cda7' : '#f4c5bf';
    return (
        <span style={{
            color, background: bg,
            border: `1px solid ${border}`,
            fontSize: 12.5, fontWeight: 600,
            padding: '3px 10px', borderRadius: 8,
            fontFamily: "'Syne', system-ui, sans-serif",
            letterSpacing: '0.01em',
        }}>
            {score.toFixed(1)}
        </span>
    );
}

function ScoreDot({ score }: { score: number | null }) {
    if (score === null) return (
        <div title="Unanswered" style={{
            width: 22, height: 22, borderRadius: 7, border: '1.5px solid #e2e8f0',
            background: '#f7f8fc', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 500, color: '#9aa0b5', fontFamily: "'Syne', system-ui, sans-serif",
        }}>–</div>
    );
    const color = score >= 8 ? '#0a8f7d' : score >= 6 ? '#0d1220' : score >= 4 ? '#b55f14' : '#c0392b';
    const bg = score >= 8 ? 'rgba(0,194,168,0.12)' : score >= 6 ? '#f3f5fa' : score >= 4 ? '#fff4e8' : '#fef0ee';
    const border = score >= 8 ? 'rgba(0,194,168,0.28)' : score >= 6 ? '#dde3ef' : score >= 4 ? '#f3cda7' : '#f4c5bf';
    return (
        <div title={`${score}/10`} style={{
            width: 22, height: 22, borderRadius: 7,
            border: `1.5px solid ${border}`, background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 600, color,
            fontFamily: "'Syne', system-ui, sans-serif",
        }}>
            {score.toFixed(0)}
        </div>
    );
}

export default async function HistoryPage() {
    const sessions = await db.session.findMany({
        orderBy: { createdAt: 'desc' },
        include: { questions: { orderBy: { createdAt: 'asc' } } }
    });

    const allAnswered = sessions.flatMap((s: any) => s.questions).filter((q: any) => q.score !== null);
    const overallAvg = allAnswered.length > 0
        ? allAnswered.reduce((a: number, q: any) => a + (q.score || 0), 0) / allAnswered.length
        : null;
    const topScore = allAnswered.length > 0 ? Math.max(...allAnswered.map((q: any) => q.score || 0)) : null;
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s: any) => s.questions.every((q: any) => q.score !== null)).length;

    const stats = [
        { icon: BarChart3,   label: 'Sessions',   value: String(totalSessions) },
        { icon: CheckCircle2,label: 'Completed',  value: String(completedSessions) },
        { icon: TrendingUp,  label: 'Avg score',  value: overallAvg !== null ? overallAvg.toFixed(1) + '/10' : '—' },
        { icon: Trophy,      label: 'Best score', value: topScore   !== null ? topScore.toFixed(1)   + '/10' : '—' },
    ];

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
                    --teal-dim:  rgba(0,194,168,0.1);
                }

                .hp-root {
                    flex: 1;
                    min-height: 100vh;
                    background: var(--bg-alt);
                    overflow-y: auto;
                    font-family: 'Syne', system-ui, sans-serif;
                }

                .hp-body {
                    max-width: 760px;
                    margin: 0 auto;
                    width: 100%;
                    padding: 56px 28px 72px;
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                /* Header */
                .hp-header { display: flex; flex-direction: column; gap: 6px; }
                .hp-eyebrow {
                    font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
                    text-transform: uppercase; color: var(--ink-muted);
                }
                .hp-title {
                    font-size: 34px;
                    color: var(--ink);
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    line-height: 1.15;
                }
                .hp-subtitle { font-size: 13.5px; color: var(--ink-soft); font-weight: 500; margin-top: 2px; }

                /* Stats */
                .hp-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 14px;
                }
                .hp-stat {
                    background: var(--bg-main);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 16px 14px;
                    display: flex; flex-direction: column; gap: 11px;
                }
                .hp-stat-icon {
                    width: 34px; height: 34px; border-radius: 8px; background: var(--bg-alt);
                    display: flex; align-items: center; justify-content: center;
                }
                .hp-stat-val {
                    font-size: 21px; color: var(--ink); line-height: 1;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }
                .hp-stat-label {
                    font-size: 11px; font-weight: 600; letter-spacing: 0.09em;
                    text-transform: uppercase; color: var(--ink-muted); margin-top: 2px;
                }

                /* Section row */
                .hp-section-row {
                    display: flex; align-items: center; justify-content: space-between;
                }
                .hp-section-title {
                    font-size: 14px; color: var(--ink); font-weight: 700; letter-spacing: 0.08em;
                    text-transform: uppercase;
                }
                .hp-section-count { font-size: 12px; color: var(--ink-muted); font-weight: 600; }

                /* Empty state */
                .hp-empty {
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: center; padding: 64px 24px;
                    border: 1.5px dashed var(--border); border-radius: 12px;
                    background: var(--bg-main); text-align: center; gap: 14px;
                }
                .hp-empty-icon {
                    width: 46px; height: 46px; border-radius: 10px; background: var(--bg-alt);
                    display: flex; align-items: center; justify-content: center;
                }
                .hp-empty-title {
                    font-size: 20px; color: var(--ink); font-weight: 700;
                }
                .hp-empty-sub { font-size: 13.5px; color: var(--ink-soft); font-weight: 500; line-height: 1.6; max-width: 330px; }

                /* Session list */
                .hp-list { display: flex; flex-direction: column; gap: 10px; }

                .hp-session {
                    display: flex; flex-direction: column; gap: 16px;
                    padding: 18px 18px; background: var(--bg-main);
                    border: 1px solid var(--border); border-radius: 10px;
                    text-decoration: none; cursor: pointer;
                    transition: border-color 0.15s, background 0.15s;
                }
                .hp-session:hover {
                    border-color: #cfd6e5;
                    background: #fbfcff;
                }

                /* Session top row */
                .hp-session-top {
                    display: flex; align-items: flex-start; gap: 14px;
                }
                .hp-session-icon-wrap {
                    width: 38px; height: 38px; border-radius: 8px; background: var(--bg-alt);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0; margin-top: 2px;
                }
                .hp-session-meta { flex: 1; min-width: 0; }
                .hp-session-badges {
                    display: flex; align-items: center; gap: 8px; margin-bottom: 5px;
                }
                .hp-mode-pill {
                    font-size: 10.5px; font-weight: 600; padding: 3px 10px;
                    border-radius: 100px;
                    border: 1px solid #dbe2ef;
                    color: #4c5673;
                    background: #f3f5fa;
                    letter-spacing: 0.03em;
                }
                .hp-session-date { font-size: 12px; color: var(--ink-muted); font-weight: 500; }
                .hp-session-title {
                    font-size: 14px; font-weight: 600; color: var(--ink);
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    max-width: 480px; line-height: 1.4;
                }
                .hp-session-score { flex-shrink: 0; padding-top: 2px; }

                /* Progress bar */
                .hp-progress-row {
                    display: flex; align-items: center; gap: 12px;
                }
                .hp-progress-track {
                    flex: 1; height: 4px; background: #e9edf5; border-radius: 3px; overflow: hidden;
                }
                .hp-progress-fill {
                    height: 100%; background: #2f3a56; border-radius: 3px;
                    transition: width 0.5s ease;
                }
                .hp-progress-label {
                    font-size: 11.5px; color: var(--ink-muted); font-weight: 600; flex-shrink: 0; min-width: 32px; text-align: right;
                }

                /* Score dots */
                .hp-dots { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }

                @media (max-width: 600px) {
                    .hp-stats { grid-template-columns: repeat(2, 1fr); }
                    .hp-session-title { max-width: 220px; }
                    .hp-body { padding: 42px 20px 60px; }
                    .hp-title { font-size: 30px; }
                }
            `}</style>

            <div className="hp-root">
                <div className="hp-body">

                    {/* Header */}
                    <div className="hp-header">
                        <p className="hp-eyebrow">Overview</p>
                        <h1 className="hp-title">Your progress</h1>
                        <p className="hp-subtitle">Review and continue your past interview sessions</p>
                    </div>

                    {/* Stats */}
                    {totalSessions > 0 && (
                        <div className="hp-stats">
                            {stats.map(({ icon: Icon, label, value }) => (
                                <div className="hp-stat" key={label}>
                                    <div className="hp-stat-icon">
                                        <Icon size={15} style={{ color: 'var(--ink-soft)' }} />
                                    </div>
                                    <div>
                                        <div className="hp-stat-val">{value}</div>
                                        <div className="hp-stat-label">{label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Section heading */}
                    {totalSessions > 0 && (
                        <div className="hp-section-row">
                            <h2 className="hp-section-title">Sessions</h2>
                            <span className="hp-section-count">{totalSessions} total</span>
                        </div>
                    )}

                    {/* Empty state */}
                    {sessions.length === 0 ? (
                        <div className="hp-empty">
                            <div className="hp-empty-icon">
                                <Clock size={22} style={{ color: 'var(--ink-muted)' }} />
                            </div>
                            <div>
                                <p className="hp-empty-title">No sessions yet</p>
                                <p className="hp-empty-sub">Start your first interview practice session to track your progress here.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="hp-list">
                            {sessions.map((session: any) => {
                                const answered = session.questions.filter((q: any) => q.score !== null);
                                const total = session.questions.length;
                                const avg = answered.length > 0
                                    ? answered.reduce((a: number, q: any) => a + (q.score || 0), 0) / answered.length
                                    : null;
                                const pct = total > 0 ? (answered.length / total) * 100 : 0;
                                    const isCV = String(session.mode || '').toLowerCase() === 'cv';

                                return (
                                    <Link
                                        key={session.id}
                                        href={`/session/${session.id}`}
                                        className="hp-session"
                                    >
                                        <div className="hp-session-top">
                                            <div className="hp-session-icon-wrap">
                                                {isCV
                                                    ? <FileText size={16} style={{ color: 'var(--ink-soft)' }} />
                                                    : <BookOpen size={16} style={{ color: 'var(--ink-soft)' }} />}
                                            </div>
                                            <div className="hp-session-meta">
                                                <div className="hp-session-badges">
                                                    <span className="hp-mode-pill">{isCV ? 'CV' : 'Topic'}</span>
                                                    <span className="hp-session-date">
                                                        {new Date(session.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="hp-session-title">
                                                    {session.input.length > 70 ? session.input.slice(0, 70) + '…' : session.input}
                                                </div>
                                            </div>
                                            <div className="hp-session-score">
                                                {avg !== null && <ScoreBadge score={avg} />}
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="hp-progress-row">
                                            <div className="hp-progress-track">
                                                <div className="hp-progress-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="hp-progress-label">{answered.length}/{total}</span>
                                        </div>

                                        {/* Per-question score dots */}
                                        {answered.length > 0 && (
                                            <div className="hp-dots">
                                                {session.questions.map((q: any) => (
                                                    <ScoreDot key={q.id} score={q.score} />
                                                ))}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}