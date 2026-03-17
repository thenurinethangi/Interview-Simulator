'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain } from 'lucide-react';

function RegisterPageContent() {
    const router = useRouter();
    const params = useSearchParams();
    const redirect = params.get('redirect') || '/';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeField, setActiveField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            router.push(redirect);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = () => { window.location.href = '/api/auth/google'; };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Syne:wght@400;500;600;700;800&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --void:      #080b10;
                    --deep:      #0d1220;
                    --panel:     #161d2e;
                    --rim:       rgba(255,255,255,0.06);
                    --rim-hi:    rgba(255,255,255,0.12);
                    --teal:      #00c2a8;
                    --teal-dim:  rgba(0,194,168,0.18);
                    --teal-glow: rgba(0,194,168,0.08);
                    --amber:     #f5a623;
                    --txt:       #eef1f7;
                    --txt-soft:  rgba(238,241,247,0.55);
                    --txt-muted: rgba(238,241,247,0.28);
                    --form-bg:   #f7f8fc;
                    --ink:       #0d1220;
                    --ink-soft:  #3d4460;
                    --ink-muted: #8b90a8;
                    --ink-faint: #b8bbce;
                    --f-border:  rgba(13,18,32,0.12);
                    --f-focus:   #00c2a8;
                    --error:     #c0392b;
                    --error-bg:  #fdf3f2;
                }

                html, body { height: 100%; }

                .root {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'Syne', sans-serif;
                    background: var(--void);
                }

                /* ═══════════════════════════════
                   LEFT PANEL
                   ═══════════════════════════════ */
                .panel-l {
                    flex: 1.15;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    padding: 48px 56px 52px;
                    overflow: hidden;
                    background: var(--deep);
                }

                .atmosphere {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 70% 55% at 85% 20%, rgba(0,194,168,0.10) 0%, transparent 55%),
                        radial-gradient(ellipse 50% 60% at 10% 90%, rgba(245,166,35,0.07) 0%, transparent 55%);
                    pointer-events: none;
                    z-index: 0;
                }

                /* Grid of steps visual — unique to register */
                .steps-visual {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-22%, -50%);
                    width: 500px;
                    pointer-events: none;
                    z-index: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .steps-row {
                    display: flex;
                    align-items: stretch;
                }

                .steps-cell {
                    width: 80px;
                    height: 80px;
                    border: 1px solid rgba(0,194,168,0.06);
                    position: relative;
                    flex-shrink: 0;
                }

                .steps-cell.lit {
                    background: rgba(0,194,168,0.04);
                    border-color: rgba(0,194,168,0.12);
                }

                .steps-cell.bright {
                    background: rgba(0,194,168,0.08);
                    border-color: rgba(0,194,168,0.2);
                }

                /* Floating journey card */
                .journey-card {
                    position: absolute;
                    top: 50%;
                    right: 52px;
                    transform: translateY(-50%);
                    background: rgba(22,29,46,0.88);
                    backdrop-filter: blur(16px);
                    border: 1px solid var(--rim-hi);
                    border-radius: 18px;
                    padding: 20px 22px;
                    width: 210px;
                    z-index: 2;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,194,168,0.06);
                    opacity: 0;
                    transform: translateY(calc(-50% + 12px));
                    animation: floatIn 0.6s 0.8s cubic-bezier(0.22,1,0.36,1) forwards;
                }
                @keyframes floatIn {
                    to { opacity: 1; transform: translateY(-50%); }
                }

                .journey-label {
                    font-size: 9.5px;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: var(--teal);
                    margin-bottom: 16px;
                    opacity: 0.8;
                }

                .journey-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .journey-step {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 10px 0;
                    position: relative;
                }

                .journey-step:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    left: 10px;
                    top: 26px;
                    bottom: -4px;
                    width: 1px;
                    background: rgba(0,194,168,0.15);
                }

                .journey-step-icon {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .journey-step-icon.done {
                    background: var(--teal);
                    box-shadow: 0 0 10px rgba(0,194,168,0.4);
                }

                .journey-step-icon.current {
                    background: rgba(0,194,168,0.15);
                    border: 1.5px solid var(--teal);
                    animation: ringPulse 2s ease-in-out infinite;
                }

                .journey-step-icon.upcoming {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                }

                @keyframes ringPulse {
                    0%,100% { box-shadow: 0 0 0 0 rgba(0,194,168,0.3); }
                    50%     { box-shadow: 0 0 0 4px rgba(0,194,168,0.08); }
                }

                .journey-step-text {}

                .journey-step-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--txt-soft);
                    letter-spacing: 0.02em;
                    margin-bottom: 2px;
                }

                .journey-step-title.dim { color: rgba(238,241,247,0.3); }

                .journey-step-sub {
                    font-size: 9.5px;
                    color: var(--txt-muted);
                    letter-spacing: 0.02em;
                }

                .vertical-label {
                    position: absolute;
                    right: 48px; top: 50%;
                    transform: translateY(-50%) rotate(90deg);
                    transform-origin: center center;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.28em;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.1);
                    white-space: nowrap;
                    z-index: 1;
                }

                /* Left content */
                .l-content {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .brand {
                    display: flex; align-items: center; gap: 11px;
                    opacity: 0; transform: translateY(-8px);
                    animation: fadeUp 0.5s 0.1s ease forwards;
                }

                .brand-icon {
                    width: 34px; height: 34px;
                    border-radius: 9px;
                    background: linear-gradient(135deg, rgba(0,194,168,0.2), rgba(0,194,168,0.06));
                    border: 1px solid rgba(0,194,168,0.3);
                    display: flex; align-items: center; justify-content: center;
                }

                .brand-wordmark {
                    font-family: 'Syne', sans-serif;
                    font-size: 14px; font-weight: 700;
                    letter-spacing: 0.12em; text-transform: uppercase;
                    color: rgba(255,255,255,0.7);
                }
                .brand-wordmark em { font-style: normal; color: var(--teal); }

                .hero { margin-top: auto; padding-bottom: 8px; }

                .hero-tag {
                    display: inline-flex; align-items: center; gap: 7px;
                    padding: 5px 12px 5px 8px;
                    border: 1px solid rgba(0,194,168,0.22);
                    border-radius: 99px;
                    background: rgba(0,194,168,0.06);
                    margin-bottom: 24px;
                    opacity: 0; animation: fadeUp 0.5s 0.3s ease forwards;
                }

                .hero-tag-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: var(--teal); box-shadow: 0 0 8px var(--teal);
                    animation: pulse 2s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%,100% { opacity:1; box-shadow: 0 0 8px var(--teal); }
                    50%     { opacity:0.5; box-shadow: 0 0 3px var(--teal); }
                }
                .hero-tag-text {
                    font-size: 10.5px; font-weight: 600;
                    letter-spacing: 0.14em; text-transform: uppercase;
                    color: var(--teal);
                }

                .hero h2 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: clamp(38px, 3.8vw, 58px);
                    font-weight: 300; line-height: 1.1;
                    color: var(--txt); margin-bottom: 20px;
                    opacity: 0; animation: fadeUp 0.6s 0.4s ease forwards;
                }
                .hero h2 strong { font-weight: 600; font-style: italic; }
                .hero h2 .teal { color: var(--teal); }

                .hero p {
                    font-size: 13px; font-weight: 400;
                    line-height: 1.85; color: var(--txt-muted);
                    max-width: 380px;
                    opacity: 0; animation: fadeUp 0.6s 0.5s ease forwards;
                }

                .testimonial {
                    margin-top: 40px;
                    display: flex; align-items: center; gap: 14px;
                    opacity: 0; animation: fadeUp 0.6s 0.65s ease forwards;
                }

                .testimonial-avatar {
                    width: 38px; height: 38px; border-radius: 50%;
                    background: linear-gradient(135deg, #2a9e86, #1a6b59);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 700;
                    color: rgba(255,255,255,0.88); letter-spacing: 0.04em;
                    flex-shrink: 0; border: 1.5px solid rgba(0,194,168,0.2);
                }

                .testimonial-quote {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 13.5px; font-style: italic; font-weight: 300;
                    line-height: 1.6; color: rgba(238,241,247,0.48); margin-bottom: 4px;
                }

                .testimonial-meta {
                    font-size: 10.5px; font-weight: 600;
                    letter-spacing: 0.05em; color: rgba(238,241,247,0.28);
                }
                .testimonial-meta span { color: var(--teal); opacity: 0.7; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ═══════════════════════════════
                   RIGHT FORM PANEL
                   ═══════════════════════════════ */
                .panel-r {
                    flex: 0.85;
                    background: var(--form-bg);
                    display: flex; flex-direction: column; justify-content: center;
                    padding: 52px 52px;
                    position: relative; overflow: hidden;
                }

                .panel-r::before {
                    content: '';
                    position: absolute; top: 0; left: 0;
                    width: 180px; height: 180px;
                    background: radial-gradient(circle at 0% 0%, rgba(0,194,168,0.07), transparent 70%);
                    pointer-events: none;
                }

                .panel-r::after {
                    content: '';
                    position: absolute; left: 0; top: 15%; bottom: 15%;
                    width: 3px;
                    background: linear-gradient(to bottom, transparent, var(--teal), transparent);
                    opacity: 0.4; border-radius: 99px;
                }

                .form-wrap {
                    max-width: 360px; width: 100%;
                    margin: 0 auto; position: relative; z-index: 1;
                }

                /* Step indicator — step 1 of 3 active for register */
                .step-indicator {
                    display: flex; align-items: center; gap: 6px;
                    margin-bottom: 28px;
                    opacity: 0; animation: fadeUp 0.5s 0.2s ease forwards;
                }

                .step-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: var(--ink-faint);
                }
                .step-dot.active {
                    width: 20px; border-radius: 99px;
                    background: var(--f-focus);
                }

                .step-label {
                    margin-left: 6px; font-size: 10px; font-weight: 700;
                    letter-spacing: 0.16em; text-transform: uppercase;
                    color: var(--ink-muted);
                }

                /* Form header */
                .form-header {
                    margin-bottom: 24px;
                    opacity: 0; animation: fadeUp 0.5s 0.3s ease forwards;
                }

                .form-header h1 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 32px; font-weight: 400;
                    color: var(--ink); line-height: 1.15; margin-bottom: 6px;
                }
                .form-header h1 em { font-style: italic; color: var(--ink-soft); }

                .form-header p {
                    font-size: 12.5px; font-weight: 400;
                    color: var(--ink-muted); line-height: 1.6;
                }

                /* Google */
                .btn-google {
                    width: 100%;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    padding: 12px 20px;
                    border: 1.5px solid var(--f-border);
                    border-radius: 12px; background: #fff;
                    color: var(--ink);
                    font-family: 'Syne', sans-serif;
                    font-size: 13px; font-weight: 500;
                    cursor: pointer; letter-spacing: 0.02em;
                    transition: border-color 0.18s, box-shadow 0.18s;
                    opacity: 0; animation: fadeUp 0.5s 0.4s ease forwards;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .btn-google:hover {
                    border-color: rgba(0,194,168,0.4);
                    box-shadow: 0 0 0 3px rgba(0,194,168,0.08);
                }

                /* Divider */
                .divider {
                    display: flex; align-items: center; gap: 12px;
                    margin: 16px 0;
                    opacity: 0; animation: fadeUp 0.5s 0.45s ease forwards;
                }
                .div-line { flex: 1; height: 1px; background: var(--f-border); }
                .div-text {
                    font-size: 10px; font-weight: 700;
                    letter-spacing: 0.12em; text-transform: uppercase;
                    color: var(--ink-faint);
                }

                /* Underline fields */
                .field-group {
                    display: flex; flex-direction: column; gap: 20px;
                    margin-bottom: 24px;
                    opacity: 0; animation: fadeUp 0.5s 0.5s ease forwards;
                }

                .field { position: relative; padding-bottom: 2px; }

                .field-top {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 10px;
                }

                .field label {
                    font-size: 9.5px; font-weight: 700;
                    letter-spacing: 0.16em; text-transform: uppercase;
                    color: var(--ink-muted); transition: color 0.18s;
                }
                .field.focused label { color: var(--f-focus); }

                .field input {
                    width: 100%;
                    padding: 6px 0 10px;
                    border: none;
                    border-bottom: 1.5px solid var(--f-border);
                    background: transparent;
                    font-family: 'Syne', sans-serif;
                    font-size: 15px; font-weight: 400;
                    color: var(--ink); outline: none;
                    transition: border-color 0.18s;
                    letter-spacing: 0.01em;
                }
                .field input::placeholder { color: var(--ink-faint); font-weight: 400; font-size: 14px; }

                .field-underline {
                    position: absolute; bottom: 2px; left: 0;
                    height: 2px; background: var(--f-focus);
                    border-radius: 99px; width: 0;
                    transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
                }
                .field.focused .field-underline { width: 100%; }

                /* Password strength */
                .pw-strength {
                    margin-top: 10px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .pw-bars {
                    display: flex;
                    gap: 4px;
                    flex: 1;
                }
                .pw-bar {
                    flex: 1;
                    height: 3px;
                    border-radius: 99px;
                    background: var(--f-border);
                    transition: background 0.3s;
                }
                .pw-bar.fill-weak    { background: #c0392b; }
                .pw-bar.fill-ok      { background: var(--amber); }
                .pw-bar.fill-strong  { background: var(--teal); }
                .pw-label {
                    font-size: 9.5px;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: var(--ink-muted);
                    white-space: nowrap;
                    min-width: 36px;
                }

                /* Error */
                .error-box {
                    display: flex; align-items: flex-start; gap: 8px;
                    padding: 10px 14px;
                    background: var(--error-bg);
                    border-left: 3px solid var(--error);
                    border-radius: 0 8px 8px 0;
                    margin-bottom: 18px;
                }
                .error-box span { font-size: 12.5px; color: var(--error); line-height: 1.5; }

                /* Submit */
                .btn-submit {
                    width: 100%;
                    padding: 14px 24px;
                    background: var(--ink);
                    color: #fff; border: none;
                    border-radius: 12px;
                    font-family: 'Syne', sans-serif;
                    font-size: 13.5px; font-weight: 600;
                    letter-spacing: 0.06em; text-transform: uppercase;
                    cursor: pointer;
                    transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    position: relative; overflow: hidden;
                    opacity: 0; animation: fadeUp 0.5s 0.55s ease forwards;
                }

                .btn-submit::after {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(0,194,168,0.15) 60%, transparent 80%);
                    transform: translateX(-100%);
                    transition: transform 0.5s ease;
                }
                .btn-submit:hover:not(:disabled)::after { transform: translateX(100%); }
                .btn-submit:hover:not(:disabled) {
                    background: #0d1a2e;
                    box-shadow: 0 4px 20px rgba(13,18,32,0.25), 0 0 0 1px rgba(0,194,168,0.2);
                }
                .btn-submit:active:not(:disabled) { transform: scale(0.998); }
                .btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }

                .btn-arrow {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 18px; height: 18px; border-radius: 50%;
                    border: 1.5px solid rgba(255,255,255,0.3);
                    transition: border-color 0.18s;
                }
                .btn-submit:hover .btn-arrow { border-color: var(--teal); }

                .spinner {
                    width: 14px; height: 14px;
                    border: 1.5px solid rgba(255,255,255,0.25);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.65s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Footer */
                .form-footer {
                    margin-top: 18px; text-align: center;
                    font-size: 12px; color: var(--ink-muted);
                    line-height: 1.8;
                    opacity: 0; animation: fadeUp 0.5s 0.65s ease forwards;
                }
                .form-footer a {
                    color: var(--ink); font-weight: 700; text-decoration: none;
                    border-bottom: 1.5px solid rgba(0,194,168,0.4);
                    padding-bottom: 1px;
                    transition: color 0.15s, border-color 0.15s;
                }
                .form-footer a:hover { color: var(--f-focus); border-color: var(--f-focus); }

                .form-footer .terms {
                    display: block;
                    margin-top: 4px;
                    font-size: 11px;
                    color: var(--ink-faint);
                }

                /* Radar graphic */
                .radar-wrap {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-18%, -52%);
                    width: 560px;
                    height: 560px;
                    pointer-events: none;
                    z-index: 0;
                }

                .radar-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid rgba(0,194,168,0.09);
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                }
                .radar-ring:nth-child(1) { width: 100%; height: 100%; border-color: rgba(0,194,168,0.07); }
                .radar-ring:nth-child(2) { width: 72%; height: 72%; border-color: rgba(0,194,168,0.10); }
                .radar-ring:nth-child(3) { width: 46%; height: 46%; border-color: rgba(0,194,168,0.13); }
                .radar-ring:nth-child(4) { width: 22%; height: 22%; background: rgba(0,194,168,0.05); border-color: rgba(0,194,168,0.2); }

                .radar-crosshair {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100%; height: 100%;
                }
                .radar-crosshair::before,
                .radar-crosshair::after {
                    content: '';
                    position: absolute;
                    background: rgba(0,194,168,0.07);
                }
                .radar-crosshair::before { width: 1px; height: 100%; left: 50%; top: 0; }
                .radar-crosshair::after  { height: 1px; width: 100%; top: 50%; left: 0; }

                .radar-sweep {
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 50%; height: 50%;
                    transform-origin: 0% 100%;
                    background: conic-gradient(from 0deg, transparent 85%, rgba(0,194,168,0.22));
                    animation: sweep 4s linear infinite;
                    border-radius: 0 100% 0 0;
                }
                @keyframes sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 860px) {
                    .panel-l { display: none; }
                    .panel-r { flex: 1; padding: 56px 32px; }
                    .panel-r::after { display: none; }
                }
            `}</style>

            <div className="root">

                {/* LEFT */}
                <div className="panel-l">
                    <div className="atmosphere" />

                    {/* Grid texture */}
                    {/* <div className="steps-visual">
                        {Array.from({ length: 6 }).map((_, row) => (
                            <div className="steps-row" key={row}>
                                {Array.from({ length: 6 }).map((_, col) => {
                                    const lit = (row + col) % 3 === 0;
                                    const bright = row === 2 && col === 2;
                                    return (
                                        <div
                                            key={col}
                                            className={`steps-cell${bright ? ' bright' : lit ? ' lit' : ''}`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div> */}

                    {/* <div className="atmosphere" /> */}
                    <div className="radar-wrap">
                        <div className="radar-ring" />
                        <div className="radar-ring" />
                        <div className="radar-ring" />
                        <div className="radar-ring" />
                        <div className="radar-crosshair" />
                        <div className="radar-sweep" />
                    </div>

                    {/* Floating journey card */}
                    {/* <div className="journey-card">
                        <div className="journey-label">Your Journey</div>
                        <div className="journey-steps">
                            {[
                                { icon: 'done',     title: 'Create account',    sub: 'Just a minute'      },
                                { icon: 'current',  title: 'Set your goals',    sub: 'Target roles & skills' },
                                { icon: 'upcoming', title: 'First mock interview', sub: 'AI-powered session'  },
                                { icon: 'upcoming', title: 'Get hired',         sub: 'Land your offer'    },
                            ].map(({ icon, title, sub }) => (
                                <div className="journey-step" key={title}>
                                    <div className={`journey-step-icon ${icon}`}>
                                        {icon === 'done' && (
                                            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                                <path d="M1.5 4.5l2 2 4-4" stroke="#080b10" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                        {icon === 'current' && (
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)' }} />
                                        )}
                                    </div>
                                    <div className="journey-step-text">
                                        <div className={`journey-step-title${icon === 'upcoming' ? ' dim' : ''}`}>{title}</div>
                                        <div className="journey-step-sub">{sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    <div className="vertical-label">IntelliView · AI Interview Coach</div>

                    <div className="l-content">
                        <div className="brand">
                            <div className="brand-icon">
                                <Brain size={17} color="rgba(0,194,168,0.85)" />
                            </div>
                            <span className="brand-wordmark"><em>Intelli</em>View</span>
                        </div>

                        <div className="hero">
                            <div className="hero-tag">
                                <div className="hero-tag-dot" />
                                <span className="hero-tag-text">Start for free</span>
                            </div>
                            <h2>
                                Your first step<br />
                                toward the <span className="teal"><strong>role</strong></span><br />
                                <strong>you deserve.</strong>
                            </h2>
                            <p>
                                Create your free account and get instant access to AI-powered interview coaching, real-time feedback, and personalised prep plans.
                            </p>
                            <div className="testimonial">
                                <div className="testimonial-avatar">JL</div>
                                <div>
                                    <p className="testimonial-quote">
                                        "IntelliView guided me through every prep session. I felt like I had a coach in my corner the whole time."
                                    </p>
                                    <p className="testimonial-meta">
                                        Jordan Lee &nbsp;·&nbsp; <span>Backend Engineer, Coinbase</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="panel-r">
                    <div className="form-wrap">

                        <div className="step-indicator">
                            <div className="step-dot active" />
                            <div className="step-dot" />
                            <div className="step-dot" />
                            <span className="step-label">Sign up</span>
                        </div>

                        <div className="form-header">
                            <h1>Create your<br /><em>account.</em></h1>
                            <p>Free forever · No credit card required.</p>
                        </div>

                        <button className="btn-google" onClick={handleGoogle} type="button">
                            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="#4285F4" d="M21.35 11.1h-9.18v2.98h5.3c-.23 1.26-.93 2.32-1.98 3.03v2.5h3.2c1.87-1.72 2.96-4.25 2.96-7.27 0-.68-.06-1.33-.18-1.97z"/>
                                <path fill="#34A853" d="M12.17 22c2.69 0 4.95-.89 6.6-2.38l-3.2-2.5c-.89.6-2.02.95-3.4.95-2.61 0-4.82-1.76-5.6-4.12H3.26v2.59C4.89 19.98 8.26 22 12.17 22z"/>
                                <path fill="#FBBC05" d="M6.57 13.95c-.2-.6-.32-1.24-.32-1.9s.12-1.3.32-1.9V7.56H3.26A9.81 9.81 0 0 0 2 12.05c0 1.58.38 3.06 1.26 4.49l3.31-2.59z"/>
                                <path fill="#EA4335" d="M12.17 6.18c1.46 0 2.77.5 3.8 1.48l2.84-2.84C17.1 2.97 14.86 2 12.17 2 8.26 2 4.89 4.02 3.26 7.56l3.31 2.59c.78-2.36 2.99-4 5.6-4z"/>
                            </svg>
                            Sign up with Google
                        </button>

                        <div className="divider">
                            <div className="div-line" />
                            <span className="div-text">or</span>
                            <div className="div-line" />
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="field-group">
                                <div className={`field ${activeField === 'name' ? 'focused' : ''}`}>
                                    <div className="field-top">
                                        <label htmlFor="name">Full name</label>
                                    </div>
                                    <input
                                        id="name" type="text" value={name}
                                        onChange={e => setName(e.target.value)}
                                        onFocus={() => setActiveField('name')}
                                        onBlur={() => setActiveField(null)}
                                        required placeholder="Jordan Lee"
                                        autoComplete="name"
                                    />
                                    <div className="field-underline" />
                                </div>

                                <div className={`field ${activeField === 'email' ? 'focused' : ''}`}>
                                    <div className="field-top">
                                        <label htmlFor="email">Email address</label>
                                    </div>
                                    <input
                                        id="email" type="email" value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onFocus={() => setActiveField('email')}
                                        onBlur={() => setActiveField(null)}
                                        required placeholder="you@company.com"
                                        autoComplete="email"
                                    />
                                    <div className="field-underline" />
                                </div>

                                <div className={`field ${activeField === 'password' ? 'focused' : ''}`}>
                                    <div className="field-top">
                                        <label htmlFor="password">Password</label>
                                    </div>
                                    <input
                                        id="password" type="password" value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        onFocus={() => setActiveField('password')}
                                        onBlur={() => setActiveField(null)}
                                        required placeholder="Create a strong password"
                                        autoComplete="new-password"
                                    />
                                    <div className="field-underline" />
                                    {/* Password strength meter */}
                                    {password.length > 0 && (() => {
                                        const strength = password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
                                        const labels = ['', 'Weak', 'Good', 'Strong'];
                                        const fillClass = ['', 'fill-weak', 'fill-ok', 'fill-strong'];
                                        return (
                                            <div className="pw-strength">
                                                <div className="pw-bars">
                                                    {[1,2,3].map(i => (
                                                        <div key={i} className={`pw-bar ${i <= strength ? fillClass[strength] : ''}`} />
                                                    ))}
                                                </div>
                                                <span className="pw-label">{labels[strength]}</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {error && (
                                <div className="error-box">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                                        <circle cx="8" cy="8" r="7" stroke="#c0392b" strokeWidth="1.5"/>
                                        <path d="M8 5v3.5" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round"/>
                                        <circle cx="8" cy="11" r="0.75" fill="#c0392b"/>
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? (
                                    <><span className="spinner" />Creating account</>
                                ) : (
                                    <>
                                        Create account
                                        <span className="btn-arrow">
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                <path d="M1 4h6M4 1l3 3-3 3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="form-footer">
                            Already have an account?{' '}
                            <a href="/auth/login">Sign in →</a>
                            {/* <span className="terms">By signing up you agree to our <a href="/terms" style={{ fontSize: '11px' }}>Terms</a> &amp; <a href="/privacy" style={{ fontSize: '11px' }}>Privacy Policy</a>.</span> */}
                        </p>
                    </div>
                </div>

            </div>
        </>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={null}>
            <RegisterPageContent />
        </Suspense>
    );
}