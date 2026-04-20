import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { extractError } from '../api/errorUtils';
import Spinner from '../components/Spinner';
import {
  RiTimeLine,
  RiFileListLine,
  RiTrophyLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri';

interface Exam {
  id: string;
  title: string;
  duration: number;
  status: string;
  startTime?: string;
  endTime?: string;
  teacher?: { name: string };
}

interface Attempt {
  id: string;
  status: string;
  totalScore: number;
  startTime: string;
  exam: { title: string };
  examId?: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'exams' | 'history'>('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [history, setHistory] = useState<Attempt[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  // Track which exam IDs the student has already finished
  const [attemptedExamIds, setAttemptedExamIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load exams and history in parallel so we can disable already-attempted exams immediately
    setLoadingExams(true);
    Promise.all([
      api.get('/exams'),
      api.get('/attempts/history'),
    ])
      .then(([examsRes, historyRes]) => {
        setExams(examsRes.data);
        const hist: Attempt[] = historyRes.data;
        setHistory(hist);
        const finished = new Set(
          hist
            .filter((a) => ['SUBMITTED', 'AUTO_SUBMITTED', 'EVALUATED'].includes(a.status))
            .map((a) => a.examId!)
            .filter(Boolean)
        );
        setAttemptedExamIds(finished);
      })
      .catch((err: any) => setError(extractError(err, 'Failed to load data.')))
      .finally(() => setLoadingExams(false));
  }, []);

  const loadHistory = () => {
    if (history.length) return;
    setLoadingHistory(true);
    api.get('/attempts/history')
      .then((r) => {
        setHistory(r.data);
      })
      .catch((err: any) => setError(extractError(err, 'Failed to load history.')))
      .finally(() => setLoadingHistory(false));
  };

  const handleTabChange = (t: 'exams' | 'history') => {
    setTab(t);
    if (t === 'history') loadHistory();
  };

  const startExam = async (examId: string) => {
    try {
      const res = await api.post(`/exams/${examId}/start`);
      navigate(`/exam/${examId}?attemptId=${res.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not start exam.');
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      EVALUATED: 'badge-success',
      SUBMITTED: 'badge-accent',
      AUTO_SUBMITTED: 'badge-warning',
      IN_PROGRESS: 'badge-warning',
    };
    return map[status] || 'badge-muted';
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Hey, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Ready for your next exam?</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Tab bar */}
        <div className="tab-bar">
          <button
            id="tab-exams"
            className={`tab-btn ${tab === 'exams' ? 'active' : ''}`}
            onClick={() => handleTabChange('exams')}
          >
            Available Exams
          </button>
          <button
            id="tab-history"
            className={`tab-btn ${tab === 'history' ? 'active' : ''}`}
            onClick={() => handleTabChange('history')}
          >
            My History
          </button>
        </div>

        {/* Available Exams */}
        {tab === 'exams' && (
          <>
            {loadingExams ? <Spinner /> : (
              exams.length === 0 ? (
                <div className="empty-state">
                  <RiFileListLine size={36} />
                  <p>No published exams available right now.</p>
                </div>
              ) : (
                <div className="grid-2">
                  {exams.map((exam) => {
                    const attempted = attemptedExamIds.has(exam.id);
                    return (
                      <div key={exam.id} className="exam-card">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <p className="exam-card-title">{exam.title}</p>
                          {attempted ? (
                            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <RiCheckboxCircleLine size={11} /> Attempted
                            </span>
                          ) : (
                            <span className="badge badge-accent">Live</span>
                          )}
                        </div>
                        {exam.teacher && (
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>by {exam.teacher.name}</p>
                        )}
                        <div className="exam-meta">
                          <span><RiTimeLine size={12} /> {exam.duration} min</span>
                          {exam.startTime && (
                            <span><RiCalendarLine size={12} /> {new Date(exam.startTime).toLocaleDateString()}</span>
                          )}
                        </div>
                        {attempted ? (
                          <p style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <RiCheckboxCircleLine size={13} /> You have already submitted this exam.
                          </p>
                        ) : (
                          <button
                            id={`start-exam-${exam.id}`}
                            className="btn btn-primary"
                            style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}
                            onClick={() => startExam(exam.id)}
                          >
                            Start →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </>
        )}

        {/* History */}
        {tab === 'history' && (
          <>
            {loadingHistory ? <Spinner /> : (
              history.length === 0 ? (
                <div className="empty-state">
                  <RiTrophyLine size={36} />
                  <p>You haven't attempted any exams yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {history.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="card"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.2rem' }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{attempt.exam?.title || 'Exam'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.15rem' }}>
                          {new Date(attempt.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge ${statusBadge(attempt.status)}`}>{attempt.status.replace('_', ' ')}</span>
                        {attempt.status === 'EVALUATED' && (
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)' }}>{attempt.totalScore} pts</span>
                        )}
                        {attempt.status === 'EVALUATED' && (
                          <button
                            id={`view-result-${attempt.id}`}
                            className="btn btn-ghost"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                            onClick={() => navigate(`/result/${attempt.id}`)}
                          >
                            Results
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
