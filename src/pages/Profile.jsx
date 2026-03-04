import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Camera, Save, User, Mail, Phone, Globe, Calendar, CreditCard } from 'lucide-react'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { showToast } = useToast()
  const fileRef = useRef()

  // All useState declarations together — before any useEffect (React hooks rules)
  const [payments, setPayments] = useState([])
  const [form, setForm] = useState({ name: user?.name||'', bio: user?.bio||'', phone: user?.phone||'', website: user?.website||'' })
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Sync form whenever user data refreshes (e.g. after save)
  useEffect(() => {
    if (user) {
      setForm({
        name:    user.name    || '',
        bio:     user.bio     || '',
        phone:   user.phone   || '',
        website: user.website || '',
      })
      axios.get('/api/payment/history').then(r => setPayments(r.data)).catch(() => {})
    }
  }, [user?.name, user?.bio, user?.phone, user?.website])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await axios.put('/api/users/profile', form)
      await refreshUser()
      showToast('প্রোফাইল সংরক্ষিত হয়েছে 🌱', 'success')
    } catch { showToast('সংরক্ষণ করতে সমস্যা হয়েছে', 'error') }
    finally { setSaving(false) }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const fd = new FormData(); fd.append('avatar', file)
    setUploadingAvatar(true)
    try {
      await axios.post('/api/users/avatar', fd)
      await refreshUser()
      showToast('ছবি আপডেট হয়েছে!', 'success')
    } catch { showToast('ছবি আপলোড করতে সমস্যা হয়েছে', 'error') }
    finally { setUploadingAvatar(false) }
  }

  if (!user) return null
  const roleLabel = { admin: '🛡️ প্রশাসক', instructor: '👨‍🏫 শিক্ষক', student: '🎓 শিক্ষার্থী' }

  return (
    <div style={styles.page}>
      <div className="container">
        <div style={styles.grid}>
          {/* Left */}
          <div>
            <div style={styles.avatarCard}>
              <div style={styles.avatarCardTop} />
              <div style={styles.avatarWrap}>
                {user.avatar ? (
                  <img src={user.avatar} style={styles.avatar} />
                ) : (
                  <div style={styles.avatarFallback}>{user.name[0]}</div>
                )}
                <button style={styles.cameraBtn} onClick={() => fileRef.current.click()} disabled={uploadingAvatar}>
                  <Camera size={13} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
              </div>
              <h2 style={styles.profileName}>{user.name}</h2>
              <span style={styles.roleBadge}>{roleLabel[user.role]}</span>
              {user.bio && <p style={styles.bio}>{user.bio}</p>}
              <div style={styles.infoList}>
                <div style={styles.infoItem}><User size={13} /> আইডি: <strong>{user.user_id}</strong></div>
                <div style={styles.infoItem}><Mail size={13} /> {user.email}</div>
                {user.phone && <div style={styles.infoItem}><Phone size={13} /> {user.phone}</div>}
                {user.website && <div style={styles.infoItem}><Globe size={13} /> <a href={user.website} style={{ color: 'var(--green-main)' }}>{user.website}</a></div>}
                <div style={styles.infoItem}><Calendar size={13} /> {user.created_at ? new Date(user.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' }) : ''} থেকে সদস্য</div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={styles.formCard}>
              <h2 style={styles.formTitle}>✏️ প্রোফাইল সম্পাদনা</h2>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">পূর্ণ নাম</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">পরিচিতি</label>
                  <textarea className="form-input" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="নিজের সম্পর্কে লিখুন..." rows={4} />
                </div>
                <div className="form-group">
                  <label className="form-label">ফোন নম্বর</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+৮৮ ০১X-XXXXXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">ওয়েবসাইট</label>
                  <input className="form-input" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://yoursite.com" />
                </div>
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ padding: '10px 24px' }}>
                  <Save size={15} /> {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </form>
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.infoCardTitle}>🪪 অ্যাকাউন্টের তথ্য</h3>
              <div style={styles.infoGrid}>
                {[
                  { label: 'ব্যবহারকারী আইডি', value: user.user_id, mono: true },
                  { label: 'ভূমিকা', value: roleLabel[user.role] },
                  { label: 'ইমেইল', value: user.email },
                  { label: 'অবস্থা', value: user.approved ? '✅ সক্রিয়' : '⏳ অনুমোদন বাকি' },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={styles.infoLabel}>{item.label}</div>
                    <div style={{ ...styles.infoValue, ...(item.mono ? { fontFamily: 'monospace', fontSize: 12, background: 'var(--cream)', padding: '4px 8px', borderRadius: 4, display: 'inline-block' } : {}) }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
              <div style={{ ...styles.infoCard, marginTop: 20 }}>
                <h3 style={styles.infoCardTitle}><CreditCard size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />💳 পেমেন্ট ইতিহাস</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {payments.map(p => (
                    <div key={p.invoice_id} style={payStyle.row}>
                      <div style={{ flex: 1 }}>
                        <div style={payStyle.courseTitle}>{p.course_title}</div>
                        <div style={payStyle.meta}>
                          <span style={payStyle.invoice}>{p.invoice_id}</span>
                          <span style={payStyle.trx}>TXN: {p.trx_id}</span>
                        </div>
                        <div style={payStyle.date}>
                          {new Date(p.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div style={payStyle.amount}>৳{p.amount}</div>
                      <div style={payStyle.badge}>✅ সফল</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '48px 0', minHeight: 'calc(100vh - 69px)', background: 'var(--off-white)' },
  grid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' },
  avatarCard: {
    background: 'white', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', overflow: 'hidden',
    textAlign: 'center', position: 'sticky', top: 80,
  },
  avatarCardTop: { height: 80, background: 'linear-gradient(135deg, var(--green-dark), var(--green-mid))' },
  avatarWrap: { position: 'relative', display: 'inline-block', marginTop: -40, marginBottom: 12 },
  avatar: { width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: 'var(--shadow-sm)' },
  avatarFallback: {
    width: 84, height: 84, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--green-main), var(--green-light))',
    color: 'white', fontSize: 32, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '3px solid white', boxShadow: 'var(--shadow-sm)',
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: '50%',
    background: 'var(--gold-main)', color: 'white',
    border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  profileName: { fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 },
  roleBadge: { fontSize: 13, fontWeight: 600, color: 'var(--green-dark)', background: 'var(--green-pale)', padding: '3px 12px', borderRadius: 100 },
  bio: { fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: '12px 16px 0' },
  infoList: { display: 'flex', flexDirection: 'column', gap: 8, padding: '16px', textAlign: 'left' },
  infoItem: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)' },
  formCard: { background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px 32px' },
  formTitle: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 22 },
  infoCard: { background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '22px 32px' },
  infoCardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  infoLabel: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
  infoValue: { fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 },
}

const payStyle = {
  row: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px', background: 'var(--off-white)',
    border: '1px solid var(--border-light)', borderRadius: 10,
  },
  courseTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 },
  meta: { display: 'flex', gap: 10, marginBottom: 2 },
  invoice: { fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' },
  trx: { fontSize: 11, color: 'var(--green-main)', fontFamily: 'monospace' },
  date: { fontSize: 11, color: 'var(--text-muted)' },
  amount: { fontSize: 16, fontWeight: 800, color: '#e2136e', flexShrink: 0 },
  badge: {
    fontSize: 11, fontWeight: 700, color: 'var(--success)',
    background: 'var(--success-light)', padding: '3px 8px',
    borderRadius: 100, flexShrink: 0,
  },
}
