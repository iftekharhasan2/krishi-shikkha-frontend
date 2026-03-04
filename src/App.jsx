import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { LoginPage, RegisterPage } from './pages/Auth'
import CoursesPage from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import LessonPlayer from './pages/LessonPlayer'
import Profile from './pages/Profile'
import { MyLearning } from './pages/MyLearning'
import InstructorDashboard from './pages/InstructorDashboard'
import CourseManage from './pages/CourseManage'
import AdminPanel from './pages/AdminPanel'
import PaymentCallback from './pages/PaymentCallback'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/lesson/:lessonId" element={<ProtectedRoute><LessonPlayer /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/my-learning" element={<ProtectedRoute roles={['student']}><MyLearning /></ProtectedRoute>} />
        <Route path="/instructor" element={<ProtectedRoute roles={['instructor','admin']}><InstructorDashboard /></ProtectedRoute>} />
        <Route path="/instructor/create-course" element={<ProtectedRoute roles={['instructor','admin']}><CourseManage /></ProtectedRoute>} />
        <Route path="/instructor/course/:courseId" element={<ProtectedRoute roles={['instructor','admin']}><CourseManage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
        <Route path="/payment/callback" element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
