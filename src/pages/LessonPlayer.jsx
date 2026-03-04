import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../contexts/ToastContext'
import { ArrowLeft, Download, Lock, Play, ChevronLeft, ChevronRight } from 'lucide-react'

function formatDuration(sec) {
  if (!sec) return '০:০০'
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${m}:${String(s).padStart(2,'0')}`
}

export default function LessonPlayer() {
  const { lessonId } = useParams()
  const { showToast } = useToast()
  // Append JWT token to media URLs so browser <video>/<a> can authenticate
  const getAuthUrl = (url) => {
    if (!url) return url
    const token = localStorage.getItem('token')
    return token ? `${url}?token=${encodeURIComponent(token)}` : url
  }
  const [lesson, setLesson] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLesson() }, [lessonId])

  const loadLesson = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/lessons/${lessonId}`)
      setLesson(data)
      const lessonsResp = await axios.get(`/api/lessons/course/${data.course_id}`)
      setLessons(lessonsResp.data)
    } catch (err) {
      showToast(err.response?.data?.error || 'পাঠ লোড করতে সমস্যা হয়েছে', 'error')
    } finally { setLoading(false) }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (!lesson) return null

  const currentIndex = lessons.findIndex(l => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <Link to={`/courses/${lesson.course_id}`} style={styles.backLink}>
            <ArrowLeft size={13} /> কোর্সে ফিরুন
          </Link>
          <div style={styles.sidebarTitle}>📚 পাঠ্যক্রম</div>
        </div>
        <div style={styles.lessonList}>
          {lessons.map((l, i) => (
            <Link key={l.id} to={`/lesson/${l.id}`} style={{
              ...styles.lessonItem,
              ...(l.id === lessonId ? styles.lessonItemActive : {}),
              ...((!l.has_access && !l.is_free) ? styles.lessonItemLocked : {})
            }}>
              <div style={{ ...styles.lessonNum, ...(l.id === lessonId ? styles.lessonNumActive : {}) }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.lessonName}>{l.title}</div>
                {l.duration > 0 && <div style={styles.lessonDur}>⏱ {formatDuration(l.duration)}</div>}
              </div>
              {l.is_free && <span style={styles.freePill}>বিনামূল্যে</span>}
              {(!l.has_access && !l.is_free) && <Lock size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
            </Link>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.videoWrap}>
          {lesson.has_video ? (
            <video controlsList="nodownload" src={getAuthUrl(lesson.video_url)} controls style={styles.video} />
          ) : (
            <div style={styles.noVideo}>
              <span style={{ fontSize: 48 }}>🎬</span>
              <p>এই পাঠে কোনো ভিডিও নেই</p>
            </div>
          )}
        </div>

        <div style={styles.content}>
          <div style={styles.lessonHeader}>
            <div>
              <h1 style={styles.lessonTitle}>{lesson.title}</h1>
              {lesson.description && <p style={styles.lessonDesc}>{lesson.description}</p>}
            </div>
            {lesson.has_note && (
              <a 
                href={getAuthUrl(`/api/lessons/${lessonId}/note`)}
                download={lesson.note_filename || 'নোট'}
                style={styles.downloadBtn}
              >
                <Download size={15} /> 📄 {lesson.note_filename || 'নোট ডাউনলোড করুন'}
              </a>
            )}
          </div>

          <div style={styles.navigation}>
            {prevLesson ? (
              <Link to={`/lesson/${prevLesson.id}`} className="btn btn-secondary">
                <ChevronLeft size={16} /> আগের পাঠ
              </Link>
            ) : <div />}
            {nextLesson?.has_access && (
              <Link to={`/lesson/${nextLesson.id}`} className="btn btn-primary">
                পরের পাঠ <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', height: 'calc(100vh - 69px)', overflow: 'hidden' },
  sidebar: {
    width: 300, flexShrink: 0,
    background: 'var(--off-white)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  sidebarHeader: { padding: 16, borderBottom: '1px solid var(--border)', background: 'var(--green-ultra)' },
  backLink: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--green-main)', textDecoration: 'none', marginBottom: 10, fontWeight: 500 },
  sidebarTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  lessonList: { flex: 1, overflowY: 'auto' },
  lessonItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 14px', borderBottom: '1px solid var(--border-light)',
    textDecoration: 'none', color: 'var(--text-primary)', transition: 'background 0.15s',
  },
  lessonItemActive: { background: 'var(--green-pale)', borderLeft: '3px solid var(--green-main)' },
  lessonItemLocked: { opacity: 0.45, pointerEvents: 'none' },
  lessonNum: {
    width: 26, height: 26, borderRadius: '50%',
    background: 'var(--border)', color: 'var(--text-secondary)',
    fontSize: 11, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  lessonNumActive: { background: 'var(--green-main)', color: 'white' },
  lessonName: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 },
  lessonDur: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  freePill: { fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 100, background: 'var(--green-pale)', color: 'var(--green-dark)', flexShrink: 0 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  videoWrap: { background: '#000', width: '100%', aspectRatio: '16/9', maxHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  video: { width: '100%', height: '100%', objectFit: 'contain' },
  noVideo: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  content: { padding: '28px 32px', flex: 1 },
  lessonHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 24 },
  lessonTitle: { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  lessonDesc: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.7 },
  downloadBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', background: 'var(--green-ultra)',
    color: 'var(--green-dark)', borderRadius: 'var(--radius-sm)',
    fontSize: 13, fontWeight: 600, textDecoration: 'none',
    border: '1px solid var(--green-pale)', flexShrink: 0, cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  navigation: { display: 'flex', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid var(--border-light)' },
}
