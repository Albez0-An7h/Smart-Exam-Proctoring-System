import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { extractError } from '../api/errorUtils';
import Spinner from '../components/Spinner';
import {
  RiAddCircleLine,
  RiBookOpenLine,
  RiTimeLine,
  RiGroupLine,
  RiFileListLine,
  RiCheckboxCircleLine,
  RiDraftLine,
  RiAlertLine,
} from 'react-icons/ri';
import Modal from '../components/Modal';

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

  // Modals state
  const [publishModalId, setPublishModalId] = useState<string | null>(null);
  const [errorModalMsg, setErrorModalMsg] = useState('');
  const [violationsModalId, setViolationsModalId] = useState<string | null>(null);
  const [violationsData, setViolationsData] = useState<any[]>([]);
  const [loadingViolations, setLoadingViolations] = useState(false);

  const fetchExams = () => {
    setLoading(true);
    api.get('/exams/my/exams')
      .then((r) => setExams(r.data))
      .catch((err: any) => setError(extractError(err, 'Failed to load your exams.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExams(); }, []);

  const publishExam = async () => {
    if (!publishModalId) return;
    try {
      await api.patch(`/exams/${publishModalId}/publish`);
      setPublishModalId(null);
      fetchExams();
    } catch (err: any) {
      setPublishModalId(null);
      setErrorModalMsg(err.response?.data?.error || 'Could not publish.');
    }
  };

  const fetchViolations = async (examId: string) => {
    setViolationsModalId(examId);
    setLoadingViolations(true);
    try {
      const res = await api.get(`/exams/${examId}/violations`);
      setViolationsData(res.data);
    } catch (err: any) {
      setErrorModalMsg(err.response?.data?.error || 'Could not fetch violations.');
      setViolationsModalId(null);
    } finally {
      setLoadingViolations(false);
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
      {/* ── Publish Confirmation Modal ── */}
      <Modal
        open={!!publishModalId}
        variant="confirm"
        title="Publish Exam"
        message="Are you sure you want to publish this exam? Once published, students will be able to see and attempt it."
        confirmLabel="Yes, Publish"
        onConfirm={publishExam}
        onCancel={() => setPublishModalId(null)}
      />

      {/* ── Error Alert Modal ── */}
      <Modal
        open={!!errorModalMsg}
        variant="danger"
        title="Error"
        message={errorModalMsg}
        confirmLabel="OK"
        onConfirm={() => setErrorModalMsg('')}
      />

      {/* ── Violations Modal ── */}
      {violationsModalId && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            animation: 'fadeIn 0.15s ease'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setViolationsModalId(null); }}
        >
          <div style={{
            background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 640,
            maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 56px rgba(0,0,0,0.5)', animation: 'modalSlideIn 0.2s ease'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Proctoring Violations</h2>
              <p className="text-sm text-muted">Tab switches and window blurs recorded during attempts.</p>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {loadingViolations ? <Spinner /> : (
                violationsData.length === 0 ? (
                  <p className="text-muted text-center py-4">No violations recorded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {violationsData.map((v: any) => (
                      <div key={v.attemptId} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{v.studentName}</p>
                          <p className="text-sm text-muted">{v.studentEmail}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge ${v.violationCount > 0 ? 'badge-danger' : 'badge-success'}`}>
                            {v.violationCount > 0 ? 
                              <><RiAlertLine size={12} style={{ marginRight: '4px' }}/> {v.violationCount} Violations</> 
                              : 'Clean Attempt'
                            }
                          </span>
                          <p className="text-sm text-muted" style={{ marginTop: '0.3rem' }}>Score: {v.score}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
              <button className="btn btn-ghost" onClick={() => setViolationsModalId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

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
                        onClick={() => setPublishModalId(exam.id)}
                      >
                        Publish
                      </button>
                    )}
                    {(exam._count?.attempts ?? 0) > 0 && (
                      <button
                        id={`view-violations-${exam.id}`}
                        className="btn btn-ghost text-sm"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => fetchViolations(exam.id)}
                      >
                        <RiAlertLine size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> Violations
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
