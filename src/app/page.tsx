'use client';

import { useState, useRef, Suspense } from 'react';
import { Upload, ArrowRight, BookOpen, FileText, Code2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const EXAMPLE_TOPICS = [
    'React Hooks & useEffect',
    'Spring Boot Security',
    'Database Normalization',
    'Java OOP Principles',
    'Binary Trees & Graphs',
    'System Design: URL Shortener',
];

function HomeContent() {
    const router = useRouter();
    const params = useSearchParams();
    const initialMode = params.get('mode') === 'cv' ? 'cv' : params.get('mode') === 'topic' ? 'topic' : null;

    const [activeMode, setActiveMode] = useState<'cv' | 'topic' | null>(initialMode);
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startCV = async (file: File) => {
        setIsLoading(true);
        setLoadingMsg('Extracting CV skills...');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await fetch('/api/upload-cv', { method: 'POST', body: formData });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to extract CV');
            setLoadingMsg('Generating interview questions...');
            const res = await fetch('/api/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'cv', input: uploadData.text }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate');
            router.push(`/session/${data.sessionId}`);
        } catch (err: any) {
            alert(err.message);
            setIsLoading(false);
        }
    };

    const startTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;
        setIsLoading(true);
        setLoadingMsg('Generating interview questions...');
        try {
            const res = await fetch('/api/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'topic', input: topic }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate');
            router.push(`/session/${data.sessionId}`);
        } catch (err: any) {
            alert(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                    <div className="relative w-12 h-12 mb-5">
                        <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
                        <div className="absolute inset-0 rounded-full border-t-2 border-gray-900" style={{ animation: 'spin 0.8s linear infinite' }} />
                    </div>
                    <p className="text-gray-900 font-semibold">{loadingMsg}</p>
                    <p className="text-gray-400 text-sm mt-1">This takes a few seconds</p>
                </div>
            )}

            <div className="max-w-xl w-full mx-auto px-5 py-16 flex flex-col gap-9 animate-fade-up">

                {/* Hero */}
                <div className="text-center flex flex-col items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#0d0d0d] flex items-center justify-center">
                        <span className="text-white text-lg font-bold">P</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">PrepAI</h1>
                        <p className="text-gray-500 mt-1.5 text-sm">AI-powered technical interview practice</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                        {['5 Questions', 'AI Scoring', 'Code Editor'].map(label => (
                            <span key={label} className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-500 font-medium">
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Mode selector */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setActiveMode(m => m === 'cv' ? null : 'cv')}
                        className={`flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all group ${
                            activeMode === 'cv'
                                ? 'bg-gray-50 border-gray-900 ring-1 ring-gray-900'
                                : 'bg-white border-gray-200 hover:border-gray-400'
                        }`}>
                        <div className={`p-2 rounded-lg ${activeMode === 'cv' ? 'bg-gray-900' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                            <FileText size={18} className={activeMode === 'cv' ? 'text-white' : 'text-gray-600'} />
                        </div>
                        <div>
                            <div className="font-semibold text-sm text-gray-900">CV Interview</div>
                            <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">Upload PDF, get tailored questions</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveMode(m => m === 'topic' ? null : 'topic')}
                        className={`flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all group ${
                            activeMode === 'topic'
                                ? 'bg-gray-50 border-gray-900 ring-1 ring-gray-900'
                                : 'bg-white border-gray-200 hover:border-gray-400'
                        }`}>
                        <div className={`p-2 rounded-lg ${activeMode === 'topic' ? 'bg-gray-900' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                            <BookOpen size={18} className={activeMode === 'topic' ? 'text-white' : 'text-gray-600'} />
                        </div>
                        <div>
                            <div className="font-semibold text-sm text-gray-900">Topic Practice</div>
                            <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">Enter any topic, mixed Q&A</div>
                        </div>
                    </button>
                </div>

                {/* CV Upload */}
                {activeMode === 'cv' && (
                    <div className="animate-fade-up">
                        <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) startCV(f); }} />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) startCV(f); }}
                            className={`w-full flex flex-col items-center justify-center gap-4 py-12 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                                dragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                            }`}>
                            <div className="p-4 rounded-xl bg-gray-100">
                                <Upload size={24} className="text-gray-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-900">Drop your PDF here, or click to browse</p>
                                <p className="text-xs text-gray-400 mt-1">AI extracts your skills and generates questions</p>
                            </div>
                            <span className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                                <Upload size={14} />
                                Upload CV
                            </span>
                        </div>
                    </div>
                )}

                {/* Topic Input */}
                {activeMode === 'topic' && (
                    <div className="animate-fade-up flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                            {EXAMPLE_TOPICS.map(t => (
                                <button key={t} onClick={() => setTopic(t)}
                                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                        topic === t
                                            ? 'bg-gray-900 border-gray-900 text-white'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                                    }`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                        <form onSubmit={startTopic} className="flex flex-col gap-3">
                            <div className="relative">
                                <Code2 size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                                <textarea
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g. React Hooks, Spring Boot Security, Binary Search Trees..."
                                    rows={3}
                                    className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm resize-none leading-relaxed placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!topic.trim()}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white font-medium text-sm transition-colors">
                                Generate 5 Questions
                                <ArrowRight size={15} />
                            </button>
                        </form>
                    </div>
                )}

                {activeMode === null && (
                    <p className="text-center text-sm text-gray-400 animate-fade-in">Choose a mode above to begin</p>
                )}
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="flex-1 bg-white" />}>
            <HomeContent />
        </Suspense>
    );
}
