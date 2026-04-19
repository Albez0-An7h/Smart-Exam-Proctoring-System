import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import {
  RiTrophyLine,
  RiArrowLeftLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiQuestionLine,
} from 'react-icons/ri';

interface Submission {
  id: string;
  score: number;
  answer: string;
  question: {
    id: string;
    text: string;
    marks: number;
    type: string;
  };
}

interface AttemptResult {
  id: string;
  status: string;
  totalScore: number;
  startTime: string;
  endTime?: string;
  exam: {
    title: string;
    duration: number;
  };
  submissions: Submission[];
}

export default function Result() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attemptId) return;
    api.get(`/attempts/${attemptId}/result`)
      .then((r) => setResult(r.data))
      .catch((err: any) => setError(String(err.response?.data?.error || 'Could not load result.')))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <Spinner />;
  if (error || !result) return (
    <div className="page"><div className="container"><div className="alert alert-error">{error || 'Result not found.'}</div></div></div>
  );

  const maxScore = result.submissions.reduce((acc, s) => acc + s.question.marks, 0);
  const pct = maxScore > 0 ? Math.round((result.totalScore / maxScore) * 100) : 0;
  const passed = pct >= 40;

  const timeTaken = result.endTime
    ? Math.round((new Date(result.endTime).getTime() - new Date(result.startTime).getTime()) / 60000)
    : null;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Back */}
        <button className="btn btn-ghost" style={{ marginBottom: '1.2rem' }} onClick={() => navigate('/dashboard')}>
          <RiArrowLeftLine size={15} /> Back to Dashboard
        </button>

        {/* Hero */}
        <div className="card result-hero">
          <div className="score-circle" style={{ borderColor: passed ? 'var(--success)' : 'var(--danger)' }}>
            <span className="score-val" style={{ color: passed ? 'var(--success)' : 'var(--danger)' }}>
              {pct}%
            </span>
            <span className="score-total">{result.totalScore}/{maxScore}</span>
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.3rem' }}>{result.exam.title}</h2>
          <p className="text-muted text-sm" style={{ marginBottom: '0.8rem' }}>
            {passed ? '🎉 Congratulations, you passed!' : '📚 Keep practising — you can do it!'}
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{result.totalScore}</p>
              <p className="text-muted text-sm">Score</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{result.submissions.length}</p>
              <p className="text-muted text-sm">Questions</p>
            </div>
            {timeTaken !== null && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{timeTaken} min</p>
                <p className="text-muted text-sm">Time taken</p>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.8rem' }}>
                {result.status.replace('_', ' ')}
              </span>
              <p className="text-muted text-sm" style={{ marginTop: '0.2rem' }}>Status</p>
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <h3 style={{ fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>Question Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {result.submissions.map((sub, idx) => {
            const scored = sub.score > 0;
            const partial = sub.score > 0 && sub.score < sub.question.marks;
            return (
              <div key={sub.id} className="card" style={{ padding: '1rem 1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ marginTop: '2px', flexShrink: 0 }}>
                    {sub.question.type === 'SUBJECTIVE'
                      ? <RiQuestionLine size={18} color="var(--text-muted)" />
                      : scored
                        ? <RiCheckboxCircleLine size={18} color="var(--success)" />
                        : <RiCloseCircleLine size={18} color="var(--danger)" />}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                      Q{idx + 1}. {sub.question.text}
                    </p>
                    {sub.answer && (
                      <p className="text-sm text-muted" style={{ marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 500 }}>Your answer: </span>{sub.answer}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: partial ? 'var(--warning)' : scored ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {sub.score}/{sub.question.marks}
                    </span>
                    <p className="text-sm text-muted">{sub.question.type}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            <RiTrophyLine size={15} /> Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
