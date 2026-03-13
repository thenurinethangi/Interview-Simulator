import { db } from "@/lib/db";
import Link from 'next/link';
import { Clock, BookOpen, FileText, ChevronRight, Trophy, TrendingUp, BarChart3, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function ScoreBadge({ score }: { score: number }) {
    const cls = score >= 8 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : score >= 6 ? 'text-blue-700 bg-blue-50 border-blue-200'
              : score >= 4 ? 'text-amber-700 bg-amber-50 border-amber-200'
                           : 'text-red-700 bg-red-50 border-red-200';
    return <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${cls}`}>{score.toFixed(1)}</span>;
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

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
            <div className="max-w-3xl mx-auto w-full px-5 py-10 flex flex-col gap-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">History</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Track your performance over time</p>
                    </div>
                    <Link href="/" className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-700 rounded-xl text-sm font-medium text-white transition-colors">
                        New session
                    </Link>
                </div>

                {/* Stats */}
                {totalSessions > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { icon: <BarChart3 size={16} />, label: 'Sessions', value: String(totalSessions) },
                            { icon: <CheckCircle2 size={16} />, label: 'Completed', value: String(completedSessions) },
                            { icon: <TrendingUp size={16} />, label: 'Avg Score', value: overallAvg !== null ? overallAvg.toFixed(1) + '/10' : 'N/A' },
                            { icon: <Trophy size={16} />, label: 'Best Score', value: topScore !== null ? topScore.toFixed(1) + '/10' : 'N/A' },
                        ].map(s => (
                            <div key={s.label} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                                <div className="text-gray-400 mb-2">{s.icon}</div>
                                <div className="text-lg font-bold text-gray-900">{s.value}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Session list */}
                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-xl">
                        <Clock size={28} className="text-gray-300 mb-4" />
                        <h3 className="text-base font-semibold text-gray-700 mb-1">No history yet</h3>
                        <p className="text-sm text-gray-400 text-center max-w-xs leading-relaxed">
                            Start a session by uploading your CV or entering a topic.
                        </p>
                        <Link href="/" className="mt-5 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors">
                            Start Session
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5 stagger">
                        {sessions.map((session: any) => {
                            const answered = session.questions.filter((q: any) => q.score !== null);
                            const total = session.questions.length;
                            const avg = answered.length > 0
                                ? answered.reduce((a: number, q: any) => a + (q.score || 0), 0) / answered.length
                                : null;
                            const isCV = session.mode === 'CV';
                            const pct = total > 0 ? (answered.length / total) * 100 : 0;

                            return (
                                <Link key={session.id} href={`/session/${session.id}`}
                                    className="group flex flex-col gap-3 p-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl transition-all shadow-sm animate-fade-up">

                                    <div className="flex items-start gap-3">
                                        <div className={`shrink-0 p-2.5 rounded-lg ${isCV ? 'bg-blue-50 border border-blue-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                                            {isCV ? <FileText size={16} className="text-blue-600" /> : <BookOpen size={16} className="text-emerald-600" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                        {session.input.length > 65 ? session.input.slice(0, 65) + '...' : session.input}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {session.mode} &middot; {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {avg !== null && <ScoreBadge score={avg} />}
                                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gray-900 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-xs text-gray-400 shrink-0">{answered.length}/{total}</span>
                                    </div>

                                    {/* Per-question scores */}
                                    {answered.length > 0 && (
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {session.questions.map((q: any, i: number) => (
                                                <div key={q.id} title={`Q${i + 1}: ${q.score !== null ? q.score + '/10' : 'Unanswered'}`}
                                                    className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                                                        q.score !== null
                                                            ? q.score >= 8 ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                            : q.score >= 6 ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                            : q.score >= 4 ? 'bg-amber-50 border-amber-200 text-amber-700'
                                                                           : 'bg-red-50 border-red-200 text-red-700'
                                                            : 'bg-gray-50 border-gray-200 text-gray-300'
                                                    }`}>
                                                    {q.score !== null ? q.score : '-'}
                                                </div>
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
    );
}
