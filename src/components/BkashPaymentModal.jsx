import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { X, Smartphone, CheckCircle, Loader, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'

// ── Step constants ────────────────────────────────────────────────
const STEP = {
  CONFIRM: 'confirm',
  PHONE: 'phone',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
}

export default function BkashPaymentModal({ course, onClose, onSuccess }) {
  const { showToast } = useToast()
  const { refreshUser } = useAuth()
  const [step, setStep] = useState(STEP.CONFIRM)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [invoiceId, setInvoiceId] = useState(null)
  const [paymentId, setPaymentId] = useState(null)
  const [trxId, setTrxId] = useState(null)
  const [bkashUrl, setBkashUrl] = useState(null)
  const [isDemo, setIsDemo] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const validatePhone = (val) => {
    if (!val) return 'bKash নম্বর দিন'
    if (!/^01[3-9]\d{8}$/.test(val)) return 'সঠিক বাংলাদেশি নম্বর দিন (01XXXXXXXXX)'
    return ''
  }

  // ── Step 1: Create payment ──────────────────────────────────────
  const handleConfirm = async () => {
    setStep(STEP.PROCESSING)
    try {
      const { data } = await axios.post('/api/payment/create', { course_id: course.id })

      if (data.demo_mode) {
        setIsDemo(true)
        setInvoiceId(data.invoice_id)
        setStep(STEP.PHONE)
        return
      }

      setInvoiceId(data.invoice_id)
      setPaymentId(data.payment_id)

      if (data.bkash_url) {
        // Real bKash → open in popup
        setBkashUrl(data.bkash_url)
        const popup = window.open(data.bkash_url, 'bKash Payment', 'width=500,height=600')
        setStep(STEP.PHONE)

        // Poll for popup close then execute
        const poll = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(poll)
            executePayment(data.payment_id)
          }
        }, 1000)
      } else {
        setStep(STEP.PHONE)
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'পেমেন্ট শুরু করতে সমস্যা হয়েছে')
      setStep(STEP.ERROR)
    }
  }

  // ── Step 2a: Execute real bKash payment ─────────────────────────
  const executePayment = async (pid) => {
    setStep(STEP.PROCESSING)
    try {
      const { data } = await axios.post('/api/payment/execute', { payment_id: pid })
      setTrxId(data.trx_id)
      await refreshUser()
      setStep(STEP.SUCCESS)
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'পেমেন্ট যাচাই করতে ব্যর্থ হয়েছে')
      setStep(STEP.ERROR)
    }
  }

  // ── Step 2b: Demo mode — submit phone ───────────────────────────
  const handleDemoSubmit = async () => {
    const err = validatePhone(phone)
    if (err) { setPhoneError(err); return }
    setPhoneError('')
    setStep(STEP.PROCESSING)

    try {
      const { data } = await axios.post('/api/payment/demo-complete', {
        invoice_id: invoiceId,
        phone
      })
      setTrxId(data.trx_id)
      await refreshUser()
      setStep(STEP.SUCCESS)
    } catch (err2) {
      setErrorMsg(err2.response?.data?.error || 'পেমেন্ট ব্যর্থ হয়েছে')
      setStep(STEP.ERROR)
    }
  }

  const handleSuccess = () => {
    showToast('🌾 কোর্সে সফলভাবে ভর্তি হয়েছেন!', 'success')
    onSuccess?.()
    onClose()
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && step !== STEP.PROCESSING && onClose()}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.bkashLogo}>
              <span style={s.bkashB}>b</span>
              <span style={s.bkashK}>K</span>
              <span style={s.bkashRest}>ash</span>
            </div>
            <span style={s.headerSub}>নিরাপদ পেমেন্ট</span>
          </div>
          {step !== STEP.PROCESSING && (
            <button style={s.closeBtn} onClick={onClose}><X size={18} /></button>
          )}
        </div>

        {/* Course info strip */}
        <div style={s.courseStrip}>
          <div style={s.courseThumb}>
            {course.thumbnail
              ? <img src={course.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <span style={{ fontSize: 22 }}>🌾</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.courseTitle}>{course.title}</div>
            <div style={s.courseInstructor}>{course.instructor_name}</div>
          </div>
          <div style={s.coursePrice}>৳{course.price}</div>
        </div>

        {/* ── STEP: CONFIRM ── */}
        {step === STEP.CONFIRM && (
          <div style={s.body}>
            <div style={s.amountBox}>
              <div style={s.amountLabel}>পরিশোধযোগ্য পরিমাণ</div>
              <div style={s.amount}>৳{course.price}</div>
              <div style={s.amountNote}>বাংলাদেশি টাকা (BDT)</div>
            </div>

            <div style={s.infoGrid}>
              {[
                ['📋 কোর্স', course.title],
                ['👨‍🌾 শিক্ষক', course.instructor_name],
                ['💳 পেমেন্ট', 'bKash Merchant'],
              ].map(([label, val]) => (
                <div key={label} style={s.infoRow}>
                  <span style={s.infoLabel}>{label}</span>
                  <span style={s.infoVal}>{val}</span>
                </div>
              ))}
            </div>

            <div style={s.secureNote}>
              <ShieldCheck size={14} color="#e2136e" />
              <span>bKash Merchant Payment দ্বারা সুরক্ষিত</span>
            </div>

            <button style={s.payBtn} onClick={handleConfirm}>
              <span style={s.payBtnText}>bKash দিয়ে পেমেন্ট করুন</span>
              <ArrowRight size={16} />
            </button>
            <button style={s.cancelBtn} onClick={onClose}>বাতিল করুন</button>
          </div>
        )}

        {/* ── STEP: PHONE (demo mode) ── */}
        {step === STEP.PHONE && isDemo && (
          <div style={s.body}>
            <div style={s.demoTag}>🧪 ডেমো মোড — বাস্তব টাকা কাটবে না</div>

            <div style={s.phoneSection}>
              <div style={s.phoneIconWrap}>
                <Smartphone size={28} color="#e2136e" />
              </div>
              <div style={s.phoneTitle}>আপনার bKash নম্বর দিন</div>
              <div style={s.phoneSubtitle}>ডেমো মোডে পেমেন্ট যাচাই করতে নম্বর দিন</div>

              <div style={s.phoneInputWrap}>
                <span style={s.phonePrefix}>+88</span>
                <input
                  style={{ ...s.phoneInput, ...(phoneError ? s.phoneInputError : {}) }}
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  maxLength={11}
                  onChange={e => {
                    setPhone(e.target.value.replace(/\D/g, ''))
                    setPhoneError('')
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleDemoSubmit()}
                  autoFocus
                />
              </div>
              {phoneError && <div style={s.fieldError}><AlertCircle size={12} /> {phoneError}</div>}
              <div style={s.phoneHint}>যেকোনো বৈধ বাংলাদেশি মোবাইল নম্বর</div>
            </div>

            <button style={s.payBtn} onClick={handleDemoSubmit}>
              <span style={s.payBtnText}>পেমেন্ট নিশ্চিত করুন</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP: PHONE (real bKash, waiting for popup) ── */}
        {step === STEP.PHONE && !isDemo && (
          <div style={s.body}>
            <div style={s.waitingSection}>
              <div style={s.waitingAnim}>
                <div style={s.pingRing} />
                <Smartphone size={28} color="#e2136e" />
              </div>
              <div style={s.waitingTitle}>bKash পেজ খোলা হয়েছে</div>
              <div style={s.waitingSubtitle}>
                পপআপে bKash পেমেন্ট সম্পন্ন করুন। উইন্ডো বন্ধ হলে স্বয়ংক্রিয়ভাবে যাচাই হবে।
              </div>
              {bkashUrl && (
                <a href={bkashUrl} target="_blank" rel="noreferrer" style={s.openAgainBtn}>
                  পেজ আবার খুলুন
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── STEP: PROCESSING ── */}
        {step === STEP.PROCESSING && (
          <div style={s.body}>
            <div style={s.processingSection}>
              <div style={s.spinnerWrap}>
                <Loader size={36} color="#e2136e" style={s.spinner} />
              </div>
              <div style={s.processingTitle}>পেমেন্ট প্রক্রিয়া চলছে...</div>
              <div style={s.processingSubtitle}>অনুগ্রহ করে অপেক্ষা করুন</div>
              <div style={s.processingDots}>
                <span style={{ ...s.dot, animationDelay: '0s' }} />
                <span style={{ ...s.dot, animationDelay: '0.2s' }} />
                <span style={{ ...s.dot, animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === STEP.SUCCESS && (
          <div style={s.body}>
            <div style={s.successSection}>
              <div style={s.successIcon}>
                <CheckCircle size={52} color="#1e6b3a" strokeWidth={1.5} />
              </div>
              <div style={s.successTitle}>পেমেন্ট সফল! 🌾</div>
              <div style={s.successSubtitle}>কোর্সে ভর্তি সম্পন্ন হয়েছে</div>

              <div style={s.receiptBox}>
                {[
                  ['ইনভয়েস', invoiceId],
                  ['লেনদেন আইডি', trxId],
                  ['পরিমাণ', `৳${course.price}`],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={s.receiptRow}>
                    <span style={s.receiptLabel}>{lbl}</span>
                    <span style={s.receiptVal}>{val || '—'}</span>
                  </div>
                ))}
              </div>

              <button style={s.successBtn} onClick={handleSuccess}>
                কোর্স শুরু করুন →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: ERROR ── */}
        {step === STEP.ERROR && (
          <div style={s.body}>
            <div style={s.errorSection}>
              <div style={s.errorIcon}>
                <AlertCircle size={48} color="#dc2626" strokeWidth={1.5} />
              </div>
              <div style={s.errorTitle}>পেমেন্ট ব্যর্থ হয়েছে</div>
              <div style={s.errorMsg}>{errorMsg}</div>
              <button style={s.retryBtn} onClick={() => { setStep(STEP.CONFIRM); setErrorMsg('') }}>
                আবার চেষ্টা করুন
              </button>
              <button style={s.cancelBtn} onClick={onClose}>বাতিল করুন</button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={s.footer}>
          <ShieldCheck size={12} color="#9ca3af" />
          <span>SSL এনক্রিপ্টেড · bKash Merchant · নিরাপদ লেনদেন</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.5); opacity:0.4; } }
        @keyframes ping { 0% { transform: scale(1); opacity:0.8; } 100% { transform: scale(2.2); opacity:0; } }
        @keyframes dotBounce { 0%,80%,100% { transform: scale(0); opacity:0.3; } 40% { transform: scale(1); opacity:1; } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
    animation: 'fadeSlideUp 0.2s ease',
  },
  modal: {
    background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420,
    overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
    animation: 'fadeSlideUp 0.25s ease',
  },
  header: {
    background: 'linear-gradient(135deg, #e2136e 0%, #c0005a 100%)',
    padding: '18px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
  bkashLogo: { display: 'flex', alignItems: 'baseline', gap: 0 },
  bkashB: { fontSize: 24, fontWeight: 900, color: '#fff', fontStyle: 'italic', letterSpacing: '-1px' },
  bkashK: { fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-1px' },
  bkashRest: { fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '1px' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.5px', fontWeight: 500 },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
    width: 32, height: 32, borderRadius: '50%', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  },
  courseStrip: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
    background: '#fdf2f8', borderBottom: '1px solid #fce7f3',
  },
  courseThumb: {
    width: 44, height: 44, borderRadius: 10, overflow: 'hidden',
    background: '#f9e8f2', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  courseTitle: { fontSize: 13, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3, marginBottom: 2 },
  courseInstructor: { fontSize: 11, color: '#6b7280' },
  coursePrice: { fontSize: 18, fontWeight: 800, color: '#e2136e', flexShrink: 0 },
  body: { padding: '20px 20px 16px' },
  amountBox: {
    textAlign: 'center', padding: '20px 0 16px',
    borderBottom: '1px dashed #f0d0e4', marginBottom: 16,
  },
  amountLabel: { fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  amount: { fontSize: 40, fontWeight: 800, color: '#e2136e', lineHeight: 1 },
  amountNote: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  infoGrid: { marginBottom: 14 },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '7px 0', borderBottom: '1px solid #fce7f3', fontSize: 13,
  },
  infoLabel: { color: '#6b7280', fontWeight: 500 },
  infoVal: { color: '#1a1a1a', fontWeight: 600, textAlign: 'right', maxWidth: 200, fontSize: 12 },
  secureNote: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, color: '#9ca3af', justifyContent: 'center', marginBottom: 16,
  },
  payBtn: {
    width: '100%', padding: '14px 20px', marginBottom: 8,
    background: 'linear-gradient(135deg, #e2136e 0%, #c0005a 100%)',
    color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
    fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    boxShadow: '0 4px 16px rgba(226,19,110,0.35)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  payBtnText: { fontFamily: 'var(--font-body)' },
  cancelBtn: {
    width: '100%', padding: '10px', background: 'none', border: '1.5px solid #e5e7eb',
    borderRadius: 10, cursor: 'pointer', fontSize: 13, color: '#6b7280',
    fontFamily: 'var(--font-body)',
  },
  demoTag: {
    background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8,
    padding: '8px 14px', fontSize: 12, color: '#92400e', textAlign: 'center',
    marginBottom: 18, fontWeight: 600,
  },
  phoneSection: { textAlign: 'center' },
  phoneIconWrap: {
    width: 64, height: 64, borderRadius: '50%', background: '#fdf2f8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px',
  },
  phoneTitle: { fontSize: 17, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 },
  phoneSubtitle: { fontSize: 13, color: '#6b7280', marginBottom: 18, lineHeight: 1.5 },
  phoneInputWrap: {
    display: 'flex', alignItems: 'center', gap: 0,
    border: '2px solid #e2136e', borderRadius: 12, overflow: 'hidden',
    marginBottom: 6,
  },
  phonePrefix: {
    padding: '12px 12px', fontSize: 14, color: '#e2136e',
    fontWeight: 700, background: '#fdf2f8', borderRight: '2px solid #e2136e', flexShrink: 0,
  },
  phoneInput: {
    flex: 1, padding: '12px 14px', border: 'none', outline: 'none',
    fontSize: 16, fontWeight: 600, color: '#1a1a1a', letterSpacing: '2px',
    fontFamily: 'monospace', background: '#fff',
  },
  phoneInputError: { background: '#fff5f5' },
  fieldError: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, color: '#dc2626', marginBottom: 6,
  },
  phoneHint: { fontSize: 11, color: '#9ca3af', marginBottom: 18 },
  waitingSection: { textAlign: 'center', padding: '16px 0' },
  waitingAnim: {
    width: 72, height: 72, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', position: 'relative', background: '#fdf2f8',
  },
  pingRing: {
    position: 'absolute', inset: -4, borderRadius: '50%',
    border: '2px solid #e2136e', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
  },
  waitingTitle: { fontSize: 17, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 },
  waitingSubtitle: { fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 16 },
  openAgainBtn: {
    display: 'inline-block', padding: '8px 18px',
    background: '#fdf2f8', color: '#e2136e', borderRadius: 8,
    fontSize: 13, fontWeight: 600, textDecoration: 'none',
    border: '1.5px solid #fce7f3',
  },
  processingSection: { textAlign: 'center', padding: '24px 0' },
  spinnerWrap: { marginBottom: 16 },
  spinner: { animation: 'spin 0.9s linear infinite' },
  processingTitle: { fontSize: 17, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 },
  processingSubtitle: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  processingDots: { display: 'flex', justifyContent: 'center', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: '50%', background: '#e2136e',
    display: 'inline-block', animation: 'dotBounce 1.2s infinite ease-in-out',
  },
  successSection: { textAlign: 'center', padding: '8px 0' },
  successIcon: { marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: 800, color: '#1e6b3a', marginBottom: 6 },
  successSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 18 },
  receiptBox: {
    background: '#f0faf2', border: '1px solid #d8f3dc',
    borderRadius: 12, padding: '14px 18px', marginBottom: 18, textAlign: 'left',
  },
  receiptRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '5px 0', fontSize: 13,
    borderBottom: '1px solid #d8f3dc',
  },
  receiptLabel: { color: '#6b7280', fontWeight: 500 },
  receiptVal: { color: '#1a2e1a', fontWeight: 700, fontFamily: 'monospace', fontSize: 12 },
  successBtn: {
    width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2d6a4f, #1e4d2b)',
    color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
    fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
  },
  errorSection: { textAlign: 'center', padding: '16px 0' },
  errorIcon: { marginBottom: 12 },
  errorTitle: { fontSize: 18, fontWeight: 700, color: '#dc2626', marginBottom: 8 },
  errorMsg: {
    fontSize: 14, color: '#6b7280', marginBottom: 20,
    background: '#fff5f5', border: '1px solid #fee2e2',
    borderRadius: 8, padding: '10px 14px', lineHeight: 1.5,
  },
  retryBtn: {
    width: '100%', padding: '12px', marginBottom: 8,
    background: '#e2136e', color: '#fff', border: 'none',
    borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700,
    fontFamily: 'var(--font-body)',
  },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    padding: '10px 20px', background: '#f9fafb',
    borderTop: '1px solid #f3f4f6', fontSize: 11, color: '#9ca3af',
  },
}
