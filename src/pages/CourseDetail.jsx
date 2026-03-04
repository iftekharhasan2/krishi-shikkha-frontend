import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Users, BookOpen, Clock, Lock, Play, CheckCircle } from 'lucide-react'
import BkashPaymentModal from '../components/BkashPaymentModal'

function formatDuration(sec) {
  if (!sec) return '—'
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60
  if (h > 0) return `${h}ঘ ${m}মি`
  if (m > 0) return `${m}মি ${s}সে`
  return `${s} সেকেন্ড`
}

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    axios.get(`/api/courses/${id}`).then(r => {
      setCourse(r.data)
      if (user) setEnrolled(user.enrolled_courses?.includes(id))
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (user?.enrolled_courses) setEnrolled(user.enrolled_courses.includes(id))
  }, [user])

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return }
    // Paid course → show bKash payment modal
    if (course.price > 0) {
      setShowPaymentModal(true)
      return
    }
    // Free course → direct enroll
    setEnrolling(true)
    try {
      await axios.post(`/api/courses/${id}/enroll`)
      setEnrolled(true)
      showToast('সফলভাবে ভর্তি হয়েছেন! 🌱', 'success')
    } catch (err) {
      showToast(err.response?.data?.error || 'ভর্তি হতে সমস্যা হয়েছে', 'error')
    } finally { setEnrolling(false) }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (!course) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>কোর্স পাওয়া যায়নি</div>

  const isInstructor = user && (user.id === course.instructor_id || user.role === 'admin')
  const hasAccess = enrolled || isInstructor

  return (
    <div>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroDeco}>🌾</div>
        <div style={styles.heroInner}>
          <div style={styles.heroLeft}>
            {course.category && <div style={styles.category}>🌿 {course.category}</div>}
            <h1 style={styles.title}>{course.title}</h1>
            <p style={styles.desc}>{course.description}</p>
            <div style={styles.metaRow}>
              <span style={styles.metaItem}><Users size={14} /> {course.enrolled_count} জন শিক্ষার্থী</span>
              <span style={styles.metaItem}><BookOpen size={14} /> {course.lessons_count}টি পাঠ</span>
              <span className="badge badge-green">{course.level}</span>
            </div>
            <div style={styles.instructor}>
              <div style={styles.instructorAv}>
                {course.instructor_avatar ? <img src={course.instructor_avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <span>{course.instructor_name?.[0]}</span>}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>শিক্ষক</div>
                <div style={styles.instructorName}>{course.instructor_name}</div>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.sideCard}>
              {course.thumbnail ? (
                <img src={course.thumbnail} style={styles.thumbnail} alt={course.title} />
              ) : (
                <div style={styles.thumbPlaceholder}><span style={{ fontSize: 60 }}>🌾</span></div>
              )}
              <div style={styles.sideCardBody}>
                <div style={styles.priceRow}>
                  {course.price === 0 ? <span style={styles.priceFree}>🎁 সম্পূর্ণ বিনামূল্যে</span>
                    : <span style={styles.price}>৳{course.price}</span>}
                </div>
                {isInstructor ? (
                  <Link to={`/instructor/course/${id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    🛠️ কোর্স পরিচালনা করুন
                  </Link>
                ) : enrolled ? (
                  <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center', cursor: 'default' }}>
                    <CheckCircle size={16} /> ভর্তি সম্পন্ন হয়েছে
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={handleEnroll} disabled={enrolling}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {enrolling ? 'ভর্তি হচ্ছেন...' : course.price === 0 ? '🌱 বিনামূল্যে ভর্তি হন' : `৳${course.price} — ভর্তি হন`}
                  </button>
                )}
                {!user && <p style={styles.loginNote}><Link to="/login" style={{ color: 'var(--green-main)' }}>প্রবেশ করুন</Link> ভর্তির জন্য</p>}
                <div style={styles.includes}>
                  <div style={styles.includesTitle}>এই কোর্সে পাবেন:</div>
                  {[
                    '🎬 ' + course.lessons_count + 'টি ভিডিও পাঠ',
                    '📄 ডাউনলোডযোগ্য নোট',
                    '✅ আজীবন অ্যাক্সেস',
                    '🎁 প্রথম পাঠ বিনামূল্যে',
                  ].map((item, i) => (
                    <div key={i} style={styles.includeItem}>{item}</div>
                  ))}
                </div>
                {course.tags?.length > 0 && (
                  <div style={styles.tags}>
                    {course.tags.map(t => <span key={t} style={styles.tag}>#{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="container" style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 700 }}>
          {course.long_description && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>🌾 কোর্স সম্পর্কে</h2>
              <p style={styles.longDesc}>{course.long_description}</p>
            </div>
          )}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📚 পাঠ্যক্রম</h2>
            <p style={styles.lessonCount}>{course.lessons?.length || 0}টি পাঠ</p>
            <div style={styles.lessonList}>
              {course.lessons?.map((lesson, i) => (
                <div key={lesson.id} style={styles.lessonItem}>
                  <div style={styles.lessonLeft}>
                    <div style={styles.lessonNum}>{i + 1}</div>
                    <div>
                      <div style={styles.lessonTitle}>{lesson.title}</div>
                      {lesson.description && <div style={styles.lessonDesc}>{lesson.description}</div>}
                    </div>
                  </div>
                  <div style={styles.lessonRight}>
                    {lesson.is_free && <span style={styles.freePill}>বিনামূল্যে</span>}
                    {lesson.duration > 0 && <span style={styles.duration}><Clock size={11} /> {formatDuration(lesson.duration)}</span>}
                    {hasAccess || lesson.is_free ? (
                      <Link to={`/lesson/${lesson.id}`} style={styles.playBtn}><Play size={14} /></Link>
                    ) : <div style={styles.lockIcon}><Lock size={14} /></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* bKash Payment Modal */}
      {showPaymentModal && course && (
        <BkashPaymentModal
          course={course}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => { setEnrolled(true); setShowPaymentModal(false) }}
        />
      )}
    </div>
  )
}

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #0d2614 0%, #1a3d20 50%, #0f2d1a 100%)',
    padding: '60px 0', position: 'relative', overflow: 'hidden',
  },
  heroDeco: {
    position: 'absolute', right: -30, bottom: -20,
    fontSize: 200, opacity: 0.04, transform: 'rotate(20deg)', pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 24px',
    display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start',
  },
  heroLeft: { paddingTop: 8 },
  category: { fontSize: 12, fontWeight: 700, color: 'var(--green-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 },
  title: { fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 16 },
  desc: { fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: 24 },
  metaRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#94a3b8' },
  instructor: { display: 'flex', alignItems: 'center', gap: 12 },
  instructorAv: {
    width: 42, height: 42, borderRadius: '50%',
    background: 'var(--green-mid)', color: 'white',
    fontSize: 18, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  instructorName: { fontSize: 15, fontWeight: 600, color: '#e2e8f0' },
  heroRight: {},
  sideCard: { background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' },
  thumbnail: { width: '100%', height: 200, objectFit: 'cover' },
  thumbPlaceholder: { width: '100%', height: 180, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sideCardBody: { padding: 24 },
  priceRow: { marginBottom: 16 },
  price: { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--text-primary)' },
  priceFree: { fontSize: 18, fontWeight: 700, color: 'var(--success)' },
  loginNote: { textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 10 },
  includes: { marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-light)' },
  includesTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 },
  includeItem: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 7, lineHeight: 1.5 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-light)' },
  tag: { padding: '3px 10px', borderRadius: 100, background: 'var(--green-pale)', fontSize: 11, color: 'var(--green-dark)', fontWeight: 500 },
  section: { marginBottom: 40 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 },
  longDesc: { fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 },
  lessonCount: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 },
  lessonList: { border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' },
  lessonItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', borderBottom: '1px solid var(--border-light)',
    background: 'white',
  },
  lessonLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  lessonNum: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'var(--green-pale)', color: 'var(--green-dark)',
    fontSize: 13, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  lessonTitle: { fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' },
  lessonDesc: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
  lessonRight: { display: 'flex', alignItems: 'center', gap: 10 },
  freePill: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'var(--green-pale)', color: 'var(--green-dark)' },
  duration: { display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)' },
  playBtn: { width: 32, height: 32, borderRadius: '50%', background: 'var(--green-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  lockIcon: { width: 32, height: 32, borderRadius: '50%', background: 'var(--cream)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
