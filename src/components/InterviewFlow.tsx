'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
    CheckCircle2, ArrowRight, ChevronRight,
    Trophy, AlertCircle, Lightbulb, Timer, FileText, BookOpen
} from 'lucide-react';

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
    optimizedAnswer?: string | null;
    userAnswer?: string | null;
}

const scoreColor = (s: number) =>
    s >= 8 ? '#0a8f7d' : s >= 6 ? '#0d1220' : s >= 4 ? '#b55f14' : '#c0392b';

const scoreBg = (s: number) =>
    s >= 8 ? 'rgba(0,194,168,0.12)' : s >= 6 ? '#f3f5fa' : s >= 4 ? '#fff4e8' : '#fef0ee';

const scoreBorder = (s: number) =>
    s >= 8 ? 'rgba(0,194,168,0.28)' : s >= 6 ? '#dde3ef' : s >= 4 ? '#f3cda7' : '#f4c5bf';

const levelStyle: Record<string, string> = {
    Beginner:     'color:#b55f14;background:#fff4e8;border:1px solid #f3cda7',
    Intermediate: 'color:#3d4460;background:#f3f5fa;border:1px solid #dde3ef',
    Professional: 'color:#0a8f7d;background:rgba(0,194,168,0.12);border:1px solid rgba(0,194,168,0.28)',
};

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
    const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python' | 'java' | 'c' | 'cpp'>('javascript');
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [isGeneratingOptimizedAnswer, setIsGeneratingOptimizedAnswer] = useState(false);
    const [showImproved, setShowImproved] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);
    const langMenuRef = useRef<HTMLDivElement>(null);

    const currentQ = questions[currentIndex];
    const hasBeenEvaluated = currentQ.score !== undefined && currentQ.score !== null;
    const isTheoryQuestion = !currentQ.isCoding;
    const answeredCount = questions.filter(q => q.score !== null && q.score !== undefined).length;
    const progressPct = (answeredCount / questions.length) * 100;

    useEffect(() => {
        setAnswer(currentQ.userAnswer || '');
        setShowImproved(false);
    }, [currentIndex]);

    useEffect(() => {
        if (hasBeenEvaluated && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [hasBeenEvaluated]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
                setLangMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleEvaluate = async () => {
        if (!answer.trim()) return;
        setIsEvaluating(true);
        try {
            const res = await fetch('/api/evaluate-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId: currentQ.id, answer, language }),
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
                optimizedAnswer: currentQ.optimizedAnswer || null,
                userAnswer: answer,
            };
            setQuestions(updated);
        } catch (err: any) {
            alert(err.message || 'Evaluation failed');
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleGenerateOptimizedAnswer = async () => {
        if (!currentQ.userAnswer?.trim()) return;
        setIsGeneratingOptimizedAnswer(true);
        try {
            const res = await fetch('/api/generate-interview-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: currentQ.text,
                    userAnswer: currentQ.userAnswer,
                    isCoding: currentQ.isCoding,
                    feedback: currentQ.feedback,
                    strengths: currentQ.strengths || [],
                    missing: currentQ.missing || [],
                    language,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate');
            const updated = [...questions];
            updated[currentIndex] = {
                ...currentQ,
                optimizedAnswer: currentQ.isCoding ? currentQ.optimizedAnswer || null : data.answer,
                improvedCode: currentQ.isCoding ? (data.optimizedCode || currentQ.improvedCode || null) : currentQ.improvedCode,
                timeComplexity: currentQ.isCoding ? (data.timeComplexity || currentQ.timeComplexity || null) : currentQ.timeComplexity,
            };
            setQuestions(updated);
            if (currentQ.isCoding && (data.optimizedCode || currentQ.improvedCode)) setShowImproved(true);
        } catch (err: any) {
            alert(err.message || 'Failed to generate');
        } finally {
            setIsGeneratingOptimizedAnswer(false);
        }
    };

    const goNext = () => {
        setCurrentIndex(i => i + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const LANGS = [
        ['javascript', 'JavaScript'], ['typescript', 'TypeScript'],
        ['python', 'Python'], ['java', 'Java'], ['c', 'C'], ['cpp', 'C++'],
    ] as const;

    const langLabel = LANGS.find(([v]) => v === language)?.[1] ?? 'JavaScript';

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
                }

                .iv-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    background: var(--bg-alt);
                    font-family: 'Syne', sans-serif;
                    overflow-y: auto;
                }

                /* ── Sticky header ── */
                .iv-header {
                    position: sticky; top: 0; z-index: 20;
                    background: rgba(247,248,252,0.96);
                    backdrop-filter: blur(8px);
                    border-bottom: 1px solid var(--border);
                    padding: 14px 28px;
                    display: flex; align-items: center; gap: 16px;
                }

                .iv-header-meta { flex: 1; min-width: 0; }

                .iv-mode-badge {
                    display: inline-flex; align-items: center; gap: 6px;
                    font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
                    text-transform: uppercase; color: var(--ink-muted);
                    margin-bottom: 2px;
                }

                .iv-topic {
                    font-size: 15px; color: var(--ink);
                    font-weight: 600;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    max-width: 420px;
                }

                .iv-dots {
                    display: flex; align-items: center; gap: 5px; flex-shrink: 0;
                }
                .iv-dot {
                    height: 6px; border-radius: 3px;
                    transition: all 0.25s ease;
                    background: #d7ddeb;
                    width: 6px;
                }
                .iv-dot.done { background: #2f3a56; }
                .iv-dot.active { background: var(--ink); width: 18px; }

                .iv-counter {
                    font-size: 12px; color: var(--ink-muted); font-weight: 500; flex-shrink: 0;
                }

                /* Progress bar */
                .iv-progress-track {
                    height: 3px; background: #e9edf5;
                }
                .iv-progress-fill {
                    height: 100%; background: #2f3a56;
                    transition: width 0.6s ease;
                }

                /* ── Content ── */
                .iv-body {
                    flex: 1;
                    max-width: 740px; margin: 0 auto; width: 100%;
                    padding: 40px 28px 60px;
                    display: flex; flex-direction: column; gap: 28px;
                }

                /* Question */
                .iv-question-wrap {
                    display: flex; flex-direction: column; gap: 10px;
                    animation: fadeUp 0.2s ease both;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(7px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .iv-q-meta {
                    display: flex; align-items: center; gap: 10px;
                }
                .iv-q-num {
                    font-size: 11px; font-weight: 600; color: var(--ink-muted);
                    letter-spacing: 0.06em; text-transform: uppercase;
                }
                .iv-q-type {
                    font-size: 11px; font-weight: 600; padding: 3px 10px;
                    border-radius: 100px; border: 1px solid #dbe2ef;
                    color: #4c5673; background: #f3f5fa;
                    letter-spacing: 0.03em;
                }

                .iv-question-text {
                    font-size: 18px;
                    line-height: 1.65;
                    color: var(--ink);
                    letter-spacing: 0;
                    font-weight: 500;
                }

                /* Section label */
                .iv-label {
                    font-size: 10px; font-weight: 600;
                    letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-muted);
                    margin-bottom: 8px;
                }

                /* Answer section */
                .iv-answer-section { animation: fadeUp 0.2s ease 0.08s both; }

                .iv-lang-row {
                    display: flex; align-items: center; justify-content: flex-end; gap: 8px;
                    margin-bottom: 10px;
                }
                .iv-lang-label { font-size: 11px; color: #bbb; font-weight: 400; }

                .iv-lang-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border);
                    background: #fff; font-size: 12.5px; font-weight: 500; color: var(--ink);
                    cursor: pointer; font-family: 'Syne', sans-serif;
                    transition: border-color 0.15s;
                }
                .iv-lang-btn:hover { border-color: #cfd6e5; }

                .iv-lang-dropdown {
                    position: absolute; right: 0; top: calc(100% + 5px);
                    width: 160px; background: #fff; border: 1px solid var(--border);
                    border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);
                    overflow: hidden; z-index: 30;
                }
                .iv-lang-option {
                    width: 100%; text-align: left; padding: 9px 14px;
                    font-size: 13px; font-weight: 400; color: #555;
                    background: transparent; border: none; cursor: pointer;
                    font-family: 'Syne', sans-serif;
                    transition: background 0.1s, color 0.1s;
                }
                .iv-lang-option:hover { background: var(--bg-alt); color: var(--ink); }
                .iv-lang-option.selected { color: var(--ink); font-weight: 500; background: #f3f5fa; }

                .iv-editor-wrap {
                    border: 1px solid var(--border); border-radius: 10px;
                    overflow: hidden;
                }

                .iv-textarea {
                    width: 100%; background: #fff; color: var(--ink);
                    border: 1px solid var(--border); border-radius: 10px;
                    padding: 16px 18px; font-size: 14px; font-weight: 500;
                    font-family: 'Syne', sans-serif; resize: none; outline: none;
                    line-height: 1.7; transition: border-color 0.15s;
                }
                .iv-textarea::placeholder { color: var(--ink-muted); }
                .iv-textarea:focus { border-color: #cfd6e5; }

                .iv-submit-row {
                    display: flex; justify-content: flex-end; margin-top: 12px;
                }

                .btn-primary {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 11px 22px; background: var(--ink); color: #fff;
                    border: none; border-radius: 8px; font-size: 13.5px; font-weight: 600;
                    font-family: 'Syne', sans-serif; cursor: pointer;
                    transition: background 0.15s, transform 0.1s;
                    letter-spacing: 0.01em;
                }
                .btn-primary:hover:not(:disabled) { background: #000; }
                .btn-primary:active:not(:disabled) { transform: scale(0.99); }
                .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

                .btn-secondary {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 10px 18px; background: #fff; color: var(--ink);
                    border: 1px solid var(--border); border-radius: 8px;
                    font-size: 13px; font-weight: 600;
                    font-family: 'Syne', sans-serif; cursor: pointer;
                    transition: border-color 0.15s, background 0.15s;
                    letter-spacing: 0.01em;
                }
                .btn-secondary:hover:not(:disabled) { border-color: #cfd6e5; background: #f7f8fc; }
                .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

                /* Submitted answer read-only */
                .iv-submitted-code {
                    background: #111; border-radius: 12px;
                    padding: 18px 20px; font-size: 13px; font-family: monospace;
                    color: #e5e5e5; line-height: 1.7; white-space: pre;
                    overflow-x: auto; border: 1px solid #1c1c1c;
                }
                .iv-submitted-text {
                    background: #fff; border: 1px solid var(--border); border-radius: 10px;
                    padding: 16px 18px; font-size: 14px; color: var(--ink-soft);
                    line-height: 1.7; white-space: pre-wrap; font-weight: 500;
                }

                /* ── Results ── */
                .iv-results { display: flex; flex-direction: column; gap: 16px; animation: fadeUp 0.2s ease both; }

                /* Score card */
                .iv-score-card {
                    display: flex; align-items: center; gap: 20px;
                    padding: 24px; background: #fff;
                    border: 1px solid var(--border); border-radius: 10px;
                }

                .iv-score-ring { position: relative; width: 64px; height: 64px; flex-shrink: 0; }
                .iv-score-num {
                    position: absolute; inset: 0;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 20px; font-weight: 700;
                }

                .iv-score-right { flex: 1; min-width: 0; }

                .iv-level-badge {
                    display: inline-block; font-size: 11px; font-weight: 500;
                    padding: 4px 12px; border-radius: 100px; margin-bottom: 8px;
                    letter-spacing: 0.04em;
                }

                .iv-feedback {
                    font-size: 14px; color: var(--ink-soft); line-height: 1.65; font-weight: 500;
                }

                /* Two-col grid */
                .iv-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

                .iv-card {
                    background: #fff; border: 1px solid var(--border);
                    border-radius: 10px; padding: 18px;
                }

                .iv-card-title {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
                    text-transform: uppercase; color: var(--ink-muted); margin-bottom: 14px;
                }

                .iv-list { display: flex; flex-direction: column; gap: 8px; }
                .iv-list-item {
                    display: flex; align-items: flex-start; gap: 9px;
                    font-size: 13px; color: var(--ink-soft); line-height: 1.55; font-weight: 500;
                }
                .iv-list-dot {
                    width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; margin-top: 6px;
                }
                .iv-list-empty { font-size: 12.5px; color: var(--ink-muted); font-style: italic; }

                /* Complexity */
                .iv-complexity {
                    display: flex; align-items: center; gap: 14px;
                    padding: 16px 20px; background: #fff;
                    border: 1px solid var(--border); border-radius: 10px;
                }
                .iv-complexity-icon {
                    width: 36px; height: 36px; border-radius: 8px; background: var(--bg-alt);
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .iv-complexity-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 3px; }
                .iv-complexity-val { font-size: 14px; font-weight: 600; color: var(--ink); font-family: monospace; }

                /* Expandable */
                .iv-expand {
                    background: #fff; border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
                }
                .iv-expand-btn {
                    width: 100%; display: flex; align-items: center; gap: 12px;
                    padding: 16px 20px; background: transparent; border: none;
                    cursor: pointer; text-align: left; font-family: 'Syne', sans-serif;
                    transition: background 0.12s;
                }
                .iv-expand-btn:hover { background: var(--bg-alt); }
                .iv-expand-icon {
                    width: 34px; height: 34px; border-radius: 8px; background: var(--bg-alt);
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .iv-expand-title { font-size: 13.5px; font-weight: 600; color: var(--ink); flex: 1; }
                .iv-expand-body {
                    border-top: 1px solid var(--border);
                    animation: fadeUp 0.15s ease both;
                }
                .iv-code-block {
                    background: #111; padding: 20px 22px;
                    font-size: 12.5px; font-family: monospace; color: #e5e5e5;
                    line-height: 1.7; white-space: pre-wrap; overflow-x: auto;
                    max-height: 320px; overflow-y: auto;
                }
                .iv-text-block {
                    padding: 20px 22px;
                    font-size: 13.5px; color: var(--ink-soft); line-height: 1.75;
                    white-space: pre-wrap; font-weight: 500;
                }

                /* Nav row */
                .iv-nav-row {
                    display: flex; align-items: center; justify-content: space-between;
                    padding-top: 8px;
                }
                .iv-nav-remaining { font-size: 12.5px; color: var(--ink-muted); font-weight: 600; }
                .iv-nav-actions { display: flex; align-items: center; gap: 10px; }

                /* Spinner dots */
                .iv-dots-loader { display: flex; gap: 4px; align-items: center; }
                .iv-dl { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.7); animation: blink 1.2s infinite; }
                .iv-dl:nth-child(2) { animation-delay: 0.2s; }
                .iv-dl:nth-child(3) { animation-delay: 0.4s; }
                @keyframes blink { 0%,100% { opacity:0.3; } 50% { opacity:1; } }

                @media (max-width: 760px) {
                    .iv-two-col { grid-template-columns: 1fr; }
                    .iv-body { padding: 30px 20px 50px; }
                    .iv-header { padding: 12px 18px; }
                    .iv-topic { max-width: 220px; }
                }
            `}</style>

            <div className="iv-root">

                {/* Header */}
                <div className="iv-header">
                    <div className="iv-header-meta">
                        <div className="iv-mode-badge">
                            {mode === 'CV'
                                ? <FileText size={11} />
                                : <BookOpen size={11} />}
                            {mode} Mode
                        </div>
                        <div className="iv-topic">{topic}</div>
                    </div>

                    <div className="iv-dots">
                        {questions.map((q, i) => {
                            const done = q.score !== null && q.score !== undefined;
                            const active = i === currentIndex;
                            return (
                                <div
                                    key={q.id}
                                    className={`iv-dot${active ? ' active' : done ? ' done' : ''}`}
                                />
                            );
                        })}
                    </div>

                    <span className="iv-counter">{currentIndex + 1} / {questions.length}</span>
                </div>

                {/* Progress */}
                <div className="iv-progress-track">
                    <div className="iv-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>

                {/* Body */}
                <div className="iv-body">

                    {/* Question */}
                    <div className="iv-question-wrap">
                        <div className="iv-q-meta">
                            <span className="iv-q-num">Question {currentIndex + 1}</span>
                            <span className="iv-q-type">{currentQ.isCoding ? 'Coding' : 'Theoretical'}</span>
                        </div>
                        <p className="iv-question-text">{currentQ.text}</p>
                    </div>

                    {/* Answer input */}
                    {!hasBeenEvaluated && (
                        <div className="iv-answer-section">
                            <p className="iv-label">Your answer</p>

                            {currentQ.isCoding ? (
                                <>
                                    <div className="iv-lang-row">
                                        <span className="iv-lang-label">Language</span>
                                        <div style={{ position: 'relative' }} ref={langMenuRef}>
                                            <button
                                                className="iv-lang-btn"
                                                onClick={() => setLangMenuOpen(v => !v)}
                                                type="button"
                                            >
                                                {langLabel}
                                                <ChevronRight
                                                    size={12}
                                                    style={{
                                                        color: '#aaa',
                                                        transform: langMenuOpen ? 'rotate(270deg)' : 'rotate(90deg)',
                                                        transition: 'transform 0.15s',
                                                    }}
                                                />
                                            </button>
                                            {langMenuOpen && (
                                                <div className="iv-lang-dropdown">
                                                    {LANGS.map(([lang, label]) => (
                                                        <button
                                                            key={lang}
                                                            className={`iv-lang-option${language === lang ? ' selected' : ''}`}
                                                            onClick={() => { setLanguage(lang as any); setLangMenuOpen(false); }}
                                                            type="button"
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="iv-editor-wrap">
                                        <Editor
                                            height="320px"
                                            language={language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language}
                                            theme="vs-light"
                                            value={answer}
                                            onChange={v => setAnswer(v ?? '')}
                                            options={{
                                                fontSize: 13,
                                                minimap: { enabled: false },
                                                wordWrap: 'on',
                                                scrollBeyondLastLine: false,
                                                tabSize: 2,
                                                insertSpaces: true,
                                                automaticLayout: true,
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <textarea
                                    className="iv-textarea"
                                    value={answer}
                                    onChange={e => setAnswer(e.target.value)}
                                    placeholder="Type your answer here. Include key concepts, examples, and reasoning…"
                                    rows={8}
                                />
                            )}

                            <div className="iv-submit-row">
                                <button
                                    className="btn-primary"
                                    onClick={handleEvaluate}
                                    disabled={!answer.trim() || isEvaluating}
                                    type="button"
                                >
                                    {isEvaluating ? (
                                        <>
                                            <div className="iv-dots-loader">
                                                <div className="iv-dl" /><div className="iv-dl" /><div className="iv-dl" />
                                            </div>
                                            Evaluating…
                                        </>
                                    ) : 'Evaluate answer'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Submitted answer read-only */}
                    {hasBeenEvaluated && currentQ.userAnswer && (
                        <div style={{ animation: 'fadeUp 0.2s ease both' }}>
                            <p className="iv-label">Your answer</p>
                            {currentQ.isCoding
                                ? <div className="iv-submitted-code">{currentQ.userAnswer}</div>
                                : <div className="iv-submitted-text">{currentQ.userAnswer}</div>
                            }
                        </div>
                    )}

                    {/* Results */}
                    {hasBeenEvaluated && (
                        <div className="iv-results" ref={resultRef}>

                            {/* Score card */}
                            <div className="iv-score-card">
                                <div className="iv-score-ring">
                                    <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx="32" cy="32" r="26" fill="none" stroke="#ebebeb" strokeWidth="5" />
                                        <circle
                                            cx="32" cy="32" r="26" fill="none"
                                            stroke={scoreColor(currentQ.score!)}
                                            strokeWidth="5" strokeLinecap="round"
                                            strokeDasharray={`${(currentQ.score! / 10) * 163.4} 163.4`}
                                        />
                                    </svg>
                                    <div className="iv-score-num" style={{ color: scoreColor(currentQ.score!) }}>
                                        {currentQ.score}
                                    </div>
                                </div>
                                <div className="iv-score-right">
                                    <span
                                        className="iv-level-badge"
                                        style={{ ...(Object.fromEntries((levelStyle[currentQ.level!] || levelStyle.Intermediate).split(';').filter(Boolean).map(s => { const [k, v] = s.split(':'); return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v?.trim()]; }))) }}
                                    >
                                        {currentQ.level}
                                    </span>
                                    <p className="iv-feedback">{currentQ.feedback}</p>
                                </div>
                            </div>

                            {/* Strengths + Missing */}
                            <div className="iv-two-col">
                                <div className="iv-card">
                                    <div className="iv-card-title">
                                        <CheckCircle2 size={13} style={{ color: '#0a8f7d' }} />
                                        Strengths
                                    </div>
                                    {currentQ.strengths && currentQ.strengths.length > 0 ? (
                                        <div className="iv-list">
                                            {currentQ.strengths.map((s, i) => (
                                                <div key={i} className="iv-list-item">
                                                    <div className="iv-list-dot" style={{ background: '#0a8f7d' }} />
                                                    <span>{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="iv-list-empty">No strengths highlighted.</p>}
                                </div>

                                <div className="iv-card">
                                    <div className="iv-card-title">
                                        <AlertCircle size={13} style={{ color: '#b55f14' }} />
                                        Areas to improve
                                    </div>
                                    {currentQ.missing && currentQ.missing.length > 0 ? (
                                        <div className="iv-list">
                                            {currentQ.missing.map((m, i) => (
                                                <div key={i} className="iv-list-item">
                                                    <div className="iv-list-dot" style={{ background: '#b55f14' }} />
                                                    <span>{m}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="iv-list-empty">Nothing flagged here.</p>}
                                </div>
                            </div>

                            {/* Time complexity */}
                            {currentQ.timeComplexity && (
                                <div className="iv-complexity">
                                    <div className="iv-complexity-icon">
                                        <Timer size={15} style={{ color: '#666' }} />
                                    </div>
                                    <div>
                                        <div className="iv-complexity-label">Time Complexity</div>
                                        <div className="iv-complexity-val">{currentQ.timeComplexity}</div>
                                    </div>
                                </div>
                            )}

                            {/* Improved code */}
                            {currentQ.improvedCode && (
                                <div className="iv-expand">
                                    <button className="iv-expand-btn" onClick={() => setShowImproved(v => !v)} type="button">
                                        <div className="iv-expand-icon">
                                            <Lightbulb size={15} style={{ color: '#666' }} />
                                        </div>
                                        <span className="iv-expand-title">Optimized code</span>
                                        <ChevronRight size={14} style={{ color: '#bbb', transform: showImproved ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
                                    </button>
                                    {showImproved && (
                                        <div className="iv-expand-body">
                                            <div className="iv-code-block">{currentQ.improvedCode}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Expert answer (theory) */}
                            {isTheoryQuestion && currentQ.optimizedAnswer && (
                                <div className="iv-expand">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #ebebeb' }}>
                                        <div className="iv-expand-icon">
                                            <Lightbulb size={15} style={{ color: '#666' }} />
                                        </div>
                                        <span className="iv-expand-title">Expert answer</span>
                                    </div>
                                    <div className="iv-expand-body">
                                        <div className="iv-text-block">{currentQ.optimizedAnswer}</div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="iv-nav-row">
                                <span className="iv-nav-remaining">
                                    {currentIndex < questions.length - 1
                                        ? `${questions.length - currentIndex - 1} question${questions.length - currentIndex - 1 !== 1 ? 's' : ''} remaining`
                                        : 'All done!'}
                                </span>
                                <div className="iv-nav-actions">
                                    <button
                                        className="btn-secondary"
                                        onClick={handleGenerateOptimizedAnswer}
                                        disabled={isGeneratingOptimizedAnswer}
                                        type="button"
                                    >
                                        <Lightbulb size={13} />
                                        {isGeneratingOptimizedAnswer
                                            ? 'Generating…'
                                            : isTheoryQuestion
                                                ? (currentQ.optimizedAnswer ? 'Regenerate answer' : 'Expert answer')
                                                : (currentQ.improvedCode ? 'Regenerate code' : 'Optimized code')}
                                    </button>

                                    {currentIndex < questions.length - 1 ? (
                                        <button className="btn-primary" onClick={goNext} type="button">
                                            Next question
                                            <ArrowRight size={14} />
                                        </button>
                                    ) : (
                                        <button className="btn-primary" onClick={() => window.location.href = '/history'} type="button">
                                            <Trophy size={14} />
                                            View results
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}