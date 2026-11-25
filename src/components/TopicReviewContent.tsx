import React, {useState} from 'react';
import type {TopicItem} from '../types/academy';
import {MarkedText} from '../utils/richText';

interface TopicReviewContentProps {
  topic: TopicItem;
  isReviewDone: boolean;
  isHard: boolean;
  onMarkReviewDone: (topicId: string) => void;
  onToggleHard: (topicId: string) => void;
}

export const TopicReviewContent: React.FC<TopicReviewContentProps> = ({
  topic,
  isReviewDone,
  isHard,
  onMarkReviewDone,
  onToggleHard,
}) => {
  const [revealedCards, setRevealedCards] = useState<Record<number, boolean>>({});
  const rev = topic.review || {focusPoints: [], terms: [], compare: null};

  const toggleCard = (idx: number) => {
    setRevealedCards((prev) => ({...prev, [idx]: !prev[idx]}));
  };

  return (
    <div>
      <div style={{marginBottom: '16px'}}>
        <div style={{fontSize: '0.85rem', color: 'var(--turquoise)', fontWeight: 800}}>
          {topic.indexLabel}
        </div>
        <div className="ltr" style={{fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)'}}>
          {topic.titleEn}
        </div>
        <div style={{color: 'var(--text-secondary)', fontWeight: 700}}>{topic.titleAr}</div>
      </div>

      {rev.simpleWay && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'var(--gold-bg)',
            border: '1px solid rgba(180,138,62,0.34)',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontWeight: 800,
              color: 'var(--gold)',
              marginBottom: '6px',
              fontSize: '0.95rem',
            }}
          >
            أبسط طريقة تفهمها:
          </div>
          <div style={{fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.75}}>
            <MarkedText text={rev.simpleWay} />
          </div>
        </div>
      )}

      <div
        style={{
          padding: '16px',
          borderRadius: '12px',
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-hairline)',
          marginBottom: '16px',
        }}
      >
        <div style={{fontWeight: 800, color: 'var(--navy)', marginBottom: '10px'}}>
          أبرز النقاط المركزة للامتحان:
        </div>
        <ul
          style={{
            paddingRight: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {(rev.focusPoints || []).map((pt, idx) => (
            <li key={idx}>
              <MarkedText text={pt} />
            </li>
          ))}
        </ul>
      </div>

      {rev.terms && rev.terms.length > 0 && (
        <div style={{marginBottom: '16px'}}>
          <div style={{fontWeight: 800, color: 'var(--navy)', marginBottom: '10px'}}>
            بطاقات استرجاع المصطلحات (اضغط لكشف الشرح):
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
              gap: '10px',
            }}
          >
            {rev.terms.map((term, idx) => {
              const shown = Boolean(revealedCards[idx]);
              return (
                <button
                  key={idx}
                  type="button"
                  className="flashcard"
                  style={{textAlign: 'right'}}
                  onClick={() => toggleCard(idx)}
                >
                  <div className="ltr" style={{fontWeight: 800, color: 'var(--navy)'}}>
                    <MarkedText text={term.en} />
                  </div>
                  <div style={{fontSize: '0.78rem', color: 'var(--turquoise)', marginTop: '4px'}}>
                    {shown ? 'اضغط لإخفاء المعنى' : 'اضغط هنا لإظهار المعنى'}
                  </div>
                  {shown && (
                    <div
                      style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px dashed var(--border-strong)',
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <MarkedText text={term.iq} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {rev.compare && (
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'var(--turquoise-bg)',
            border: '1px solid rgba(13,148,136,0.25)',
            marginBottom: '16px',
          }}
        >
          <div style={{fontWeight: 800, color: 'var(--navy)', marginBottom: '10px'}}>
            <MarkedText text={rev.compare.title} />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
              gap: '12px',
            }}
          >
            <div style={{background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px'}}>
              <div style={{fontWeight: 800, color: 'var(--turquoise)'}}>
                <MarkedText text={rev.compare.aLabel} />
              </div>
              <div>
                <MarkedText text={rev.compare.aText} />
              </div>
            </div>
            <div style={{background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px'}}>
              <div style={{fontWeight: 800, color: 'var(--gold)'}}>
                <MarkedText text={rev.compare.bLabel} />
              </div>
              <div>
                <MarkedText text={rev.compare.bText} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-hairline)',
        }}
      >
        <button
          type="button"
          className="btn-primary"
          onClick={() => onMarkReviewDone(topic.id)}
        >
          {isReviewDone ? 'تمت مراجعة هذا الموضوع' : 'تثبيت إتمام المراجعة'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onToggleHard(topic.id)}
        >
          {isHard ? 'محدد كموضوع يحتاج تكراراً' : 'إضافة لقائمة التكرار الصعب'}
        </button>
      </div>
    </div>
  );
};
