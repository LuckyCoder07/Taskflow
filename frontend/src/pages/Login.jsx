// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const { login, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong — please try again');
    } finally { setLoading(false); }
  };

  return (
    <div className={`${styles.wrap} ${theme}`}>
      <div className={`${styles.orb} ${styles.o1}`}/>
      <div className={`${styles.orb} ${styles.o2}`}/>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoSq}>📋</div>
          <span className={styles.logoText}>TaskFlow</span>
          <button className={styles.themeBtn} onClick={toggleTheme}>{theme==='dark'?'☀️':'🌙'}</button>
        </div>
        <h2 className={styles.heading}>Welcome back</h2>
        <p className={styles.sub}>Sign in to your workspace</p>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required/>
          </div>
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className={styles.switch}>No account? <Link to="/register" className={styles.switchLink}>Register</Link></p>
        <Link to="/" className={styles.backLink}>← Back to home</Link>
      </div>
    </div>
  );
}
