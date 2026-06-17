// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Register() {
  const { register, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
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
        <h2 className={styles.heading}>Create account</h2>
        <p className={styles.sub}>Start organising your work today</p>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            { label:'Full name', type:'text', key:'name', ph:'Your name' },
            { label:'Email',     type:'email', key:'email', ph:'you@example.com' },
            { label:'Password',  type:'password', key:'password', ph:'At least 6 characters' },
          ].map(f => (
            <div key={f.key} className={styles.field}>
              <label className={styles.label}>{f.label}</label>
              <input className={styles.input} type={f.type} placeholder={f.ph}
                value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required/>
            </div>
          ))}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className={styles.switch}>Have an account? <Link to="/login" className={styles.switchLink}>Sign in</Link></p>
        <Link to="/" className={styles.backLink}>← Back to home</Link>
      </div>
    </div>
  );
}
