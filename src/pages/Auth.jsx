import React, { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Eye, EyeOff } from 'lucide-react'

export function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      showToast('স্বাগতম! সফলভাবে প্রবেশ করেছেন', 'success')
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'instructor') navigate('/instructor')
      else navigate('/courses')
    } catch (err) {
      showToast(err.response?.data?.error || 'প্রবেশ করতে সমস্যা হয়েছে', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgDecor}>🌾</div>
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>🌿</div>
          <h1 style={styles.title}>পুনরায় প্রবেশ করুন</h1>
          <p style={styles.subtitle}>আপনার কৃষি শিক্ষা চালিয়ে যান</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ইমেইল</label>
            <input className="form-input" type="email" placeholder="আপনার ইমেইল লিখুন"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">পাসওয়ার্ড</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPw ? 'text' : 'password'}
                placeholder="পাসওয়ার্ড দিন" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: 44 }} required />
              <button type="button" onClick={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: 13 }}>
            {loading ? 'প্রবেশ করছেন...' : '🌱 প্রবেশ করুন'}
          </button>
        </form>

        <p style={styles.footer}>
          নতুন ব্যবহারকারী? <Link to="/register" style={styles.link}>নিবন্ধন করুন</Link>
        </p>

        <div style={styles.demoBox}>
          <p style={styles.demoTitle}>🧪 পরীক্ষামূলক অ্যাকাউন্ট</p>
          <p style={styles.demoText}>অ্যাডমিন: admin@krishividya.com</p>
          <p style={styles.demoText}>পাসওয়ার্ড: Admin@123</p>
        </div>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/register', form)
      showToast(data.message, 'success')
      navigate('/login')
    } catch (err) {
      showToast(err.response?.data?.error || 'নিবন্ধন করতে সমস্যা হয়েছে', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgDecor}>🌿</div>
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>🌾</div>
          <h1 style={styles.title}>নিবন্ধন করুন</h1>
          <p style={styles.subtitle}>কৃষি বিদ্যার সাথে আপনার যাত্রা শুরু করুন</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">পূর্ণ নাম</label>
            <input className="form-input" placeholder="আপনার নাম লিখুন" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">ইমেইল</label>
            <input className="form-input" type="email" placeholder="ইমেইল ঠিকানা" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">পাসওয়ার্ড</label>
            <input className="form-input" type="password" placeholder="কমপক্ষে ৬ অক্ষর" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">আমি</label>
            <div style={styles.roleRow}>
              {[
                { value: 'student', label: '🎓', sub: 'শিক্ষার্থী', desc: 'কোর্স করতে চাই' },
                { value: 'instructor', label: '👨‍🏫', sub: 'শিক্ষক', desc: 'কোর্স তৈরি করতে চাই' },
              ].map(r => (
                <button key={r.value} type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{ ...styles.roleBtn, ...(form.role === r.value ? styles.roleBtnActive : {}) }}>
                  <span style={{ fontSize: 24 }}>{r.label}</span>
                  <span style={styles.roleTitle}>{r.sub}</span>
                  <span style={styles.roleDesc}>{r.desc}</span>
                </button>
              ))}
            </div>
            {form.role === 'instructor' && (
              <div style={styles.noteBox}>
                ⚠️ শিক্ষক অ্যাকাউন্টে প্রবেশের আগে অ্যাডমিনের অনুমোদন প্রয়োজন।
              </div>
            )}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: 13 }}>
            {loading ? 'নিবন্ধন হচ্ছে...' : '🌱 নিবন্ধন করুন'}
          </button>
        </form>

        <p style={styles.footer}>
          ইতিমধ্যে অ্যাকাউন্ট আছে? <Link to="/login" style={styles.link}>প্রবেশ করুন</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 66px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px',
    background: 'linear-gradient(160deg, var(--green-ultra) 0%, var(--off-white) 50%, var(--gold-pale) 100%)',
    position: 'relative', overflow: 'hidden',
  },
  bgDecor: {
    position: 'absolute', right: -30, bottom: -20,
    fontSize: 200, opacity: 0.05, pointerEvents: 'none',
    transform: 'rotate(15deg)',
  },
  card: {
    background: 'white', borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border)', padding: '40px',
    width: '100%', maxWidth: 440,
    boxShadow: 'var(--shadow-lg)',
    animation: 'fadeIn 0.3s ease',
    position: 'relative', zIndex: 1,
  },
  logoArea: { textAlign: 'center', marginBottom: 28 },
  logoIcon: {
    width: 56, height: 56,
    background: 'linear-gradient(135deg, var(--green-dark), var(--green-mid))',
    borderRadius: 16, fontSize: 26,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px',
    boxShadow: '0 4px 14px rgba(30,77,43,0.3)',
  },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { fontSize: 14, color: 'var(--text-muted)', marginTop: 4 },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4,
  },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' },
  link: { color: 'var(--green-main)', fontWeight: 600 },
  demoBox: {
    marginTop: 20, padding: '12px 14px',
    background: 'var(--green-ultra)', borderRadius: 8,
    border: '1px solid var(--green-pale)',
  },
  demoTitle: { fontSize: 12, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 4 },
  demoText: { fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' },
  roleRow: { display: 'flex', gap: 12 },
  roleBtn: {
    flex: 1, padding: '14px 10px',
    border: '1.5px solid var(--border)', borderRadius: 12,
    background: 'white', cursor: 'pointer',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 4, transition: 'all 0.2s',
  },
  roleBtnActive: {
    borderColor: 'var(--green-main)', background: 'var(--green-ultra)',
    boxShadow: '0 0 0 2px var(--green-mid)',
  },
  roleTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  roleDesc: { fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' },
  noteBox: {
    marginTop: 8, fontSize: 12, color: 'var(--warning)',
    background: 'var(--warning-light)', padding: '8px 12px',
    borderRadius: 6, lineHeight: 1.6,
  },
}
