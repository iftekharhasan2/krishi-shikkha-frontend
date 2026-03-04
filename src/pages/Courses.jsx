import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import CourseCard from '../components/CourseCard'
import { Search } from 'lucide-react'

const CATEGORIES = ['', 'ফসল উৎপাদন', 'পশুপালন', 'মৎস্য চাষ', 'জৈব চাষ', 'সেচ ব্যবস্থাপনা', 'কৃষি রসায়ন', 'মাটি ব্যবস্থাপনা', 'বনায়ন', 'অন্যান্য']

export default function CoursesPage() {
  const [searchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || '')

  useEffect(() => { fetchCourses() }, [category])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      const { data } = await axios.get(`/api/courses/?${params}`)
      setCourses(data)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={styles.header}>
        <div style={styles.headerBg} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="section-tag">📚 সকল কোর্স</div>
          <h1 className="page-title" style={{ marginTop: 8, marginBottom: 8 }}>কৃষি কোর্সসমূহ</h1>
          <p style={styles.subtitle}>বিশেষজ্ঞ কৃষিবিদদের কাছ থেকে শিখুন, আপনার ফসল উৎপাদন বাড়ান</p>

          <form onSubmit={(e) => { e.preventDefault(); fetchCourses() }} style={styles.searchRow}>
            <div style={styles.searchBox}>
              <Search size={16} style={styles.searchIcon} />
              <input style={styles.searchInput} placeholder="কোর্স খুঁজুন..." value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} style={styles.select}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c || 'সকল বিষয়'}</option>)}
            </select>
            <button type="submit" className="btn btn-primary">🔍 খুঁজুন</button>
          </form>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : courses.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: 64 }}>🌾</div>
            <h3 style={styles.emptyTitle}>কোনো কোর্স পাওয়া যায়নি</h3>
            <p style={styles.emptyDesc}>অনুসন্ধানের শর্ত পরিবর্তন করুন বা অন্য বিষয় বেছে নিন</p>
          </div>
        ) : (
          <>
            <p style={styles.count}>মোট <strong>{courses.length}টি</strong> কোর্স পাওয়া গেছে</p>
            <div className="courses-grid">
              {courses.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  header: {
    padding: '50px 0 40px', position: 'relative',
    background: 'linear-gradient(160deg, var(--green-ultra) 0%, var(--off-white) 60%, var(--gold-pale) 100%)',
    borderBottom: '1px solid var(--border)',
  },
  headerBg: {
    position: 'absolute', inset: 0,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232d6a4f' fill-opacity='0.03'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
    pointerEvents: 'none',
  },
  subtitle: { color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 },
  searchRow: { display: 'flex', gap: 10, maxWidth: 680 },
  searchBox: { flex: 1, position: 'relative' },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' },
  searchInput: {
    width: '100%', padding: '11px 14px 11px 38px',
    border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
    fontSize: 15, background: 'white', outline: 'none', fontFamily: 'var(--font-body)',
  },
  select: {
    padding: '11px 14px', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)', fontSize: 15,
    background: 'white', outline: 'none', color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)', minWidth: 170,
  },
  count: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 },
  empty: { textAlign: 'center', padding: '80px 24px' },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: 'var(--text-muted)' },
}
