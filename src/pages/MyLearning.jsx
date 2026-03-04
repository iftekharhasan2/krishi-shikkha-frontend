// MyLearning.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Play } from 'lucide-react'

export function MyLearning() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/users/enrolled').then(r => setCourses(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div style={{ padding: '48px 0', minHeight: 'calc(100vh - 69px)', background: 'var(--off-white)' }}>
      <div className="container">
        <div className="section-tag" style={{ marginBottom: 10 }}>🌱 আমার শিক্ষা</div>
        <h1 className="page-title" style={{ marginBottom: 6 }}>আমার কোর্সসমূহ</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 36 }}>আপনি যে কোর্সগুলোতে ভর্তি হয়েছেন</p>

        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌾</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>এখনো কোনো কোর্সে ভর্তি হননি</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>কোর্স দেখুন এবং আজই শিক্ষা শুরু করুন</p>
            <Link to="/courses" className="btn btn-primary">কোর্স দেখুন</Link>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(c => (
              <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 160, overflow: 'hidden', background: 'var(--cream)' }}>
                  {c.thumbnail ? <img src={c.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🌾</div>}
                </div>
                <div style={{ padding: 16, flex: 1 }}>
                  {c.category && <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-mid)', marginBottom: 4 }}>🌿 {c.category}</div>}
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{c.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>শিক্ষক: {c.instructor_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.lesson_count}টি পাঠ</p>
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 8 }}>
                  <Link to={`/courses/${c.id}`} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>বিস্তারিত</Link>
                  <Link to={`/courses/${c.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}><Play size={13} /> চালিয়ে যান</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
