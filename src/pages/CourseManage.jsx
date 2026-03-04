import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../contexts/ToastContext'
import { ArrowLeft, Plus, Save, Trash2, Upload, Edit, X, FileText } from 'lucide-react'

const CATEGORIES = ['ফসল উৎপাদন','পশুপালন','মৎস্য চাষ','জৈব চাষ','সেচ ব্যবস্থাপনা','কৃষি রসায়ন','মাটি ব্যবস্থাপনা','বনায়ন','অন্যান্য']
const LEVELS = ['প্রাথমিক','মধ্যবর্তী','উন্নত']

function formatDuration(sec) {
  if (!sec) return ''
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60
  if (h>0) return `${h}ঘ ${m}মি`
  if (m>0) return `${m}মি ${s}সে`
  return `${s} সেকেন্ড`
}

export default function CourseManage() {
  const { courseId } = useParams()
  const isCreate = !courseId
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [courseForm, setCourseForm] = useState({ title:'', description:'', long_description:'', price:0, category:'ফসল উৎপাদন', level:'প্রাথমিক', tags:'' })
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [lessons, setLessons] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isCreate)
  const [activeTab, setActiveTab] = useState('info')
  const [newLesson, setNewLesson] = useState({ title:'', description:'' })
  const [lessonVideo, setLessonVideo] = useState(null)
  const [lessonNote, setLessonNote] = useState(null)
  const [addingLesson, setAddingLesson] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [savedCourseId, setSavedCourseId] = useState(courseId)

  useEffect(() => { if (!isCreate && courseId) loadCourse() }, [courseId])

  const loadCourse = async () => {
    try {
      const { data } = await axios.get(`/api/courses/${courseId}`)
      setCourseForm({ title:data.title, description:data.description, long_description:data.long_description||'', price:data.price, category:data.category||'ফসল উৎপাদন', level:data.level||'প্রাথমিক', tags:data.tags?.join(', ')||'' })
      if (data.thumbnail) setThumbnailPreview(data.thumbnail)
      const lessonsResp = await axios.get(`/api/lessons/course/${courseId}`)
      setLessons(lessonsResp.data)
    } catch (err) {
      showToast(err.response?.data?.error || 'কোর্স লোড করতে সমস্যা হয়েছে', 'error')
    } finally { setLoading(false) }
  }

  const saveCourse = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(courseForm).forEach(([k,v]) => fd.append(k,v))
      if (thumbnail) fd.append('thumbnail', thumbnail)
      let id = savedCourseId
      if (isCreate || !savedCourseId) {
        const { data } = await axios.post('/api/courses/', fd)
        id = data.id; setSavedCourseId(id)
        showToast('কোর্স তৈরি হয়েছে! 🌾', 'success')
        setActiveTab('lessons')
      } else {
        await axios.put(`/api/courses/${savedCourseId}`, fd)
        showToast('কোর্স আপডেট হয়েছে!', 'success')
        loadCourse()
      }
      return id
    } catch (err) { showToast(err.response?.data?.error || 'সংরক্ষণ করতে সমস্যা', 'error') }
    finally { setSaving(false) }
  }

  const addLesson = async () => {
    if (!savedCourseId) { showToast('আগে কোর্স সংরক্ষণ করুন', 'error'); return }
    if (!newLesson.title) { showToast('পাঠের শিরোনাম দিন', 'error'); return }
    setAddingLesson(true)
    try {
      const fd = new FormData()
      fd.append('title', newLesson.title); fd.append('description', newLesson.description)
      if (lessonVideo) fd.append('video', lessonVideo)
      if (lessonNote) fd.append('note', lessonNote)
      await axios.post(`/api/lessons/course/${savedCourseId}`, fd)
      showToast('পাঠ যোগ হয়েছে!', 'success')
      setNewLesson({ title:'', description:'' }); setLessonVideo(null); setLessonNote(null)
      const lessonsResp = await axios.get(`/api/lessons/course/${savedCourseId}`)
      setLessons(lessonsResp.data)
    } catch (err) { showToast(err.response?.data?.error || 'পাঠ যোগ করতে সমস্যা', 'error') }
    finally { setAddingLesson(false) }
  }

  const deleteLesson = async (lessonId) => {
    if (!confirm('এই পাঠ মুছে ফেলবেন?')) return
    try {
      await axios.delete(`/api/lessons/${lessonId}`)
      setLessons(prev => prev.filter(l => l.id !== lessonId))
      showToast('পাঠ মুছে ফেলা হয়েছে', 'success')
    } catch (err) { showToast(err.response?.data?.error || 'মুছতে সমস্যা হয়েছে', 'error') }
  }

  const updateLesson = async (lessonId, fd) => {
    try {
      await axios.put(`/api/lessons/${lessonId}`, fd)
      showToast('পাঠ আপডেট হয়েছে!', 'success')
      setEditingLesson(null)
      const lessonsResp = await axios.get(`/api/lessons/course/${savedCourseId}`)
      setLessons(lessonsResp.data)
    } catch (err) { showToast(err.response?.data?.error || 'আপডেট করতে সমস্যা হয়েছে', 'error') }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 69px)' }}>
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link to="/instructor" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--green-main)', textDecoration: 'none', marginBottom: 10, fontWeight: 500 }}>
            <ArrowLeft size={13} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="page-title">{isCreate ? '🌱 নতুন কোর্স তৈরি' : '✏️ কোর্স সম্পাদনা'}</h1>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'1px solid var(--border)', paddingBottom:1 }}>
          {[{id:'info',label:'📋 কোর্সের তথ্য'},{id:'lessons',label:'🎬 পাঠ'}].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding:'10px 20px', background:'none', border:'none', borderBottom: activeTab===tab.id ? '2px solid var(--green-main)' : '2px solid transparent', fontSize:14, fontWeight:600, color: activeTab===tab.id ? 'var(--green-dark)' : 'var(--text-muted)', cursor:'pointer', marginBottom:-1, transition:'all 0.2s', fontFamily:'var(--font-body)', display:'flex', alignItems:'center', gap:6 }}>
              {tab.label}
              {tab.id==='lessons' && savedCourseId && <span style={{ background:'var(--green-main)', color:'white', borderRadius:100, padding:'1px 7px', fontSize:11 }}>{lessons.length}</span>}
            </button>
          ))}
        </div>

        {/* Info Tab */}
        {activeTab==='info' && (
          <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:32 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:40 }}>
              <div>
                <div className="form-group">
                  <label className="form-label">কোর্সের শিরোনাম *</label>
                  <input className="form-input" value={courseForm.title} onChange={e => setCourseForm({...courseForm,title:e.target.value})} placeholder="যেমন: আধুনিক ধান চাষ পদ্ধতি" />
                </div>
                <div className="form-group">
                  <label className="form-label">সংক্ষিপ্ত বিবরণ *</label>
                  <textarea className="form-input" rows={3} value={courseForm.description} onChange={e => setCourseForm({...courseForm,description:e.target.value})} placeholder="কোর্সের সংক্ষিপ্ত পরিচয়..." />
                </div>
                <div className="form-group">
                  <label className="form-label">বিস্তারিত বিবরণ</label>
                  <textarea className="form-input" rows={6} value={courseForm.long_description} onChange={e => setCourseForm({...courseForm,long_description:e.target.value})} placeholder="কোর্স সম্পর্কে বিস্তারিত লিখুন..." />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
                  <div className="form-group">
                    <label className="form-label">মূল্য (৳)</label>
                    <input className="form-input" type="number" min="0" value={courseForm.price} onChange={e => setCourseForm({...courseForm,price:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">বিষয়</label>
                    <select className="form-input" value={courseForm.category} onChange={e => setCourseForm({...courseForm,category:e.target.value})}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">স্তর</label>
                    <select className="form-input" value={courseForm.level} onChange={e => setCourseForm({...courseForm,level:e.target.value})}>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">ট্যাগ (কমা দিয়ে আলাদা করুন)</label>
                  <input className="form-input" value={courseForm.tags} onChange={e => setCourseForm({...courseForm,tags:e.target.value})} placeholder="ধান, সার, আধুনিক পদ্ধতি" />
                </div>
              </div>
              <div>
                <div className="form-group">
                  <label className="form-label">থাম্বনেইল ছবি</label>
                  <div onClick={() => document.getElementById('thumb-input').click()}
                    style={{ border:'2px dashed var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden', cursor:'pointer', minHeight:180, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--off-white)' }}>
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} style={{ width:'100%', height:180, objectFit:'cover' }} />
                    ) : (
                      <div style={{ textAlign:'center', padding:24 }}>
                        <div style={{ fontSize:36, marginBottom:8 }}>🖼️</div>
                        <span style={{ fontSize:13, color:'var(--text-muted)' }}>থাম্বনেইল আপলোড করুন</span>
                      </div>
                    )}
                    <input id="thumb-input" type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f=e.target.files[0]; if(f){ setThumbnail(f); setThumbnailPreview(URL.createObjectURL(f)) } }} />
                  </div>
                </div>
                <div style={{ background:'var(--green-ultra)', border:'1px solid var(--green-pale)', borderRadius:'var(--radius-sm)', padding:'14px 16px', marginTop:8 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>বর্তমান মূল্য</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--green-dark)', marginTop:4 }}>
                    {courseForm.price==0 ? '🎁 বিনামূল্যে' : `৳${courseForm.price}`}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, paddingTop:24, borderTop:'1px solid var(--border-light)', marginTop:24 }}>
              <button className="btn btn-primary" onClick={saveCourse} disabled={saving} style={{ padding:'10px 28px' }}>
                <Save size={15} /> {saving ? 'সংরক্ষণ হচ্ছে...' : isCreate && !savedCourseId ? '🌾 তৈরি করুন' : 'সংরক্ষণ করুন'}
              </button>
              {savedCourseId && <button className="btn btn-secondary" onClick={() => setActiveTab('lessons')}>পাঠ যোগ করুন →</button>}
            </div>
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab==='lessons' && (
          !savedCourseId ? (
            <div style={{ background:'var(--warning-light)', border:'1px solid #fde68a', borderRadius:'var(--radius-lg)', padding:32, textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
              <p style={{ color:'var(--warning)', fontWeight:500 }}>আগে কোর্সের তথ্য সংরক্ষণ করুন</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('info')} style={{ marginTop:16 }}>← কোর্সের তথ্যে যান</button>
            </div>
          ) : (
            <>
              {/* Add Lesson */}
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:24, marginBottom:20 }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, marginBottom:16, color:'var(--text-primary)' }}>➕ নতুন পাঠ যোগ করুন</h3>
                <div style={{ display:'flex', gap:20, marginBottom:16 }}>
                  <div style={{ flex:1 }}>
                    <div className="form-group">
                      <label className="form-label">পাঠের শিরোনাম *</label>
                      <input className="form-input" value={newLesson.title} onChange={e => setNewLesson({...newLesson,title:e.target.value})} placeholder="যেমন: সার প্রয়োগের সঠিক পদ্ধতি" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">বিবরণ</label>
                      <textarea className="form-input" rows={2} value={newLesson.description} onChange={e => setNewLesson({...newLesson,description:e.target.value})} placeholder="পাঠে কী শেখানো হবে?" />
                    </div>
                  </div>
                  <div style={{ width:280, flexShrink:0 }}>
                    <div className="form-group">
                      <label className="form-label">ভিডিও আপলোড</label>
                      <label style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', border:'1.5px dashed var(--border)', borderRadius:8, fontSize:13, color:'var(--text-muted)', cursor:'pointer', background:'var(--off-white)' }}>
                        <Upload size={13} /> {lessonVideo ? lessonVideo.name : '🎬 ভিডিও বেছে নিন'}
                        <input type="file" accept="video/*" style={{ display:'none' }} onChange={e => setLessonVideo(e.target.files[0])} />
                      </label>
                      <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>⏱ ভিডিওর দৈর্ঘ্য স্বয়ংক্রিয়ভাবে নির্ধারিত হবে · যেকোনো সাইজ সমর্থিত</p>
                    </div>
                    <div className="form-group">
                      <label className="form-label">নোট / রিসোর্স</label>
                      <label style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', border:'1.5px dashed var(--border)', borderRadius:8, fontSize:13, color:'var(--text-muted)', cursor:'pointer', background:'var(--off-white)' }}>
                        <FileText size={13} /> {lessonNote ? lessonNote.name : '📄 ফাইল আপলোড (PDF...)'}
                        <input type="file" style={{ display:'none' }} onChange={e => setLessonNote(e.target.files[0])} />
                      </label>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={addLesson} disabled={addingLesson}>
                  <Plus size={14} /> {addingLesson ? 'যোগ হচ্ছে...' : 'পাঠ যোগ করুন'}
                </button>
              </div>

              {/* Lesson List */}
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:24 }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, marginBottom:16, color:'var(--text-primary)' }}>📚 পাঠসমূহ ({lessons.length})</h3>
                {lessons.length===0 ? (
                  <div style={{ textAlign:'center', padding:32, color:'var(--text-muted)', fontSize:14 }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>📝</div>
                    এখনো কোনো পাঠ নেই। উপরে যোগ করুন!
                  </div>
                ) : lessons.map((lesson, i) => (
                  <div key={lesson.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', border:'1px solid var(--border-light)', borderRadius:'var(--radius-sm)', marginBottom:8, background:'var(--off-white)' }}>
                    {editingLesson===lesson.id ? (
                      <EditLessonForm lesson={lesson} onSave={updateLesson} onCancel={() => setEditingLesson(null)} />
                    ) : (
                      <>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--green-pale)', color:'var(--green-dark)', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>
                            {lesson.title}
                            {i===0 && <span style={{ marginLeft:8, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:100, background:'var(--green-pale)', color:'var(--green-dark)' }}>বিনামূল্যে প্রিভিউ</span>}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:12, color:'var(--text-muted)', marginTop:3 }}>
                            {lesson.has_video && <span>🎬 ভিডিও আছে</span>}
                            {lesson.duration>0 && <span>⏱ {formatDuration(lesson.duration)}</span>}
                            {lesson.has_note && <span>📄 {lesson.note_filename}</span>}
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => setEditingLesson(lesson.id)} className="btn btn-secondary" style={{ padding:'6px 12px', fontSize:12 }}><Edit size={11} /> সম্পাদনা</button>
                          <button onClick={() => deleteLesson(lesson.id)} className="btn btn-danger" style={{ padding:'6px 10px', fontSize:12 }}><Trash2 size={11} /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}

function EditLessonForm({ lesson, onSave, onCancel }) {
  const [form, setForm] = useState({ title:lesson.title, description:lesson.description||'' })
  const [video, setVideo] = useState(null)
  const [note, setNote] = useState(null)
  const handleSave = () => {
    const fd = new FormData()
    fd.append('title', form.title); fd.append('description', form.description)
    if (video) fd.append('video', video); if (note) fd.append('note', note)
    onSave(lesson.id, fd)
  }
  return (
    <div style={{ flex:1, background:'var(--green-ultra)', borderRadius:8, padding:14 }}>
      <div className="form-group" style={{ marginBottom:10 }}>
        <input className="form-input" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="পাঠের শিরোনাম" style={{ fontSize:14 }} />
      </div>
      <div style={{ display:'flex', gap:14, marginBottom:10 }}>
        <label style={{ fontSize:12, color:'var(--green-main)', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
          <Upload size={12} /> {video ? video.name : 'ভিডিও পরিবর্তন'}
          <input type="file" accept="video/*" style={{ display:'none' }} onChange={e => setVideo(e.target.files[0])} />
        </label>
        <label style={{ fontSize:12, color:'var(--green-main)', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
          <FileText size={12} /> {note ? note.name : 'নোট পরিবর্তন'}
          <input type="file" style={{ display:'none' }} onChange={e => setNote(e.target.files[0])} />
        </label>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-primary" onClick={handleSave} style={{ padding:'6px 14px', fontSize:12 }}><Save size={11} /> সংরক্ষণ</button>
        <button className="btn btn-secondary" onClick={onCancel} style={{ padding:'6px 12px', fontSize:12 }}><X size={11} /> বাতিল</button>
      </div>
    </div>
  )
}
