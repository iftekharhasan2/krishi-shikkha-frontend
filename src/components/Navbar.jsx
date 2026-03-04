import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { User, LogOut, LayoutDashboard, Shield, Sprout } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const roleLabel = { admin: 'প্রশাসক', instructor: 'শিক্ষক', student: 'শিক্ষার্থী' }
  const roleBadgeColor = { admin: '#991b1b', instructor: '#1e4d2b', student: '#7d5a00' }

  return (
    <nav style={styles.nav}>
      {/* Top accent bar */}
      <div style={styles.accentBar} />

      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <span style={{ fontSize: 22 }}>🌾</span>
          </div>
          <div>
            <div style={styles.logoText}> কৃষি শিক্ষা</div>
            <div style={styles.logoSub}>কৃষি শিক্ষার প্ল্যাটফর্ম</div>
          </div>
        </Link>

        {/* Nav Links */}
        <div style={styles.links}>
          {[
            { to: '/courses', label: '📚 কোর্সসমূহ' },
            ...(user?.role === 'student' ? [{ to: '/my-learning', label: '🌱 আমার শিক্ষা' }] : []),
            ...(user?.role === 'instructor' || user?.role === 'admin' ? [{ to: '/instructor', label: '🧑‍🏫 ড্যাশবোর্ড' }] : []),
            ...(user?.role === 'admin' ? [{ to: '/admin', label: '🛡️ প্রশাসন' }] : []),
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              ...styles.link,
              ...(isActive(to) ? styles.linkActive : {})
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div style={styles.auth}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setProfileOpen(!profileOpen)} style={styles.avatarBtn}>
                {user.avatar ? (
                  <img src={user.avatar} style={styles.avatar} alt="প্রোফাইল" />
                ) : (
                  <div style={styles.avatarFallback}>{user.name[0]}</div>
                )}
                <div style={styles.avatarInfo}>
                  <span style={styles.avatarName}>{user.name.split(' ')[0]}</span>
                  <span style={{ ...styles.avatarRole, color: roleBadgeColor[user.role] }}>
                    {roleLabel[user.role]}
                  </span>
                </div>
              </button>

              {profileOpen && (
                <div style={styles.dropdown} onClick={() => setProfileOpen(false)}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownName}>{user.name}</div>
                    <div style={styles.dropdownId}>আইডি: {user.user_id}</div>
                  </div>
                  <div style={styles.divider} />
                  <Link to="/profile" style={styles.dropdownItem}><User size={14} /> প্রোফাইল</Link>
                  {(user.role === 'instructor' || user.role === 'admin') && (
                    <Link to="/instructor" style={styles.dropdownItem}><LayoutDashboard size={14} /> ড্যাশবোর্ড</Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" style={styles.dropdownItem}><Shield size={14} /> প্রশাসন</Link>
                  )}
                  <div style={styles.divider} />
                  <button onClick={handleLogout} style={{ ...styles.dropdownItem, color: 'var(--danger)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                    <LogOut size={14} /> প্রস্থান
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px' }}>প্রবেশ করুন</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>নিবন্ধন করুন</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    boxShadow: '0 2px 12px rgba(30,77,43,0.06)',
  },
  accentBar: {
    height: 3,
    background: 'linear-gradient(90deg, var(--green-dark) 0%, var(--green-mid) 40%, var(--gold-main) 70%, var(--gold-light) 100%)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 24px',
    height: 66, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 20,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  logoIcon: {
    width: 44, height: 44,
    background: 'linear-gradient(135deg, var(--green-dark) 0%, var(--green-mid) 100%)',
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(30,77,43,0.3)',
  },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--green-dark)', lineHeight: 1.1 },
  logoSub: { fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em' },
  links: { display: 'flex', alignItems: 'center', gap: 2, flex: 1, paddingLeft: 12 },
  link: {
    padding: '7px 14px', borderRadius: 8,
    fontSize: 14, fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none', transition: 'all 0.2s',
  },
  linkActive: { color: 'var(--green-dark)', background: 'var(--green-pale)', fontWeight: 600 },
  auth: { display: 'flex', alignItems: 'center', gap: 10 },
  authBtns: { display: 'flex', gap: 8 },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'none',
    border: '1.5px solid var(--border)',
    borderRadius: 100, padding: '4px 14px 4px 4px',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  avatar: { width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' },
  avatarFallback: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--green-main), var(--green-light))',
    color: 'white', fontSize: 15, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  avatarName: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 },
  avatarRole: { fontSize: 11, fontWeight: 500, marginTop: 1 },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: 'white', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
    minWidth: 210, overflow: 'hidden',
    animation: 'fadeIn 0.15s ease',
  },
  dropdownHeader: { padding: '12px 16px', background: 'var(--green-ultra)', borderBottom: '1px solid var(--green-pale)' },
  dropdownName: { fontSize: 14, fontWeight: 600, color: 'var(--green-dark)' },
  dropdownId: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' },
  divider: { height: 1, background: 'var(--border-light)' },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', fontSize: 14, color: 'var(--text-secondary)',
    textDecoration: 'none', transition: 'background 0.15s',
  },
}
