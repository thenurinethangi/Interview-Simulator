'use client';

import { useState, useEffect, useRef } from 'react';
import { Code2, CheckCircle2, ArrowRight, ChevronRight, Trophy, AlertCircle, Lightbulb, Timer, FileText, BookOpen } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface Question {
    id: string;
    text: string;
    isCoding: boolean;
    score?: number | null;
    level?: string | null;
    feedback?: string | null;
    strengths?: string[] | null;
    missing?: string[] | null;
    timeComplexity?: string | null;
    improvedCode?: string | null;
    userAnswer?: string | null;
}

const LEVEL_COLOR: Record<string, string> = {
    Beginner:     'text-amber-600 bg-amber-50 border-amber-200',
    Intermediate: 'text-blue-600 bg-blue-50 border-blue-200',
    Professional: 'text-purple-600 bg-purple-50 border-purple-200',
};

const scoreColor = (s: number) =>
    s >= 8 ? '#10a37f' : s >= 6 ? '#2563eb' : s >= 4 ? '#d97706' : '#dc2626';

const scoreTxt = (s: number) =>
    s >= 8 ? 'text-emerald-600' : s >= 6 ? 'text-blue-600' : s >= 4 ? 'text-amber-600' : 'text-red-600';

export default function InterviewFlow({ sessionId, topic, mode, initialQuestions }: any) {
    const [questions, setQuestions] = useState<Question[]>(() =>
        initialQuestions.map((q: any) => ({
            ...q,
            strengths: q.strengths ? (typeof q.strengths === 'string' ? JSON.parse(q.strengths) : q.strengths) : null,
            missing:   q.missing   ? (typeof q.missing   === 'string' ? JSON.parse(q.missing)   : q.missing)   : null,
        }))
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [editorLanguage, setEditorLanguage] = useState('javascript');
    const [showImproved, setShowImproved] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);

    const currentQ = questions[currentIndex];
    const hasBeenEvaluated = currentQ.score !== undefined && currentQ.score !== null;

    const isCodeMode = currentQ.isCoding ||
        answer.includes('public class') || answer.includes('function ') ||
        answer.includes('const ') || answer.includes('def ') ||
        answer.includes('=>') || answer.includes('import ');

    useEffect(() => {
        setAnswer(currentQ.userAnswer || '');
        setShowImproved(false);
    }, [currentIndex]);

    useEffect(() => {
        if (hasBeenEvaluated && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [hasBeenEvaluated]);

    const handleEvaluate = async () => {
        if (!answer.trim()) return;
        setIsEvaluating(true);
        try {
            const res = await fetch('/api/evaluate-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId: currentQ.id, answer }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            const ev = data.evaluation;
            const updated = [...questions];
            updated[currentIndex] = {
                ...currentQ,
                score: ev.score, level: ev.level, feedback: ev.feedback,
                strengths: ev.strengths || [], missing: ev.missing || [],
                timeComplexity: ev.timeComplexity || null,
                improvedCode: ev.improvedCode || null,
                userAnswer: answer,
            };
            setQuestions(updated);
        } catch (err: any) {
            alert(err.message || 'Evaluation failed');
        } finally {
            setIsEvaluating(false);
        }
    };

    const goNext = () => {
        setCurrentIndex(i => i + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const answeredCount = questions.filter(q => q.score !== null && q.score !== undefined).length;
    const progressPct = (answeredCount / questions.length) * 100;

    return (
        <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">

            {/* Sticky header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="shrink-0 p-1.5 rounded-lg bg-gray-100">
                        {mode === 'CV'
                            ? <FileText size={14} className="text-gray-600" />
                            : <BookOpen size={14} className="text-gray-600" />}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{mode} Mode</p>
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[260px]">{topic}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {questions.map((q, i) => {
                        const done = q.score !== null && q.score !== undefined;
                        const active = i === currentIndex;
                        return (
                            <div key={q.id} className={`rounded-full transition-all duration-200 ${
                                active ? 'w-5 h-2 bg-gray-900' :
                                done   ? 'w-2 h-2 bg-emerald-500' :
                                         'w-2 h-2 bg-gray-200'}`} />
                        );
                    })}
                </div>
                <span className="shrink-0 text-xs text-gray-400 font-medium">{currentIndex + 1} / {questions.length}</span>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-gray-100">
                <div className="h-full bg-gray-900 transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Content */}
            <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-8 flex flex-col gap-6">

                {/* Question bubble */}
                <div className="flex items-start gap-3 animate-fade-up">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-gray-900">PrepAI</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                currentQ.isCoding
                                    ? 'text-purple-600 bg-purple-50 border-purple-200'
                                    : 'text-sky-600 bg-sky-50 border-sky-200'}`}>
                                {currentQ.isCoding ? 'Coding' : 'Theoretical'}
                            </span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4">
                            <p className="text-gray-900 text-sm leading-relaxed">{currentQ.text}</p>
                        </div>
                    </div>
                </div>

                {/* Answer input */}
                {!hasBeenEvaluated && (
                    <div className="flex flex-col gap-3 animate-fade-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Your Answer</label>
                            {isCodeMode && (
                                <select value={editorLanguage} onChange={e => setEditorLanguage(e.target.value)}
                                    className="text-xs bg-white text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 cursor-pointer hover:border-gray-400 transition-colors outline-none">
                                    <option value="javascript">JavaScript</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                </select>
                            )}
                        </div>
                        {isCodeMode ? (
                            <div className="rounded-xl overflow-hidden border border-gray-200">
                                <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <span className="text-xs text-gray-400 ml-2 font-mono">{editorLanguage}</span>
                                    <Code2 size={12} className="text-gray-300 ml-auto" />
                                </div>
                                <Editor
                                    height={300}
                                    language={editorLanguage}
                                    theme="vs"
                                    value={answer}
                                    onChange={val => setAnswer(val || '')}
                                    options={{ minimap: { enabled: false }, fontSize: 13, lineHeight: 21, padding: { top: 14, bottom: 14 }, scrollBeyondLastLine: false }}
                                />
                            </div>
                        ) : (
                            <textarea
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                placeholder={"Type your answer here...\n\nTip: Start with 'function' or 'public class' to activate the code editor."}
                                rows={7}
                                className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none leading-relaxed placeholder-gray-300 focus:border-gray-400 outline-none transition-all"
                            />
                        )}
                        <div className="flex justify-end">
                            <button
                                onClick={handleEvaluate}
                                disabled={!answer.trim() || isEvaluating}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors">
                                {isEvaluating ? (
                                    <><span className="flex gap-1"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></span> Evaluating</>
                                ) : (
                                    'Evaluate Answer'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Submitted answer (read-only) */}
                {hasBeenEvaluated && currentQ.userAnswer && (
                    <div className="flex flex-col gap-2 animate-fade-up">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Your Answer</label>
                        {(currentQ.isCoding || currentQ.userAnswer.includes('function ') || currentQ.userAnswer.includes('public class')) ? (
                            <div className="rounded-xl overflow-hidden border border-gray-200">
                                <Editor height={180} language={editorLanguage} theme="vs"
                                    value={currentQ.userAnswer}
                                    options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 } }} />
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {currentQ.userAnswer}
                            </div>
                        )}
                    </div>
                )}

                {/* Evaluation results */}
                {hasBeenEvaluated && (
                    <div ref={resultRef} className="flex flex-col gap-4 animate-fade-up">

                        {/* Score row */}
                        <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                            <div className="relative w-14 h-14 shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                                    <circle cx="28" cy="28" r="22" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                                    <circle cx="28" cy="28" r="22" fill="none"
                                        stroke={scoreColor(currentQ.score!)}
                                        strokeWidth="5" strokeLinecap="round"
                                        strokeDasharray={`${(currentQ.score! / 10) * 138.2} 138.2`} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-base font-bold ${scoreTxt(currentQ.score!)}`}>{currentQ.score}</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${LEVEL_COLOR[currentQ.level!] || LEVEL_COLOR.Beginner}`}>
                                        {currentQ.level}
                                    </span>
                                    <span className="text-gray-400 text-xs">out of 10</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{currentQ.feedback}</p>
                            </div>
                        </div>

                        {/* Strengths + Missing */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Strengths</span>
                                </div>
                                {currentQ.strengths && currentQ.strengths.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {currentQ.strengths.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-emerald-800 leading-relaxed">
                                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />{s}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-xs text-gray-400">None recorded.</p>}
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle size={14} className="text-amber-600" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Missing</span>
                                </div>
                                {currentQ.missing && currentQ.missing.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {currentQ.missing.map((m, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-amber-800 leading-relaxed">
                                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />{m}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-xs text-gray-400">Nothing missing!</p>}
                            </div>
                        </div>

                        {/* Time complexity */}
                        {currentQ.timeComplexity && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
                                <Timer size={14} className="text-blue-500 shrink-0" />
                                <div>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">Complexity</span>
                                    <code className="text-sm text-blue-700 font-mono">{currentQ.timeComplexity}</code>
                                </div>
                            </div>
                        )}

                        {/* Improved code toggle */}
                        {currentQ.improvedCode && (
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <button onClick={() => setShowImproved(v => !v)}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                                    <Lightbulb size={14} className="text-gray-500" />
                                    <span className="text-xs font-semibold text-gray-600 flex-1">Improved Code Suggestion</span>
                                    <ChevronRight size={13} className={`text-gray-400 transition-transform ${showImproved ? 'rotate-90' : ''}`} />
                                </button>
                                {showImproved && (
                                    <div className="animate-fade-in border-t border-gray-200">
                                        <Editor height={200} language={editorLanguage} theme="vs" value={currentQ.improvedCode}
                                            options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 } }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-gray-400">
                                {currentIndex < questions.length - 1
                                    ? `${questions.length - currentIndex - 1} question(s) remaining`
                                    : 'All done!'}
                            </span>
                            {currentIndex < questions.length - 1 ? (
                                <button onClick={goNext}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-medium text-sm transition-colors">
                                    Next Question <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button onClick={() => window.location.href = '/history'}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-medium text-sm transition-colors">
                                    <Trophy size={14} /> View Results
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
