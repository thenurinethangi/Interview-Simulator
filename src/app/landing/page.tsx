'use client';

import Link from 'next/link';
import { Brain, CheckCircle2, Code2, LineChart } from 'lucide-react';

const featureItems = [
  {
    icon: <Code2 size={20} strokeWidth={1.5} />,
    title: 'Role-Aligned Interviews',
    body: 'Generate focused interview sets from your CV or a target topic with practical depth and clear intent.',
  },
  {
    icon: <LineChart size={20} strokeWidth={1.5} />,
    title: 'Clear Performance Signals',
    body: 'Understand exactly what is strong, what is missing, and how to improve on the next attempt.',
  },
  {
    icon: <CheckCircle2 size={20} strokeWidth={1.5} />,
    title: 'Faster Skill Progression',
    body: 'Practice in short cycles and build confidence with structured, repeatable improvement.',
  },
];

const workflow = [
  { step: '01', title: 'Choose Input', desc: 'Upload your CV or select a technical topic to generate a curriculum.' },
  { step: '02', title: 'Answer Questions', desc: 'Engage in a dual-mode environment with coding and conceptual prompts.' },
  { step: '03', title: 'Refine Quickly', desc: 'Review the AI scoring engine\'s feedback to benchmark your answers.' },
];

export default function LandingPage() {
  return (
    <div className="landing-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Syne:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          /* Professional Light Theme for Study Platform */
          --bg-main:   #ffffff;
          --bg-alt:    #f7f8fc;
          --ink:       #0d1220;
          --ink-soft:  #3d4460;
          --ink-muted: #8b90a8;
          --border:    #e2e8f0;
          
          /* Brand Accent */
          --teal:      #00bfa5;
          --teal-dim:  rgba(0,191,165,0.08);
          
          /* Deep Navy for Footer/CTA */
          --navy:      #0B1120;
          --navy-soft: #1e293b;
        }

        .landing-root {
          min-height: 100vh;
          overflow-x: hidden;
          font-family: 'Syne', sans-serif;
          background: var(--bg-main);
          color: var(--ink);
        }

        .container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 32px;
          position: relative;
          z-index: 1;
        }

        /* ═══════════════════════════════
           NAVBAR (CLEAN & LIGHT)
           ═══════════════════════════════ */
        .nav {
          position: fixed;
          top: 0; width: 100%; z-index: 50;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }

        .nav-inner {
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .brand {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }

        .brand-icon {
          width: 28px; height: 28px;
          background: var(--teal-dim);
          border: 1px solid rgba(0,191,165,0.2);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
        }

        .brand-wordmark {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          letter-spacing: 0.05em; color: var(--ink);
        }
        .brand-wordmark em { font-style: normal; color: var(--teal); }

        .nav-links { display: flex; align-items: center; gap: 24px; }

        .nav-link {
          text-decoration: none; color: var(--ink-soft);
          font-size: 13px; font-weight: 500;
          transition: color 0.15s;
        }
        .nav-link:hover { color: var(--ink); }

        .btn-primary {
          text-decoration: none;
          padding: 9px 18px; border-radius: 6px;
          background: var(--ink); color: #fff;
          font-size: 13px; font-weight: 600;
          transition: background 0.15s, transform 0.1s;
        }
        .btn-primary:hover { background: #000; transform: translateY(-1px); }

        /* ═══════════════════════════════
           HERO SECTION (STUDY FOCUS)
           ═══════════════════════════════ */
        .hero {
          padding: 140px 0 100px;
          background: var(--bg-main);
          position: relative;
        }

        /* Subtle Study Grid Background */
        .hero::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(var(--border) 1px, transparent 1px);
          background-size: 24px 24px; pointer-events: none; opacity: 0.6;
        }

        .hero-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 40px; align-items: center;
        }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 99px;
          background: var(--teal-dim); color: #009985;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; margin-bottom: 24px;
        }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 4.5vw, 56px);
          line-height: 1.1; font-weight: 600;
          color: var(--ink); margin-bottom: 20px;
        }

        .hero-sub {
          font-size: 15px; line-height: 1.7;
          color: var(--ink-soft); margin-bottom: 32px;
          max-width: 480px;
        }

        .hero-actions { display: flex; gap: 14px; align-items: center; }

        .btn-outline {
          text-decoration: none;
          padding: 9px 18px; border-radius: 6px;
          border: 1px solid var(--border);
          color: var(--ink); font-size: 13px; font-weight: 600;
          background: #fff; transition: border-color 0.15s;
        }
        .btn-outline:hover { border-color: var(--ink-muted); }

        /* Mock UI Visual for Hero */
        .hero-visual {
          position: relative; width: 100%; height: 400px;
          display: flex; flex-direction: column; gap: 16px;
          justify-content: center; padding-left: 20px;
        }

        .mock-card {
          background: #fff; border: 1px solid var(--border);
          border-radius: 8px; padding: 20px;
          box-shadow: 0 12px 32px rgba(13,18,32,0.06);
          position: relative;
        }

        .mock-card.q-card { z-index: 2; transform: translateX(-20px); }
        .mock-card.a-card { z-index: 1; transform: translateX(20px); border-left: 3px solid var(--teal); }

        .mock-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 12px; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted);
        }
        .mock-tag {
          background: var(--bg-alt); padding: 4px 8px; border-radius: 4px;
        }

        .mock-title { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
        .mock-text { font-size: 12px; color: var(--ink-soft); line-height: 1.6; font-family: monospace; }
        
        .mock-score {
          display: inline-block; margin-top: 12px;
          padding: 4px 8px; border-radius: 4px; background: rgba(0,191,165,0.1);
          color: #009985; font-size: 11px; font-weight: 700;
        }

        /* ═══════════════════════════════
           MIDDLE SECTIONS
           ═══════════════════════════════ */
        .section {
          padding: 96px 0;
          background: var(--bg-alt);
          border-top: 1px solid var(--border);
        }

        .section-header { text-align: center; margin-bottom: 56px; }
        
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px; font-weight: 600; color: var(--ink);
          margin-bottom: 12px;
        }
        .section-sub { font-size: 15px; color: var(--ink-soft); }

        .feature-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }

        .feature-card {
          background: #fff; border: 1px solid var(--border);
          border-radius: 8px; padding: 32px 24px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(13,18,32,0.04);
        }

        .f-icon-wrap {
          width: 40px; height: 40px; border-radius: 6px;
          background: var(--bg-alt); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--ink); margin-bottom: 20px;
        }

        .feature-card h3 { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
        .feature-card p { font-size: 13.5px; line-height: 1.6; color: var(--ink-soft); }

        .workflow-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
          position: relative;
        }
        /* Connecting line for workflow */
        .workflow-grid::before {
          content: ''; position: absolute; top: 16px; left: 0; right: 0;
          height: 1px; background: var(--border); z-index: 0;
        }

        .workflow-card { position: relative; z-index: 1; }
        
        .w-step {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--bg-main); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: var(--ink);
          margin-bottom: 16px; box-shadow: 0 0 0 8px var(--bg-alt);
        }

        .workflow-card h4 { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
        .workflow-card p { font-size: 13.5px; line-height: 1.6; color: var(--ink-soft); }

        /* ═══════════════════════════════
           CTA & FOOTER (PROFESSIONAL NAVY)
           ═══════════════════════════════ */
        .bottom-wrap {
          background: var(--navy);
          color: #fff;
        }

        .cta-section { padding: 100px 0; text-align: center; }

        .cta-inner { max-width: 600px; margin: 0 auto; }

        .cta-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 42px; font-weight: 600; margin-bottom: 16px;
        }
        .cta-sub {
          font-size: 15px; color: var(--ink-muted); margin-bottom: 32px; line-height: 1.6;
        }

        .btn-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px; border-radius: 6px;
          background: var(--teal); color: var(--navy);
          font-size: 14px; font-weight: 600; text-decoration: none;
          transition: background 0.15s;
        }
        .btn-cta:hover { background: #00d3b6; }

        .footer {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 32px 0;
        }
        .footer-inner {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 12px; color: var(--ink-muted);
        }
        .footer-links { display: flex; gap: 20px; }
        .footer-links a { color: var(--ink-muted); text-decoration: none; }
        .footer-links a:hover { color: #fff; }

        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .hero-visual { display: none; } /* Hide mock UI on small screens to save space */
          .feature-grid, .workflow-grid { grid-template-columns: 1fr; }
          .workflow-grid::before { display: none; }
          .w-step { box-shadow: none; }
        }
        @media (max-width: 600px) {
          .nav-links { display: none; }
          .hero-title { font-size: 36px; }
          .footer-inner { flex-direction: column; gap: 16px; text-align: center; }
        }
      `}</style>

      {/* NAVBAR */}
      <header className="nav">
        <div className="container nav-inner">
          <Link href="/" className="brand">
            <div className="brand-icon">
              <Brain size={16} color="var(--teal)" />
            </div>
            <span className="brand-wordmark"><em>Intelli</em>View</span>
          </Link>
          <nav className="nav-links">
            <a href="#features" className="nav-link">Curriculum</a>
            <a href="#workflow" className="nav-link">How it Works</a>
            <Link href="/auth/login" className="nav-link">Sign In</Link>
            <Link href="/auth/register" className="btn-primary">Start Practicing</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO (CLEAN STUDY VIBE) */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-content">
              <div className="hero-badge">Academic & Technical Prep</div>
              <h1 className="hero-title">
                Master your interviews through structured practice.
              </h1>
              <p className="hero-sub">
                IntelliView provides a rigorous study environment. Generate targeted curricula, practice coding and theoretical concepts, and receive strict, actionable AI evaluations.
              </p>
              <div className="hero-actions">
                <Link href="/auth/register" className="btn-primary" style={{ padding: '10px 24px' }}>
                  Start a Session
                </Link>
                <Link href="/auth/login" className="btn-outline" style={{ padding: '10px 24px' }}>
                  View Dashboard
                </Link>
              </div>
            </div>

            <div className="hero-visual">
              {/* Question Mock */}
              <div className="mock-card q-card">
                <div className="mock-header">
                  <span>Theoretical Evaluation</span>
                  <span className="mock-tag">Spring Boot</span>
                </div>
                <div className="mock-title">Explain Dependency Injection in Spring.</div>
                <div className="mock-text" style={{ fontFamily: 'Syne' }}>
                  "Dependency Injection is a design pattern used to implement IoC, allowing the creation of dependent objects outside of a class..."
                </div>
              </div>

              {/* Feedback Mock */}
              <div className="mock-card a-card">
                <div className="mock-header">
                  <span>AI Scoring Engine</span>
                  <span className="mock-tag" style={{ color: '#009985', background: 'rgba(0,191,165,0.1)' }}>Analysis Complete</span>
                </div>
                <div className="mock-text">
                  <strong>Depth:</strong> Good. You correctly identified IoC.<br />
                  <strong>Improvement:</strong> Provide a practical example of `@Autowired` vs constructor injection to demonstrate applied knowledge.
                </div>
                <div className="mock-score">Score: 8.5 / 10</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Built for serious preparation.</h2>
              <p className="section-sub">Move past generic advice. Get evaluated exactly like you would in a technical screening.</p>
            </div>
            <div className="feature-grid">
              {featureItems.map((item) => (
                <article key={item.title} className="feature-card">
                  <div className="f-icon-wrap">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section id="workflow" className="section" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">A repeatable study cycle.</h2>
            </div>
            <div className="workflow-grid">
              {workflow.map((item) => (
                <article key={item.step} className="workflow-card">
                  <div className="w-step">{item.step}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM NAVY CTA & FOOTER */}
        <div className="bottom-wrap">
          <section className="cta-section container">
            <div className="cta-inner">
              <h2 className="cta-title">Ready to test your knowledge?</h2>
              <p className="cta-sub">
                Stop guessing what interviewers want to hear. Start practicing with an engine that evaluates your exact skill gaps.
              </p>
              <Link href="/auth/register" className="btn-cta">
                Create your student account
              </Link>
            </div>
          </section>

          <footer className="footer container">
            <div className="footer-inner">
              <div>&copy; {new Date().getFullYear()} IntelliView - AI Interview Simulator.</div>
              <div className="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Contact Support</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}