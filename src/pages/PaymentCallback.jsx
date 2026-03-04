import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState('processing') // processing | success | failed | cancelled
  const [message, setMessage] = useState('')
  const [trxId, setTrxId] = useState('')
  const [courseId, setCourseId] = useState('')

  useEffect(() => {
    const paymentID = searchParams.get('paymentID')
    const bkashStatus = searchParams.get('status')

    // bKash redirects with ?status=success/failure/cancel&paymentID=...
    if (bkashStatus === 'cancel' || bkashStatus === 'failure') {
      setStatus(bkashStatus === 'cancel' ? 'cancelled' : 'failed')
      setMessage(bkashStatus === 'cancel' ? 'পেমেন্ট বাতিল করা হয়েছে' : 'পেমেন্ট ব্যর্থ হয়েছে')
      return
    }

    if (!paymentID) {
      setStatus('failed')
      setMessage('পেমেন্ট তথ্য পাওয়া যায়নি')
      return
    }

    // Execute the payment
    axios.post('/api/payment/execute', { payment_id: paymentID })
      .then(async ({ data }) => {
        setTrxId(data.trx_id)
        setCourseId(data.course_id)
        await refreshUser()
        setStatus('success')
        setMessage(data.message)
      })
      .catch(err => {
        setStatus('failed')
        setMessage(err.response?.data?.error || 'পেমেন্ট যাচাই করতে ব্যর্থ হয়েছে')
      })
  }, [])

  return (
    <div style={s.page}>
      <div style={s.card}>
        {status === 'processing' && (
          <>
            <div style={s.iconWrap}><Loader size={48} color="#e2136e" style={{ animation: 'spin 1s linear infinite' }} /></div>
            <h2 style={s.title}>পেমেন্ট যাচাই হচ্ছে...</h2>
            <p style={s.sub}>অনুগ্রহ করে অপেক্ষা করুন</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={s.iconWrap}><CheckCircle size={52} color="#1e6b3a" /></div>
            <h2 style={{ ...s.title, color: '#1e6b3a' }}>পেমেন্ট সফল! 🌾</h2>
            <p style={s.sub}>কোর্সে ভর্তি সম্পন্ন হয়েছে</p>
            {trxId && <div style={s.receipt}><span>লেনদেন আইডি:</span><code>{trxId}</code></div>}
            <div style={s.actions}>
              {courseId && <Link to={`/courses/${courseId}`} style={s.primaryBtn}>কোর্স শুরু করুন →</Link>}
              <Link to="/my-learning" style={s.secondaryBtn}>আমার কোর্স দেখুন</Link>
            </div>
          </>
        )}

        {(status === 'failed' || status === 'cancelled') && (
          <>
            <div style={s.iconWrap}><XCircle size={52} color="#dc2626" /></div>
            <h2 style={{ ...s.title, color: '#dc2626' }}>
              {status === 'cancelled' ? 'পেমেন্ট বাতিল' : 'পেমেন্ট ব্যর্থ'}
            </h2>
            <p style={{ ...s.sub, background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: 8, padding: '10px 16px' }}>
              {message}
            </p>
            <div style={s.actions}>
              <button onClick={() => navigate(-1)} style={s.primaryBtn}>আবার চেষ্টা করুন</button>
              <Link to="/courses" style={s.secondaryBtn}>কোর্স দেখুন</Link>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const s = {
  page: {
    minHeight: 'calc(100vh - 69px)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--off-white)', padding: 24,
  },
  card: {
    background: 'white', borderRadius: 20, padding: '48px 40px',
    maxWidth: 440, width: '100%', textAlign: 'center',
    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
    border: '1px solid var(--border)',
  },
  iconWrap: { marginBottom: 20 },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 24,
    fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8,
  },
  sub: { fontSize: 15, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 },
  receipt: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#f0faf2', border: '1px solid var(--green-pale)',
    borderRadius: 10, padding: '10px 16px', marginBottom: 24, fontSize: 13,
    color: 'var(--text-secondary)',
  },
  actions: { display: 'flex', flexDirection: 'column', gap: 10 },
  primaryBtn: {
    display: 'block', padding: '13px', borderRadius: 12,
    background: 'linear-gradient(135deg, #2d6a4f, #1e4d2b)',
    color: 'white', fontWeight: 700, fontSize: 15,
    textDecoration: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  secondaryBtn: {
    display: 'block', padding: '11px', borderRadius: 12,
    background: 'var(--off-white)', color: 'var(--text-secondary)',
    fontWeight: 500, fontSize: 14, textDecoration: 'none',
    border: '1.5px solid var(--border)',
  },
}
