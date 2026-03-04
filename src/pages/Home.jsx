import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import CourseCard from '../components/CourseCard'
import { ArrowRight, PlayCircle, Award, Users } from 'lucide-react'
import axios from 'axios'

export default function Home() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [topCourses, setTopCourses] = useState([])

  useEffect(() => {
    axios.get('/api/courses/')
      .then(r => {
        // 1. Sort by enrolled count (descending)
        // 2. Slice the top 3
        const sorted = r.data.sort((a, b) => (b.enrolled || 0) - (a.enrolled || 0))
        setTopCourses(sorted.slice(0, 3))
      })
      .catch(() => showToast('কোর্স লোড করতে সমস্যা হয়েছে', 'error'))
  }, [])

  return (
    <div>
      {/* ===== REDESIGNED HERO SECTION ===== */}
      <section style={styles.heroSection}>
        {/* Background Decor */}
        <div style={styles.heroBgPattern}></div>
        <div style={styles.heroBlob}></div>

        <div className="container" style={styles.heroContainer}>
          {/* Left Content */}
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <span style={styles.heroBadgeDot}></span>
              নতুন সেশন শুরু হয়েছে
            </div>
            
            <h1 style={styles.heroTitle}>
              কৃষিতে বিপ্লব আনুন <br />
              <span style={styles.heroHighlight}>আধুনিক</span> শিক্ষার মাধ্যমে
            </h1>
            
            <p style={styles.heroSubtitle}>
              বাংলাদেশের সেরা কৃষি বিজ্ঞানীদের তত্ত্বাবধানে শিখুন আধুনিক চাষাবাদ, মাটি ব্যবস্থাপনা এবং ফসল উৎপাদন। আপনার জমিকে করুন সোনালী ফসলের ভাণ্ডার।
            </p>

            <div style={styles.heroBtnGroup}>
              <Link to="/courses" className="btn btn-primary" style={styles.heroBtnPrimary}>
                কোর্স খুঁজুন <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn btn-outline" style={styles.heroBtnSecondary}>
                <PlayCircle size={18} /> কীভাবে কাজ করে
              </Link>
            </div>

            <div style={styles.heroStats}>
              <div style={styles.statBox}>
                <Users size={20} color="var(--green-main)" />
                <span> ৫0+ শিক্ষার্থী</span>
              </div>
              <div style={styles.statBox}>
                <Award size={20} color="var(--gold-main)" />
                <span>সার্টিফাইড শিক্ষকদের দ্বারা পরিচালিত কোর্স</span>
              </div>
            </div>
          </div>

          {/* Right Visual (Smart Farming Dashboard) */}
          <div style={styles.heroVisual}>
            <div style={styles.visualCard}>
              <div style={styles.visualHeader}>
                <div style={styles.visualTitleRow}>
                  <div style={styles.visualDotRed}></div>
                  <div style={styles.visualDotYellow}></div>
                  <div style={styles.visualDotGreen}></div>
                </div>
                <span style={styles.visualTitleText}>ড্যাশবোর্ড</span>
              </div>
              
              <div style={styles.visualBody}>
                <div style={styles.visualChartRow}>
                  <div style={{...styles.chartBar, height: '60%', background: 'var(--green-light)'}}></div>
                  <div style={{...styles.chartBar, height: '85%', background: 'var(--green-main)'}}></div>
                  <div style={{...styles.chartBar, height: '45%', background: 'var(--gold-main)'}}></div>
                  <div style={{...styles.chartBar, height: '70%', background: 'var(--green-dark)'}}></div>
                </div>
                <div style={styles.visualFloatingCard}>
                  <div style={styles.floatingIcon}>🌾</div>
                  <div>
                    <div style={styles.floatingLabel}>ফসল উৎপাদন</div>
                    <div style={styles.floatingValue}>+২৪% বৃদ্ধি</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Circle */}
            <div style={styles.visualCircle}></div>
          </div>
        </div>
      </section>

      {/* ===== TOP 3 FEATURED COURSES ===== */}
      <section style={styles.featuredSection}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>সর্বাধিক জনপ্রিয় কোর্স</h2>
              <p style={styles.sectionSubtitle}>শিক্ষার্থীদের পছন্দের শীর্ষ ৩টি কোর্স যা আপনাকে এগিয়ে রাখবে</p>
            </div>
            <Link to="/courses" style={styles.viewAllLink}>
              সব কোর্স দেখুন <ArrowRight size={16} />
            </Link>
          </div>

          {topCourses.length > 0 ? (
            <div style={styles.featuredGrid}>
              {topCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div style={styles.loadingState}>কোর্স লোড হচ্ছে...</div>
          )}
        </div>
      </section>

      {/* ===== CATEGORIES (Kept from original) ===== */}
      <section style={styles.categoriesSection}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 className="section-title">বিষয়ভিত্তিক কোর্স</h2>
          </div>
          <div style={styles.catGrid}>
            {[
              { emoji: '🌾', name: 'ফসল উৎপাদন', count: '৪৫+' },
              { emoji: '🐄', name: 'পশুপালন', count: '৩০+' },
              { emoji: '🐟', name: 'মৎস্য চাষ', count: '২৫+' },
              { emoji: '🌿', name: 'জৈব চাষ', count: '৩৮+' },
            ].map((cat, i) => (
              <Link to={`/courses?category=${cat.name}`} key={i} style={styles.catCard}>
                <span style={{ fontSize: 28 }}>{cat.emoji}</span>
                <span style={styles.catName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={styles.ctaSection}>
        <div className="container">
          <div style={styles.ctaCard}>
            <h2 style={styles.ctaTitle}>আজই শুরু করুন আপনার কৃষি যাত্রা</h2>
            <Link to={user ? '/courses' : '/register'} className="btn" style={styles.ctaBtn}>
              {user ? 'কোর্স দেখুন' : 'বিনামূল্যে নিবন্ধন করুন'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// ===== STYLES =====
const styles = {
  // --- HERO STYLES ---
  heroSection: {
    position: 'relative',
    padding: '80px 0 100px',
    background: 'linear-gradient(180deg, #F9FCF9 0%, #FFFFFF 100%)',
    overflow: 'hidden',
  },
  heroBgPattern: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'radial-gradient(#e0eadd 1px, transparent 1px)',
    backgroundSize: '30px 30px',
    opacity: 0.4,
    zIndex: 0,
  },
  heroBlob: {
    position: 'absolute',
    top: '-10%', right: '-5%',
    width: '600px', height: '600px',
    background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, rgba(255,255,255,0) 70%)',
    borderRadius: '50%',
    zIndex: 0,
  },
  heroContainer: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '60px',
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: '600px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#ecfdf5',
    color: '#047857',
    padding: '6px 14px',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '24px',
    border: '1px solid #d1fae5',
  },
  heroBadgeDot: {
    width: '8px', height: '8px',
    background: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '56px',
    lineHeight: '1.1',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '24px',
    letterSpacing: '-1px',
  },
  heroHighlight: {
    color: 'var(--green-main)',
    position: 'relative',
    display: 'inline-block',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#4b5563',
    lineHeight: '1.7',
    marginBottom: '36px',
    maxWidth: '500px',
  },
  heroBtnGroup: {
    display: 'flex',
    gap: '16px',
    marginBottom: '40px',
  },
  heroBtnPrimary: {
    background: 'var(--green-main)',
    color: 'white',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    fontSize: '16px',
    boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.4)',
    transition: 'transform 0.2s',
  },
  heroBtnSecondary: {
    background: 'white',
    color: '#374151',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    fontSize: '16px',
  },
  heroStats: {
    display: 'flex',
    gap: '32px',
    paddingTop: '20px',
    borderTop: '1px solid #f3f4f6',
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
  },
  
  // Hero Visual (Right Side)
  heroVisual: {
    position: 'relative',
    height: '500px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualCard: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    padding: '24px',
    zIndex: 2,
    transform: 'rotate(-2deg)',
    transition: 'transform 0.5s ease',
  },
  visualHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  visualTitleRow: { display: 'flex', gap: '6px' },
  visualDotRed: { width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' },
  visualDotYellow: { width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' },
  visualDotGreen: { width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' },
  visualTitleText: { fontSize: '14px', fontWeight: '700', color: '#9ca3af' },
  visualBody: {
    height: '280px',
    background: '#f9fafb',
    borderRadius: '16px',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    padding: '20px',
  },
  visualChartRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    height: '100%',
    width: '100%',
  },
  chartBar: {
    flex: 1,
    borderRadius: '6px 6px 0 0',
    opacity: 0.8,
    transition: 'height 1s ease',
  },
  visualFloatingCard: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'white',
    padding: '12px 16px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #f3f4f6',
    animation: 'float 4s ease-in-out infinite',
  },
  floatingIcon: { fontSize: '24px' },
  floatingLabel: { fontSize: '11px', color: '#6b7280', fontWeight: '500' },
  floatingValue: { fontSize: '14px', fontWeight: '700', color: '#059669' },
  visualCircle: {
    position: 'absolute',
    width: '300px', height: '300px',
    border: '2px dashed #d1fae5',
    borderRadius: '50%',
    zIndex: 1,
    animation: 'spin 20s linear infinite',
  },

  // --- FEATURED COURSES STYLES ---
  featuredSection: {
    padding: '80px 0',
    background: '#ffffff',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px',
  },
  sectionSubtitle: {
    color: '#6b7280',
    fontSize: '16px',
  },
  viewAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--green-main)',
    fontWeight: '600',
    fontSize: '15px',
    textDecoration: 'none',
  },
  featuredGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // Changed to 3 columns
    gap: '30px',
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px',
    color: '#9ca3af',
    fontSize: '16px',
  },

  // --- CATEGORIES STYLES ---
  categoriesSection: {
    padding: '60px 0',
    background: '#f9fafb',
    borderTop: '1px solid #f3f4f6',
  },
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  catCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px',
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  catName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
  },

  // --- CTA STYLES ---
  ctaSection: { padding: '60px 0' },
  ctaCard: {
    background: 'var(--green-dark)',
    borderRadius: '24px',
    padding: '60px 20px',
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '30px',
    zIndex: 2,
    position: 'relative',
  },
  ctaBtn: {
    background: 'var(--gold-main)',
    color: '#fff', // Changed text color for contrast
    padding: '14px 36px',
    borderRadius: '50px',
    fontWeight: '700',
    fontSize: '16px',
    zIndex: 2,
    position: 'relative',
    textDecoration: 'none',
    display: 'inline-block',
  },
}