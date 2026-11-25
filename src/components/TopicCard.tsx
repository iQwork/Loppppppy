import React, {useState} from 'react';
import type {TopicItem, TopicSegment} from '../types/academy';
import {MarkedText, RichLectureContent, type PairHighlightSync} from '../utils/richText';
import {MediaStudio} from './MediaStudio';

const PairSegmentBlock: React.FC<{segment: TopicSegment}> = ({segment}) => {
  const [hoveredPair, setHoveredPair] = useState<string | null>(null);
  const [pinnedPair, setPinnedPair] = useState<string | null>(null);

  const activePair = hoveredPair || pinnedPair;

  const pairSync: PairHighlightSync = {
    activePair,
    onEnterPair: (pid) => setHoveredPair(pid),
    onLeavePair: (pid) => setHoveredPair((cur) => (cur === pid ? null : cur)),
    onTogglePair: (pid) => setPinnedPair((cur) => (cur === pid ? null : pid)),
  };

  return (
    <div className="segment-pair">
      <div className="en-block">
        <RichLectureContent html={segment.enHtml} pairSync={pairSync} />
      </div>
      <div className="iq-block">
        <RichLectureContent html={segment.iqHtml} pairSync={pairSync} />
      </div>
    </div>
  );
};

interface TopicCardProps {
  topic: TopicItem;
  isCompleted: boolean;
  isBookmarked: boolean;
  onToggleComplete: (topicId: string) => void;
  onToggleBookmark: (topicId: string) => void;
  onOpenReview: (topicId: string) => void;
  onOpenQuiz: (topicId: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  isCompleted,
  isBookmarked,
  onToggleComplete,
  onToggleBookmark,
  onOpenReview,
  onOpenQuiz,
}) => {
  return (
    <article className="topic-section" id={`topic-${topic.id}`}>
      <div className="topic-header">
        <div>
          <div className="topic-index">{topic.indexLabel}</div>
          <h3 className="topic-title-en">{topic.titleEn}</h3>
          <div className="topic-title-ar">{topic.titleAr}</div>
        </div>
        <div className="topic-actions-inline">
          <button
            type="button"
            className={`action-chip-btn ${isCompleted ? 'active' : ''}`}
            onClick={() => onToggleComplete(topic.id)}
          >
            {isCompleted ? 'مكتمل' : 'تحديد كمكتمل'}
          </button>
          <button
            type="button"
            className={`action-chip-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={() => onToggleBookmark(topic.id)}
          >
            {isBookmarked ? 'محفوظ للمراجعة' : 'حفظ للمراجعة'}
          </button>
        </div>
      </div>

      {topic.segments.map((seg, idx) => (
        <PairSegmentBlock key={`${topic.id}-seg-${idx}`} segment={seg} />
      ))}

      {topic.helperNote && (
        <div className="helper-note">
          <div className="helper-note-title">ملاحظة سريرية مركزة من نفس الصفحة:</div>
          <div>
            <MarkedText text={topic.helperNote} />
          </div>
        </div>
      )}

      <div className="visual-section">
        <div className="visual-header">
          <div className="visual-title">
            <span>تذكرها بصرياً</span>
          </div>
          <div className="visual-mode-meta">{topic.simTitle}</div>
        </div>
        <MediaStudio topic={topic} />
      </div>

      <div className="topic-divider" />
      <div className="topic-gate-actions">
        <button
          type="button"
          className="gate-btn"
          onClick={() => onOpenReview(topic.id)}
        >
          <span>مراجعة هذا الموضوع</span>
          <span aria-hidden="true">&#8592;</span>
        </button>
        <button
          type="button"
          className="gate-btn quiz-gate"
          onClick={() => onOpenQuiz(topic.id)}
        >
          <span>اختبر نفسك في هذا الموضوع</span>
          <span aria-hidden="true">&#8592;</span>
        </button>
      </div>
    </article>
  );
};
