import React from 'react'
import { Link } from 'react-router-dom'
import { Users, BookOpen, Clock } from 'lucide-react'

function formatDuration(sec) {
  if (!sec) return ''
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}ঘ ${m}মি`
  return `${m} মিনিট`
}

const LEVEL_EMOJI = { 'প্রাথমিক': '🌱', 'মধ্যবর্তী': '🌿', 'উন্নত': '🌳' }

export default function CourseCard({ course }) {
  return (
    <div className="card" style={styles.card}>
      {/* Thumbnail */}
      <div style={styles.thumb}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} style={styles.thumbImg} />
        ) : (
          <div style={styles.thumbPlaceholder}>
            <span style={{ fontSize: 48 }}>🌾</span>
          </div>
        )}
        {course.price === 0 && (
          <span style={styles.freeBadge}>বিনামূল্যে</span>
        )}
        <div style={styles.levelBadge}>
          {LEVEL_EMOJI[course.level] || '🌱'} {course.level}
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {course.category && (
          <div style={styles.category}>🌿 {course.category}</div>
        )}
        <h3 style={styles.title}>{course.title}</h3>
        <p style={styles.desc}>{course.description}</p>

        <div style={styles.instructor}>
          <div style={styles.instructorAv}>
            {course.instructor_avatar ? (
              <img src={course.instructor_avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : <span style={{ fontSize: 12 }}>{course.instructor_name?.[0]}</span>}
          </div>
          <span style={styles.instructorName}>{course.instructor_name}</span>
        </div>

        <div style={styles.meta}>
          <span style={styles.metaItem}><Users size={12} /> {course.enrolled_count} জন</span>
          <span style={styles.metaItem}><BookOpen size={12} /> {course.lessons_count} পাঠ</span>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div>
          {course.price === 0 ? (
            <span style={styles.priceFree}>🎁 বিনামূল্যে</span>
          ) : (
            <span style={styles.price}>৳{course.price}</span>
          )}
        </div>
        <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
          দেখুন →
        </Link>
      </div>
    </div>
  )
}

const styles = {
  card: { display: 'flex', flexDirection: 'column' },
  thumb: { height: 185, position: 'relative', overflow: 'hidden', background: 'var(--cream)' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' },
  thumbPlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #fff8e1 100%)',
  },
  freeBadge: {
    position: 'absolute', top: 10, left: 10,
    background: 'var(--green-main)', color: 'white',
    fontSize: 11, fontWeight: 700, padding: '3px 10px',
    borderRadius: 100, fontFamily: 'var(--font-body)',
  },
  levelBadge: {
    position: 'absolute', bottom: 10, right: 10,
    background: 'rgba(0,0,0,0.55)', color: 'white',
    fontSize: 11, fontWeight: 500, padding: '3px 9px',
    borderRadius: 6, backdropFilter: 'blur(4px)',
    fontFamily: 'var(--font-body)',
  },
  body: { padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 7 },
  category: { fontSize: 11, fontWeight: 700, color: 'var(--green-mid)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
    color: 'var(--text-primary)', lineHeight: 1.35,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  desc: {
    fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  instructor: { display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 },
  instructorAv: {
    width: 24, height: 24, borderRadius: '50%',
    background: 'var(--green-main)', color: 'white',
    fontSize: 11, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  instructorName: { fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 },
  meta: { display: 'flex', gap: 14, marginTop: 2 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' },
  footer: {
    padding: '12px 18px', borderTop: '1px solid var(--border-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'var(--off-white)',
  },
  price: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--green-dark)' },
  priceFree: { fontSize: 14, fontWeight: 600, color: 'var(--success)' },
}
