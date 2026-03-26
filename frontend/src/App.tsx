import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateExam from './pages/CreateExam';
import ExamAttempt from './pages/ExamAttempt';
import Result from './pages/Result';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student-only */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/exam/:id" element={<ExamAttempt />} />
          </Route>

          {/* Teacher-only */}
          <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/create-exam" element={<CreateExam />} />
          </Route>

          {/* Shared protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/result/:attemptId" element={<Result />} />
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
