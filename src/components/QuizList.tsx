import React from 'react';
import type {McqItem} from '../types/academy';

export const LEVEL_AR: Record<string, string> = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
  precise: 'دقيق جداً',
  application: 'تطبيقي',
  clinical: 'سؤال سريري',
};

interface QuizListProps {
  questions: McqItem[];
  titleContext: string;
  answeredMcqs: Record<string, {selected: number; correct: boolean; ts: number}>;
  onAnswer: (q: McqItem, chosenIndex: number) => void;
  onResetGroup: (questionIds: string[]) => void;
}

export const QuizList: React.FC<QuizListProps> = ({
  questions,
  titleContext,
  answeredMcqs,
  onAnswer,
  onResetGroup,
}) => {
  if (!questions.length) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        لا توجد أسئلة مطابقة للتصفية الحالية.
      </div>
    );
  }

  let ansCount = 0;
  let corCount = 0;
  for (const q of questions) {
    const rec = answeredMcqs[q.id];
    if (rec) {
      ansCount++;
      if (rec.correct) corCount++;
    }
  }

  return (
    <div>
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'var(--turquoise-bg)',
          border: '1px solid rgba(13,148,136,0.25)',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <div style={{fontWeight: 800, color: 'var(--navy)'}}>
          نتيجتك في {titleContext}:{' '}
          <span className="tabular-nums" style={{color: 'var(--turquoise)'}}>
            {corCount} / {questions.length}
          </span>{' '}
          (المُجاب: {ansCount})
        </div>
        <button
          type="button"
          className="btn-secondary"
          style={{padding: '6px 12px', fontSize: '0.8rem'}}
          onClick={() => onResetGroup(questions.map((q) => q.id))}
        >
          إعادة اختبار هذه المجموعة
        </button>
      </div>

      {questions.map((q, idx) => {
        const prev = answeredMcqs[q.id];
        return (
          <div key={q.id} className="mcq-card">
            <div className="mcq-meta">
              سؤال {idx + 1} من {questions.length} · صفحة {q.page} · المستوى:{' '}
              {LEVEL_AR[q.level] || q.level}
            </div>
            <div className="mcq-question-en">{q.qEn}</div>
            <div className="mcq-question-iq">{q.qIq}</div>

            <div className="mcq-options">
              {q.options.map((opt, oi) => {
                let cls = 'mcq-option-btn';
                if (prev) {
                  if (oi === q.correctIndex) cls += ' correct';
                  else if (oi === prev.selected) cls += ' wrong';
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    className={cls}
                    disabled={Boolean(prev)}
                    onClick={() => onAnswer(q, oi)}
                  >
                    <span className="mcq-opt-en">
                      {String.fromCharCode(65 + oi)}. {opt}
                    </span>
                    <span className="mcq-opt-iq">{q.optionsIq[oi]}</span>
                  </button>
                );
              })}
            </div>

            {prev && (
              <div className="mcq-explanation">
                <div
                  style={{
                    fontWeight: 800,
                    color: prev.correct ? '#059669' : '#DC2626',
                    marginBottom: '6px',
                  }}
                >
                  {prev.correct
                    ? 'إجابة صحيحة! أحسنت يا دكتور'
                    : `إجابة خاطئة — الإجابة الصحيحة هي الاختيار ${String.fromCharCode(
                        65 + q.correctIndex,
                      )}`}
                </div>
                <div style={{marginBottom: '8px'}}>
                  <strong>ليش هي الصح؟</strong> {q.whyCorrectIq}
                </div>
                {q.whyWrongIq && q.whyWrongIq.length > 0 && (
                  <div style={{fontSize: '0.84rem', color: 'var(--text-secondary)'}}>
                    <strong>تحليل بقية الخيارات:</strong>
                    <ul style={{paddingRight: '18px', marginTop: '4px'}}>
                      {q.whyWrongIq.map((w, i) => (
                        <li key={i}>
                          <strong>{String.fromCharCode(65 + i)}:</strong> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
