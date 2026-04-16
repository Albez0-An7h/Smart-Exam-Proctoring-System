import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import {
  RiArrowLeftLine,
  RiAddLine,
  RiDeleteBinLine,
  RiSendPlaneLine,
} from 'react-icons/ri';

type QuestionType = 'MCQ' | 'SUBJECTIVE' | 'CODING';

interface Option { text: string; isCorrect: boolean; }
interface TestCase { input: string; expectedOutput: string; }
interface Question {
  type: QuestionType;
  text: string;
  marks: number;
  options: Option[];
  testCases: TestCase[];
  starterCode: string;
}

const emptyQuestion = (): Question => ({
  type: 'MCQ',
  text: '',
  marks: 1,
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
  testCases: [{ input: '', expectedOutput: '' }],
  starterCode: '',
});

export default function CreateExam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addToExamId = searchParams.get('addTo');

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* ── Question helpers ─────────────────────── */
  const updateQ = (i: number, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q));

  const updateOption = (qi: number, oi: number, patch: Partial<Option>) =>
    setQuestions((qs) =>
      qs.map((q, i) =>
        i !== qi ? q : { ...q, options: q.options.map((o, j) => j === oi ? { ...o, ...patch } : o) }
      )
    );

  const updateTestCase = (qi: number, ti: number, patch: Partial<TestCase>) =>
    setQuestions((qs) =>
      qs.map((q, i) =>
        i !== qi ? q : { ...q, testCases: q.testCases.map((t, j) => j === ti ? { ...t, ...patch } : t) }
      )
    );

  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()]);
  const removeQuestion = (i: number) =>
    setQuestions((qs) => qs.length > 1 ? qs.filter((_, idx) => idx !== i) : qs);

  /* ── Submit ───────────────────────────────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      let examId = addToExamId;

      if (!examId) {
        const examRes = await api.post('/exams', { title, duration: Number(duration), startTime: startTime || undefined, endTime: endTime || undefined });
        examId = examRes.data.id;
      }

      for (const q of questions) {
        const payload: Record<string, unknown> = {
          type: q.type,
          text: q.text,
          marks: Number(q.marks),
        };
        if (q.type === 'MCQ') {
          payload.options = q.options.filter((o) => o.text.trim());
        }
        if (q.type === 'CODING') {
          payload.starterCode = q.starterCode;
          payload.testCases = q.testCases.filter((t) => t.input.trim() || t.expectedOutput.trim());
        }
        await api.post(`/exams/${examId}/questions`, payload);
      }

      setSuccess(addToExamId ? 'Questions added successfully!' : 'Exam created with questions!');
      setTimeout(() => navigate('/teacher'), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/teacher')}>
            <RiArrowLeftLine size={16} />
          </button>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {addToExamId ? 'Add Questions' : 'Create Exam'}
          </h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Exam meta — only when creating fresh */}
          {!addToExamId && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Exam Details</p>
              <div className="form-group">
                <label htmlFor="exam-title">Title *</label>
                <input id="exam-title" className="form-control" placeholder="e.g. Data Structures Midterm" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="exam-duration">Duration (min) *</label>
                  <input id="exam-duration" type="number" className="form-control" value={duration} min={1} onChange={(e) => setDuration(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label htmlFor="exam-start">Start Time</label>
                  <input id="exam-start" type="datetime-local" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="exam-end">End Time</label>
                  <input id="exam-end" type="datetime-local" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Questions */}
          {questions.map((q, qi) => (
            <div key={qi} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="bold">Question {qi + 1}</p>
                <button type="button" className="btn btn-ghost text-sm" onClick={() => removeQuestion(qi)}>
                  <RiDeleteBinLine size={14} /> Remove
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select id={`q-type-${qi}`} className="form-control" value={q.type} onChange={(e) => updateQ(qi, { type: e.target.value as QuestionType })}>
                    <option value="MCQ">MCQ</option>
                    <option value="SUBJECTIVE">Subjective</option>
                    <option value="CODING">Coding</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Marks</label>
                  <input id={`q-marks-${qi}`} type="number" className="form-control" min={1} value={q.marks} onChange={(e) => updateQ(qi, { marks: Number(e.target.value) })} style={{ width: 80 }} />
                </div>
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea id={`q-text-${qi}`} className="form-control" placeholder="Enter question…" value={q.text} onChange={(e) => updateQ(qi, { text: e.target.value })} required />
              </div>

              {/* MCQ options */}
              {q.type === 'MCQ' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="text-sm text-muted" style={{ fontWeight: 500 }}>Options (tick correct)</label>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <input
                        type="checkbox"
                        id={`q${qi}-opt${oi}-correct`}
                        checked={opt.isCorrect}
                        onChange={(e) => updateOption(qi, oi, { isCorrect: e.target.checked })}
                        style={{ accentColor: 'var(--accent)', width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <input
                        id={`q${qi}-opt${oi}-text`}
                        type="text"
                        className="form-control"
                        placeholder={`Option ${oi + 1}`}
                        value={opt.text}
                        onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Coding */}
              {q.type === 'CODING' && (
                <>
                  <div className="form-group">
                    <label>Starter Code</label>
                    <textarea
                      id={`q${qi}-starter`}
                      className="form-control"
                      placeholder="
                      style={{ fontFamily: 'monospace', minHeight: 100 }}
                      value={q.starterCode}
                      onChange={(e) => updateQ(qi, { starterCode: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="text-sm text-muted" style={{ fontWeight: 500 }}>Test Cases</label>
                    {q.testCases.map((tc, ti) => (
                      <div key={ti} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        <input id={`q${qi}-tc${ti}-input`} className="form-control" placeholder="Input" value={tc.input} onChange={(e) => updateTestCase(qi, ti, { input: e.target.value })} />
                        <input id={`q${qi}-tc${ti}-output`} className="form-control" placeholder="Expected output" value={tc.expectedOutput} onChange={(e) => updateTestCase(qi, ti, { expectedOutput: e.target.value })} />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-ghost text-sm"
                      style={{ alignSelf: 'flex-start' }}
                      onClick={() => updateQ(qi, { testCases: [...q.testCases, { input: '', expectedOutput: '' }] })}
                    >
                      + Add Test Case
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              id="add-question-btn"
              type="button"
              className="btn btn-ghost"
              onClick={addQuestion}
            >
              <RiAddLine size={16} /> Add Question
            </button>
            <button
              id="submit-exam-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <RiSendPlaneLine size={15} />
              {loading ? 'Saving…' : addToExamId ? 'Save Questions' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
