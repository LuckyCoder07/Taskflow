// src/pages/Landing.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Landing.module.css';

const FEATS = [
  { i:'🗂️', t:'Kanban board',    d:'Drag tasks across To do, In Progress, and Done with full status control.' },
  { i:'🎯', t:'4-level priority', d:'Mark tasks Urgent, High, Medium or Low — nothing critical gets missed.' },
  { i:'✅', t:'Subtasks',         d:'Break big tasks into steps; watch the progress bar fill as you tick them off.' },
  { i:'🏷️', t:'Smart tags',      d:'Categorise with Work, Bug, Feature, Design — filter from the sidebar instantly.' },
  { i:'📊', t:'Analytics',        d:'Live charts for status, priority, and tag distribution across your tasks.' },
  { i:'🌙', t:'Dark & light',     d:'Toggle the full theme with one button. Smooth transitions, always readable.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAuth();

  return (
    <div className={`${styles.page} ${theme}`}>
      {/* Background orbs */}
      <div className={styles.orbs}>
        <div className={`${styles.orb} ${styles.o1}`}/>
        <div className={`${styles.orb} ${styles.o2}`}/>
        <div className={`${styles.orb} ${styles.o3}`}/>
      </div>

      <div className={styles.layer}>
        {/* Navbar */}
        <nav className={styles.nav}>
          <div className={styles.navLogo}>
            <div className={styles.logoSq}>📋</div>
            TaskFlow
          </div>
          <div className={styles.navLinks}>
            {['Features','Pricing','Docs'].map(l => <button key={l} className={styles.navLink}>{l}</button>)}
          </div>
          <div className={styles.navActs}>
            <button className={styles.themeBtn} onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className={styles.btnOut} onClick={() => navigate('/login')}>Sign in</button>
            <button className={styles.btnPri} onClick={() => navigate('/register')}>Get started →</button>
          </div>
        </nav>

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.hBadge}>✨ v2 — Subtasks · Analytics · Smart filters</div>
          <h1 className={styles.hTitle}>
            Organise your work,{' '}
            <span className={styles.gt}>ship what matters</span>
          </h1>
          <p className={styles.hSub}>
            A full-stack task manager for developers and students. Kanban boards, 4-level
            priorities, subtask tracking and analytics — all in one responsive app.
          </p>
          <div className={styles.hActs}>
            <button className={`${styles.btnPri} ${styles.btnLg}`} onClick={() => navigate('/register')}>
              🚀 Start for free
            </button>
            <button className={`${styles.btnOut} ${styles.btnLg}`} onClick={() => navigate('/login')}>
              👁 Sign in to demo
            </button>
          </div>
          <div className={styles.hStats}>
            {[{v:'4 priorities',l:'Urgent · High · Medium · Low'},{v:'6 tag types',l:'Work, Bug, Design…'},{v:'3 views',l:'Kanban · List · Analytics'}].map(s => (
              <div key={s.l} className={styles.hStat}>
                <div className={styles.hsV}>{s.v}</div>
                <div className={styles.hsL}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className={styles.featSec}>
          <p className={styles.secLbl}>Everything included</p>
          <h2 className={styles.secH2}>Built for real workflows</h2>
          <div className={styles.featGrid}>
            {FEATS.map(f => <FeatureCard key={f.t} f={f}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ f }) {
  const [hov, setHov] = useState(false);
  return (
    <div className={`${styles.featCard} ${hov ? styles.featCardHov : ''}`}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className={styles.featTopLine}/>
      <div className={`${styles.featIc} ${hov ? styles.featIcHov : ''}`}>{f.i}</div>
      <h3 className={styles.featT}>{f.t}</h3>
      <p className={styles.featD}>{f.d}</p>
    </div>
  );
}
