import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../contexts/ToastContext'
import { Check, UserX, Clock } from 'lucide-react'

export default function AdminPanel() {
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [usersResp, statsResp] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/stats')
      ])
      setUsers(usersResp.data)
      setStats(statsResp.data)
    } catch (err) {
      showToast('ডেটা লোড করতে সমস্যা হয়েছে', 'error')
    } finally {
      setLoading(false)
    }
  }

  const approve = async (userId) => {
    try { await axios.post(`/api/admin/users/${userId}/approve`); setUsers(prev => prev.map(u => u.id===userId ? {...u,approved:true} : u)); showToast('অনুমোদন দেওয়া হয়েছে ✅', 'success') }
    catch { showToast('সমস্যা হয়েছে', 'error') }
  }

  const revoke = async (userId) => {
    if (!confirm('এই ব্যবহারকারীর অ্যাক্সেস বাতিল করবেন?')) return
    try { await axios.post(`/api/admin/users/${userId}/revoke`); setUsers(prev => prev.map(u => u.id===userId ? {...u,approved:false} : u)); showToast('অ্যাক্সেস বাতিল করা হয়েছে', 'success') }
    catch { showToast('সমস্যা হয়েছে', 'error') }
  }

  const filtered = users.filter(u => {
    if (filter==='all') return true
    if (filter==='pending') return u.role==='instructor' && !u.approved
    return u.role===filter
  })

  const roleLabel = { admin: '🛡️ প্রশাসক', instructor: '👨‍🏫 শিক্ষক', student: '🎓 শিক্ষার্থী' }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div style={{ padding: '48px 0', minHeight: 'calc(100vh - 69px)' }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <div className="section-tag" style={{ marginBottom: 8 }}>🛡️ প্রশাসন</div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>প্রশাসন প্যানেল</h1>
          <p style={{ color: 'var(--text-muted)' }}>ব্যবহারকারী ব্যবস্থাপনা ও প্ল্যাটফর্মের নিয়ন্ত্রণ</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="stats-grid" style={{ marginBottom: 32 }}>
            {[
              { label:'মোট ব্যবহারকারী', value:stats.total_users, emoji:'👥', bg:'#f0fdf4', color:'#166534' },
              { label:'শিক্ষার্থী', value:stats.total_students, emoji:'🎓', bg:'var(--gold-pale)', color:'var(--gold-dark)' },
              { label:'শিক্ষক', value:stats.total_instructors, emoji:'👨‍🏫', bg:'var(--green-pale)', color:'var(--green-dark)' },
              { label:'অনুমোদন বাকি', value:stats.pending_instructors, emoji:'⏳', bg:'#fef3c7', color:'#92400e' },
              { label:'মোট কোর্স', value:stats.total_courses, emoji:'📚', bg:'#ede9fe', color:'#5b21b6' },
              { label:'মোট পাঠ', value:stats.total_lessons, emoji:'🎬', bg:'#fce7f3', color:'#9d174d' },
            ].map((s,i) => (
              <div key={i} style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px 20px' }}>
                <div style={{ width:40, height:40, borderRadius:10, background:s.bg, color:s.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:8 }}>{s.emoji}</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color:'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Pending banner */}
        {stats?.pending_instructors > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'var(--warning-light)', border:'1px solid #fde68a', borderRadius:10, fontSize:14, color:'var(--warning)', marginBottom:24 }}>
            <Clock size={15} />
            <strong>{stats.pending_instructors} জন শিক্ষক</strong> অনুমোদনের অপেক্ষায় আছেন
            <button onClick={() => setFilter('pending')} style={{ marginLeft:'auto', padding:'5px 12px', fontSize:12, background:'var(--gold-main)', color:'white', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'var(--font-body)' }}>দেখুন</button>
          </div>
        )}

        {/* Table */}
        <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
          <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border-light)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>সকল ব্যবহারকারী</h2>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {[
                { value:'all', label:'সবাই' },
                { value:'student', label:'শিক্ষার্থী' },
                { value:'instructor', label:'শিক্ষক' },
                { value:'admin', label:'প্রশাসক' },
                { value:'pending', label:'⏳ বাকি' },
              ].map(f => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  style={{ padding:'5px 12px', borderRadius:100, border:'1px solid var(--border)', background: filter===f.value ? 'var(--green-main)' : 'white', color: filter===f.value ? 'white' : 'var(--text-secondary)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-body)', display:'flex', alignItems:'center', gap:4 }}>
                  {f.label}
                  <span style={{ background:'rgba(0,0,0,0.12)', borderRadius:100, padding:'0 5px', fontSize:10 }}>
                    {f.value==='all' ? users.length : f.value==='pending' ? users.filter(u=>u.role==='instructor'&&!u.approved).length : users.filter(u=>u.role===f.value).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length===0 ? (
            <div style={{ padding:32, textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🌾</div>
              কোনো ব্যবহারকারী পাওয়া যায়নি
            </div>
          ) : filtered.map((u, i) => (
            <div key={u.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr', alignItems:'center', padding:'12px 24px', borderBottom:'1px solid var(--border-light)', gap:8 }}>
              {i===0 && false}
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg, var(--green-main), var(--green-light))', color:'white', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{u.name[0]}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{u.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{u.email}</div>
                </div>
              </div>
              <div><code style={{ fontSize:11, background:'var(--cream)', padding:'2px 6px', borderRadius:4, color:'var(--text-secondary)' }}>{u.user_id}</code></div>
              <div>
                <span style={{ fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:100, background: u.role==='admin'?'#fee2e2':u.role==='instructor'?'var(--green-pale)':'var(--gold-pale)', color: u.role==='admin'?'var(--danger)':u.role==='instructor'?'var(--green-dark)':'var(--gold-dark)' }}>
                  {roleLabel[u.role]}
                </span>
              </div>
              <div>
                <span className={`badge ${u.approved ? 'badge-green' : 'badge-gold'}`}>
                  {u.approved ? '✅ সক্রিয়' : '⏳ বাকি'}
                </span>
              </div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString('bn-BD')}</div>
              <div>
                {u.role !== 'admin' && (
                  <div style={{ display:'flex', gap:6 }}>
                    {!u.approved && (
                      <button onClick={() => approve(u.id)} className="btn btn-success" style={{ padding:'5px 10px', fontSize:11 }}>
                        <Check size={11} /> অনুমোদন
                      </button>
                    )}
                    {u.approved && (
                      <button onClick={() => revoke(u.id)} className="btn btn-danger" style={{ padding:'5px 10px', fontSize:11 }}>
                        <UserX size={11} /> বাতিল
                      </button>
                    )}
                  </div>
                )}
                {u.role==='admin' && <span style={{ fontSize:12, color:'var(--text-muted)' }}>—</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
