'use client';

import { useState, useRef, Suspense } from 'react';
import { Upload, ArrowRight, BookOpen, FileText } from 'lucide-react';
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

  const [activeMode, setActiveMode] = useState<'cv' | 'topic' | null>(null);
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCV = async (file: File) => {
    setIsLoading(true);
    setLoadingMsg('Extracting curriculum from document…');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to extract CV');

      setLoadingMsg('Generating evaluation rubric…');
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
    setLoadingMsg('Generating study materials…');

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Syne:wght@400;500;600;700&display=swap');

        :root {
          --bg-main:    #ffffff;
          --bg-alt:     #f7f8fc;
          --ink:        #0d1220;
          --ink-soft:   #3d4460;
          --ink-muted:  #8b90a8;
          --border:     #e2e8f0;
          --teal:       #00c2a8;
        }

        .home-root {
          min-height: 100vh;
          background: var(--bg-alt);
          font-family: 'Syne', system-ui, sans-serif;
          color: var(--ink);
          padding: 96px 24px 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .home-card {
          width: 100%;
          max-width: 520px;
        }

        .home-eyebrow {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-muted);
          margin-bottom: 12px;
        }

        .home-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px;
          font-weight: 600;
          line-height: 1.08;
          margin-bottom: 48px;
          color: var(--ink);
        }

        .home-title em {
          font-style: italic;
          color: var(--ink);
        }

        .mode-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 32px;
        }

        .mode-card {
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--bg-main);
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mode-card:hover {
          border-color: var(--ink-soft);
        }

        .mode-card.active {
          border-color: var(--ink);
          box-shadow: 0 2px 12px rgba(13,18,32,0.06);
        }

        .mode-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--bg-alt);
          color: var(--ink-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .mode-card.active .mode-icon {
          background: var(--ink);
          color: white;
        }

        .mode-label {
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
        }

        .mode-desc {
          font-size: 13.5px;
          line-height: 1.55;
          color: var(--ink-soft);
        }

        /* Dropzone */
        .dropzone {
          border: 1.5px dashed var(--border);
          border-radius: 10px;
          padding: 56px 32px;
          text-align: center;
          background: var(--bg-main);
          transition: all 0.2s;
          cursor: pointer;
        }

        .dropzone:hover,
        .dropzone.drag-over {
          border-color: var(--ink-soft);
          background: var(--bg-alt);
        }

        .drop-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          background: var(--bg-alt);
          color: var(--ink-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          transition: all 0.2s;
        }

        .dropzone:hover .drop-icon-wrap,
        .dropzone.drag-over .drop-icon-wrap {
          background: var(--ink);
          color: white;
        }

        .drop-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .drop-sub {
          font-size: 13.5px;
          color: var(--ink-soft);
          line-height: 1.5;
          max-width: 320px;
          margin: 0 auto;
        }

        /* Topic */
        .topic-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 24px;
        }

        .chip {
          font-size: 13px;
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--bg-main);
          color: var(--ink-soft);
          cursor: pointer;
          transition: all 0.15s;
        }

        .chip:hover {
          border-color: var(--ink-soft);
          color: var(--ink);
        }

        .chip.selected {
          background: var(--ink);
          color: white;
          border-color: var(--ink);
        }

        .topic-textarea {
          width: 100%;
          min-height: 112px;
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 15px;
          line-height: 1.6;
          resize: vertical;
          background: var(--bg-main);
          transition: border-color 0.2s;
        }

        .topic-textarea:focus {
          border-color: var(--ink-soft);
          outline: none;
        }

        .topic-textarea::placeholder {
          color: var(--ink-muted);
        }

        /* Buttons ─ unified with sidebar & landing */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 24px;
          background: var(--ink);
          color: white;
          font-size: 14.5px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #000;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-outline {
          padding: 13px 24px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: white;
          color: var(--ink);
          font-weight: 600;
          font-size: 14.5px;
          cursor: pointer;
          transition: border-color 0.15s;
        }

        .btn-outline:hover {
          border-color: var(--ink-soft);
        }

        /* Loading overlay */
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(248,249,252,0.92);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-inner {
          background: white;
          padding: 40px 56px;
          border-radius: 12px;
          border: 1px solid var(--border);
          box-shadow: 0 12px 36px rgba(13,18,32,0.08);
          text-align: center;
        }

        .spinner-ring {
          width: 48px;
          height: 48px;
          position: relative;
          margin: 0 auto 20px;
        }

        .spinner-track, .spinner-fill {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid transparent;
        }

        .spinner-track { border-color: var(--border); }
        .spinner-fill {
          border-top-color: var(--ink);
          animation: spin 0.9s cubic-bezier(0.55,0.1,0.35,0.9) infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-title {
          font-size: 15.5px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .loading-sub {
          font-size: 13.5px;
          color: var(--ink-muted);
        }

        @media (max-width: 640px) {
          .mode-grid { grid-template-columns: 1fr; }
          .home-title { font-size: 38px; }
          .home-root { padding: 80px 20px 60px; }
        }
      `}</style>

      <div className="home-root">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-inner">
              <div className="spinner-ring">
                <div className="spinner-track" />
                <div className="spinner-fill" />
              </div>
              <div>
                <div className="loading-title">{loadingMsg}</div>
                <div className="loading-sub">Preparing your session…</div>
              </div>
            </div>
          </div>
        )}

        <div className="home-card">
          <span className="home-eyebrow">New Session</span>
          <h1 className="home-title">
            How would you like<br />to <em>practice?</em>
          </h1>

          <div className="mode-grid">
            <button
              type="button"
              className={`mode-card ${activeMode === 'cv' ? 'active' : ''}`}
              onClick={() => setActiveMode(prev => prev === 'cv' ? null : 'cv')}
            >
              <div className="mode-icon"><FileText size={18} /></div>
              <div>
                <div className="mode-label">Resume Evaluation</div>
                <div className="mode-desc">Upload your CV — receive questions tailored to your experience.</div>
              </div>
            </button>

            <button
              type="button"
              className={`mode-card ${activeMode === 'topic' ? 'active' : ''}`}
              onClick={() => setActiveMode(prev => prev === 'topic' ? null : 'topic')}
            >
              <div className="mode-icon"><BookOpen size={18} /></div>
              <div>
                <div className="mode-label">Topic Drill</div>
                <div className="mode-desc">Focus on any concept — get mixed conceptual & coding questions.</div>
              </div>
            </button>
          </div>

          {activeMode === 'cv' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) startCV(file);
                }}
              />

              <div
                className={`dropzone ${dragOver ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) startCV(file);
                }}
              >
                <div className="drop-icon-wrap"><Upload size={22} /></div>
                <div className="drop-title">Drop your CV (PDF) here</div>
                <div className="drop-sub">
                  We’ll extract your background and generate a personalized practice session.
                </div>

                <button
                  type="button"
                  className="btn-outline"
                  style={{ marginTop: 20 }}
                  onClick={e => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Select File
                </button>
              </div>
            </div>
          )}

          {activeMode === 'topic' && (
            <form onSubmit={startTopic}>
              <div className="topic-chips">
                {EXAMPLE_TOPICS.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`chip ${topic === t ? 'selected' : ''}`}
                    onClick={() => setTopic(prev => prev === t ? '' : t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <textarea
                className="topic-textarea"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. React Server Components, Kubernetes RBAC, GraphQL Federation…"
                rows={3}
              />

              <button
                type="submit"
                disabled={!topic.trim() || isLoading}
                className="btn-primary"
                style={{ marginTop: 16, width: '100%' }}
              >
                Generate Questions
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {activeMode === null && (
            <div style={{
              textAlign: 'center',
              color: 'var(--ink-muted)',
              fontSize: '14px',
              padding: '32px 0',
              fontWeight: 500,
            }}>
              Select a practice mode to begin
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-alt)' }} />}>
      <HomeContent />
    </Suspense>
  );
}