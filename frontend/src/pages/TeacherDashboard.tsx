import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import {
  RiAddCircleLine,
  RiBookOpenLine,
  RiTimeLine,
  RiGroupLine,
  RiFileListLine,
  RiCheckboxCircleLine,
  RiDraftLine,
} from 'react-icons/ri';

interface Exam {
  id: string;
  title: string;
  duration: number;
  status: string;
  _count?: { questions: number; attempts: number };
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExams = () => {
    setLoading(true);
    api.get('/exams/my/exams')
      .then((r) => setExams(r.data))
      .catch(() => setError('Failed to load your exams.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExams(); }, []);

  const publishExam = async (id: string) => {
    if (!confirm('Publish this exam? Students will be able to see and attempt it.')) return;
    try {
      await api.patch(`/exams/${id}/publish`);
      fetchExams();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not publish.');
    }
  };

  const statusBadge = (status: string) =>
    status === 'PUBLISHED' ? 'badge-success' : 'badge-muted';

  const statusIcon = (status: string) =>
    status === 'PUBLISHED'
      ? <RiCheckboxCircleLine size={13} />
      : <RiDraftLine size={13} />;

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.2rem' }}>
              My Exams
            </h1>
            <p className="text-muted text-sm">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          <button
            id="create-exam-btn"
            className="btn btn-primary"
            onClick={() => navigate('/teacher/create-exam')}
          >
            <RiAddCircleLine size={16} /> Create Exam
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? <Spinner /> : (
          exams.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <RiFileListLine size={44} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No exams yet</p>
              <p className="text-muted text-sm" style={{ marginBottom: '1.2rem' }}>Create your first exam to get started.</p>
              <button className="btn btn-primary" onClick={() => navigate('/teacher/create-exam')}>
                <RiAddCircleLine size={15} /> Create Exam
              </button>
            </div>
          ) : (
            <div className="grid-2">
              {exams.map((exam) => (
                <div key={exam.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontWeight: 600, fontSize: '1rem' }}>{exam.title}</p>
                    <span className={`badge ${statusBadge(exam.status)}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {statusIcon(exam.status)} {exam.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.2rem' }}>
                    <span className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <RiTimeLine size={13} /> {exam.duration} min
                    </span>
                    {exam._count && (
                      <>
                        <span className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <RiBookOpenLine size={13} /> {exam._count.questions} questions
                        </span>
                        <span className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <RiGroupLine size={13} /> {exam._count.attempts} attempts
                        </span>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button
                      id={`add-questions-${exam.id}`}
                      className="btn btn-ghost text-sm"
                      onClick={() => navigate(`/teacher/create-exam?addTo=${exam.id}`)}
                    >
                      + Add Questions
                    </button>
                    {exam.status !== 'PUBLISHED' && (
                      <button
                        id={`publish-exam-${exam.id}`}
                        className="btn btn-success text-sm"
                        onClick={() => publishExam(exam.id)}
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
