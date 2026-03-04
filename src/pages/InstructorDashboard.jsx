import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../contexts/ToastContext'
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

export default function InstructorDashboard() {
  const { showToast } = useToast()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    axios.get('/api/courses/instructor/my-courses').then(r => setCourses(r.data)).finally(() => setLoading(false))
  }, [])

  const deleteCourse = async (id) => {
    if (!confirm('এই কোর্স এবং সকল পাঠ মুছে ফেলবেন?')) return
    try {
      await axios.delete(`/api/courses/${id}`)
      setCourses(prev => prev.filter(c => c.id !== id))
      showToast('কোর্স মুছে ফেলা হয়েছে', 'success')
    } catch { showToast('মুছতে সমস্যা হয়েছে', 'error') }
  }

  const totalStudents = courses.reduce((s,c) => s + c.enrolled_count, 0)
  const totalLessons = courses.reduce((s,c) => s + c.lessons_count, 0)

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div style={{ padding: '48px 0', minHeight: 'calc(100vh - 69px)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div className="section-tag" style={{ marginBottom: 8 }}>🧑‍🏫 শিক্ষক</div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>শিক্ষক ড্যাশবোর্ড</h1>
            <p style={{ color: 'var(--text-muted)' }}>আপনার কোর্স পরিচালনা করুন ও শিক্ষার্থীদের অগ্রগতি দেখুন</p>
          </div>
          <Link to="/instructor/create-course" className="btn btn-primary">
            <Plus size={15} /> নতুন কোর্স
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 36 }}>
          {[
            { label: 'মোট কোর্স', value: courses.length, emoji: '📚', bg: 'var(--green-pale)', color: 'var(--green-dark)' },
            { label: 'মোট শিক্ষার্থী', value: totalStudents, emoji: '👨‍🌾', bg: '#f3e8ff', color: '#7c3aed' },
            { label: 'মোট পাঠ', value: totalLessons, emoji: '🎬', bg: 'var(--gold-pale)', color: 'var(--gold-dark)' },
          ].map((s,i) => (
            <div key={i} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 10 }}>{s.emoji}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Course List */}
        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌱</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>এখনো কোনো কোর্স নেই</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>আপনার প্রথম কোর্স তৈরি করুন</p>
            <Link to="/instructor/create-course" className="btn btn-primary"><Plus size={15} /> কোর্স তৈরি করুন</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {courses.map(c => (
              <div key={c.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 64, height: 48, borderRadius: 8, background: 'var(--cream)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {c.thumbnail ? <img src={c.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 22 }}>🌾</span>}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5 }}>{c.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>👨‍🌾 {c.enrolled_count} জন</span>
                        <span>📚 {c.lessons_count}টি পাঠ</span>
                        {c.price > 0 ? <span>৳{c.price}</span> : <span style={{ color: 'var(--success)' }}>বিনামূল্যে</span>}
                        {c.category && <span className="badge badge-green" style={{ fontSize: 11 }}>{c.category}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Link to={`/instructor/course/${c.id}`} className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }}><Edit size={12} /> সম্পাদনা</Link>
                    <button onClick={() => deleteCourse(c.id)} className="btn btn-danger" style={{ padding: '7px 12px', fontSize: 13 }}><Trash2 size={12} /></button>
                    <button onClick={() => setExpanded(p => ({ ...p, [c.id]: !p[c.id] }))}
                      style={{ padding: '7px 10px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      {expanded[c.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {expanded[c.id] && (
                  <div style={{ padding: '14px 20px', background: 'var(--green-ultra)', borderTop: '1px solid var(--green-pale)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 10 }}>
                      ভর্তি হওয়া শিক্ষার্থীরা ({c.enrolled_students?.length || 0} জন)
                    </h4>
                    {c.enrolled_students?.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>এখনো কেউ ভর্তি হননি</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {c.enrolled_students?.map(s => (
                          <div key={s.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'white', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--green-main)', color: 'white', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.name[0]}</div>
                            <div><div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div></div>
                            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{s.user_id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
