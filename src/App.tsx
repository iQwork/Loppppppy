import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ACADEMY_PAGES, MCQ_BANK, PAGE_REVIEWS} from './data/lectureData';
import type {AcademyAppState, McqItem, TopicItem} from './types/academy';
import {TopicCard} from './components/TopicCard';
import {LightboxModal} from './components/LightboxModal';
import {TopicReviewContent} from './components/TopicReviewContent';
import {LEVEL_AR, QuizList} from './components/QuizList';
import {MarkedText, stripHtmlToText} from './utils/richText';

const STORAGE_KEY = 'dr_yaser_benign_cysts_v1';
const IDB_NAME = 'DrYaserBenignCystsDB';

const DEFAULT_STATE: AcademyAppState = {
  theme: 'light',
  currentView: 'lecture',
  currentPage: 1,
  completedPages: [],
  completedTopics: [],
  bookmarkedTopics: [],
  reviewCompletedTopics: [],
  reviewHardTopics: [],
  answeredMcqs: {},
  testHistory: [],
};

function loadInitialState(): AcademyAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AcademyAppState>;
      if (parsed && typeof parsed === 'object') {
        const merged: AcademyAppState = {...DEFAULT_STATE, ...parsed};
        if (merged.currentPage < 1 || merged.currentPage > ACADEMY_PAGES.length) {
          merged.currentPage = 1;
        }
        return merged;
      }
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_STATE;
}

function saveToIdb(payload: AcademyAppState): void {
  if (typeof window === 'undefined' || !window.indexedDB) return;
  try {
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('academyState')) {
        db.createObjectStore('academyState', {keyPath: 'id'});
      }
    };
    req.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      const tx = db.transaction(['academyState'], 'readwrite');
      tx.objectStore('academyState').put({
        id: 'main',
        data: payload,
        updatedAt: Date.now(),
      });
    };
  } catch {
    // ignore IndexedDB errors
  }
}

type LightboxKind =
  | {type: 'topic-review'; topicId: string}
  | {type: 'page-review'; pageNumber: number}
  | {type: 'topic-quiz'; topicId: string}
  | {type: 'page-quiz'; pageNumber: number}
  | {type: 'search'}
  | null;

const TelegramIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.281c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.941z" />
  </svg>
);

const InstagramIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zm8.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
  </svg>
);

export default function App() {
  const [state, setState] = useState<AcademyAppState>(loadInitialState);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxKind>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<number | null>(null);
  const lectureMountRef = useRef<HTMLDivElement | null>(null);

  // Focused Review View states
  const [reviewScope, setReviewScope] = useState<'all' | 'page' | 'hard'>('all');
  const [reviewPageSel, setReviewPageSel] = useState<number>(1);

  // Q-bank View states
  const [qbPageFilter, setQbPageFilter] = useState<string>('all');
  const [qbLevelFilter, setQbLevelFilter] = useState<string>('all');
  const [qbStatusFilter, setQbStatusFilter] = useState<string>('all');
  const [qbShuffleSeed, setQbShuffleSeed] = useState<number>(0);

  // Smart search query
  const [searchQuery, setSearchQuery] = useState('');

  // Hero animated counters
  const [heroCounters, setHeroCounters] = useState({
    pages: 0,
    topics: 0,
    slides: 0,
    questions: 0,
  });

  const totalTopicsCount = useMemo(
    () => ACADEMY_PAGES.reduce((acc, p) => acc + p.topics.length, 0),
    [],
  );

  useEffect(() => {
    const targets = {
      pages: ACADEMY_PAGES.length,
      topics: totalTopicsCount,
      slides: ACADEMY_PAGES.length,
      questions: MCQ_BANK.length,
    };
    const steps = 20;
    let tick = 0;
    const timer = window.setInterval(() => {
      tick++;
      const frac = Math.min(1, tick / steps);
      setHeroCounters({
        pages: Math.round(targets.pages * frac),
        topics: Math.round(targets.topics * frac),
        slides: Math.round(targets.slides * frac),
        questions: Math.round(targets.questions * frac),
      });
      if (tick >= steps) window.clearInterval(timer);
    }, 22);
    return () => window.clearInterval(timer);
  }, [totalTopicsCount]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
    saveToIdb(state);
  }, [state]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightbox(null);
        setDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2600);
  }, []);

  const globalPct = totalTopicsCount
    ? Math.round((state.completedTopics.length / totalTopicsCount) * 100)
    : 0;

  const findTopicById = useCallback((topicId: string): {page: number; topic: TopicItem} | null => {
    for (const p of ACADEMY_PAGES) {
      for (const t of p.topics) {
        if (t.id === topicId) return {page: p.pageNumber, topic: t};
      }
    }
    return null;
  }, []);

  const switchView = (view: 'lecture' | 'review' | 'qbank') => {
    setState((prev) => ({...prev, currentView: view}));
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const goToPage = (pageNum: number) => {
    const clamped = Math.max(1, Math.min(ACADEMY_PAGES.length, pageNum));
    setState((prev) => ({...prev, currentPage: clamped, currentView: 'lecture'}));
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const togglePageComplete = (pageNum: number) => {
    const pageObj = ACADEMY_PAGES.find((p) => p.pageNumber === pageNum);
    setState((prev) => {
      const exists = prev.completedPages.includes(pageNum);
      if (exists) {
        showToast(`تم إلغاء إكمال الصفحة ${pageNum}`);
        return {
          ...prev,
          completedPages: prev.completedPages.filter((n) => n !== pageNum),
        };
      }
      const topicIdsToAdd = pageObj ? pageObj.topics.map((t) => t.id) : [];
      const mergedTopics = Array.from(new Set([...prev.completedTopics, ...topicIdsToAdd]));
      showToast(`تم تسجيل الصفحة ${pageNum} كمكتملة`);
      return {
        ...prev,
        completedPages: [...prev.completedPages, pageNum],
        completedTopics: mergedTopics,
      };
    });
  };

  const toggleTopicComplete = (topicId: string) => {
    setState((prev) => {
      const exists = prev.completedTopics.includes(topicId);
      if (exists) {
        return {
          ...prev,
          completedTopics: prev.completedTopics.filter((id) => id !== topicId),
        };
      }
      showToast('تم حفظ إكمال الموضوع');
      return {
        ...prev,
        completedTopics: [...prev.completedTopics, topicId],
      };
    });
  };

  const toggleTopicBookmark = (topicId: string) => {
    setState((prev) => {
      const exists = prev.bookmarkedTopics.includes(topicId);
      if (exists) {
        return {
          ...prev,
          bookmarkedTopics: prev.bookmarkedTopics.filter((id) => id !== topicId),
        };
      }
      showToast('تم حفظ الموضوع للمراجعة');
      return {
        ...prev,
        bookmarkedTopics: [...prev.bookmarkedTopics, topicId],
      };
    });
  };

  const markTopicReviewDone = (topicId: string) => {
    setState((prev) => ({
      ...prev,
      reviewCompletedTopics: prev.reviewCompletedTopics.includes(topicId)
        ? prev.reviewCompletedTopics
        : [...prev.reviewCompletedTopics, topicId],
    }));
    showToast('تم حفظ تقدم مراجعة الموضوع');
  };

  const toggleTopicHard = (topicId: string) => {
    setState((prev) => {
      const exists = prev.reviewHardTopics.includes(topicId);
      if (exists) {
        showToast('أزيل من قائمة التكرار');
        return {
          ...prev,
          reviewHardTopics: prev.reviewHardTopics.filter((id) => id !== topicId),
        };
      }
      showToast('أضيف إلى قائمة التكرار');
      return {
        ...prev,
        reviewHardTopics: [...prev.reviewHardTopics, topicId],
      };
    });
  };

  const handleAnswerMcq = (q: McqItem, chosenIndex: number) => {
    const ok = chosenIndex === q.correctIndex;
    const now = Date.now();
    setState((prev) => {
      const nextHistory = [
        ...prev.testHistory,
        {id: q.id, page: q.page, topicId: q.topicId, correct: ok, ts: now},
      ];
      if (nextHistory.length > 300) nextHistory.shift();
      return {
        ...prev,
        answeredMcqs: {
          ...prev.answeredMcqs,
          [q.id]: {selected: chosenIndex, correct: ok, ts: now},
        },
        testHistory: nextHistory,
      };
    });
  };

  const handleResetQuizGroup = (questionIds: string[]) => {
    setState((prev) => {
      const next = {...prev.answeredMcqs};
      for (const id of questionIds) delete next[id];
      return {...prev, answeredMcqs: next};
    });
  };

  const currentPageObj =
    ACADEMY_PAGES.find((p) => p.pageNumber === state.currentPage) || ACADEMY_PAGES[0];

  // Focused Review items
  const reviewItems = useMemo(() => {
    const out: Array<{page: number; topic: TopicItem}> = [];
    for (const p of ACADEMY_PAGES) {
      for (const t of p.topics) {
        const isHard = state.reviewHardTopics.includes(t.id);
        const isBook = state.bookmarkedTopics.includes(t.id);
        if (reviewScope === 'all') out.push({page: p.pageNumber, topic: t});
        else if (reviewScope === 'page' && p.pageNumber === reviewPageSel)
          out.push({page: p.pageNumber, topic: t});
        else if (reviewScope === 'hard' && (isHard || isBook))
          out.push({page: p.pageNumber, topic: t});
      }
    }
    return out;
  }, [reviewScope, reviewPageSel, state.reviewHardTopics, state.bookmarkedTopics]);

  // Q-bank filtered list
  const qbankFilteredList = useMemo(() => {
    const base = MCQ_BANK.filter((q) => {
      if (qbPageFilter !== 'all' && String(q.page) !== qbPageFilter) return false;
      if (qbLevelFilter !== 'all' && q.level !== qbLevelFilter) return false;
      const rec = state.answeredMcqs[q.id];
      if (qbStatusFilter === 'unanswered' && rec) return false;
      if (qbStatusFilter === 'wrong' && (!rec || rec.correct)) return false;
      return true;
    });
    if (qbShuffleSeed > 0) {
      const arr = [...base];
      let s = qbShuffleSeed;
      for (let i = arr.length - 1; i > 0; i--) {
        s = (s * 9301 + 49297) % 233280;
        const j = Math.floor((s / 233280) * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    return base;
  }, [qbPageFilter, qbLevelFilter, qbStatusFilter, qbShuffleSeed, state.answeredMcqs]);

  const totalAnsweredCount = Object.keys(state.answeredMcqs).length;
  const totalCorrectCount = Object.values(state.answeredMcqs).filter((v) => v.correct).length;

  // Smart search matches
  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const matches: Array<{page: number; topic: TopicItem}> = [];
    for (const p of ACADEMY_PAGES) {
      for (const t of p.topics) {
        const blob = (
          t.titleEn +
          ' ' +
          t.titleAr +
          ' ' +
          t.segments
            .map((s) => `${stripHtmlToText(s.enHtml)} ${stripHtmlToText(s.iqHtml)}`)
            .join(' ')
        ).toLowerCase();
        if (blob.includes(q)) {
          matches.push({page: p.pageNumber, topic: t});
        }
      }
    }
    return matches;
  }, [searchQuery]);

  // Resolve active lightbox title & content
  let lightboxTitle = '';
  let lightboxContent: React.ReactNode = null;
  if (lightbox?.type === 'topic-review') {
    const found = findTopicById(lightbox.topicId);
    if (found) {
      lightboxTitle = `مراجعة الموضوع: ${found.topic.titleAr}`;
      lightboxContent = (
        <TopicReviewContent
          topic={found.topic}
          isReviewDone={state.reviewCompletedTopics.includes(found.topic.id)}
          isHard={state.reviewHardTopics.includes(found.topic.id)}
          onMarkReviewDone={markTopicReviewDone}
          onToggleHard={toggleTopicHard}
        />
      );
    }
  } else if (lightbox?.type === 'page-review') {
    const pr = PAGE_REVIEWS[lightbox.pageNumber];
    if (pr) {
      lightboxTitle = pr.title;
      lightboxContent = (
        <div>
          {pr.simpleWay && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'var(--turquoise-bg)',
                border: '1px solid rgba(13,148,136,0.3)',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: 'var(--turquoise)',
                  marginBottom: '6px',
                  fontSize: '0.95rem',
                }}
              >
                أبسط طريقة تفهم بيها زبدة الصفحة:
              </div>
              <div style={{fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.75}}>
                <MarkedText text={pr.simpleWay} />
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
              الخلاصة الكاملة للصفحة {lightbox.pageNumber}:
            </div>
            <ul
              style={{
                paddingRight: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {(pr.takeaways || []).map((item, i) => (
                <li key={i}>
                  <MarkedText text={item} />
                </li>
              ))}
            </ul>
          </div>
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--gold-bg)',
              border: '1px solid rgba(180,138,62,0.30)',
            }}
          >
            <div style={{fontWeight: 800, color: 'var(--gold)', marginBottom: '8px'}}>
              مصائد الامتحان السريرية في هذه الصفحة:
            </div>
            <ul
              style={{
                paddingRight: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {(pr.traps || []).map((tr, i) => (
                <li key={i}>
                  <MarkedText text={tr} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
  } else if (lightbox?.type === 'topic-quiz') {
    const found = findTopicById(lightbox.topicId);
    if (found) {
      const qs = MCQ_BANK.filter((q) => q.topicId === lightbox.topicId);
      lightboxTitle = `اختبار الموضوع: ${found.topic.titleAr}`;
      lightboxContent = (
        <QuizList
          questions={qs}
          titleContext={found.topic.titleAr}
          answeredMcqs={state.answeredMcqs}
          onAnswer={handleAnswerMcq}
          onResetGroup={handleResetQuizGroup}
        />
      );
    }
  } else if (lightbox?.type === 'page-quiz') {
    const qs = MCQ_BANK.filter((q) => q.page === lightbox.pageNumber);
    lightboxTitle = `جميع أسئلة الصفحة ${lightbox.pageNumber}`;
    lightboxContent = (
      <QuizList
        questions={qs}
        titleContext={`الصفحة ${lightbox.pageNumber}`}
        answeredMcqs={state.answeredMcqs}
        onAnswer={handleAnswerMcq}
        onResetGroup={handleResetQuizGroup}
      />
    );
  } else if (lightbox?.type === 'search') {
    lightboxTitle = 'البحث الذكي في ملزمة الأكياس الحميدة للفم والفكين (Benign Cystic Lesions)';
    lightboxContent = (
      <div>
        <div className="search-input-wrap">
          <input
            className="text-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالعربي أو الإنجليزي... مثل: Radicular / Dentigerous / OKC / Gorlin / Bohn / Marsupialization / Curette / 5-FU"
            autoFocus
          />
        </div>
        <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
          {!searchQuery.trim() ? (
            'اكتب أي مصطلح علمي أو رقم للبحث الفوري في كل صفحات المحاضرة الـ 12'
          ) : searchMatches.length === 0 ? (
            'لا توجد نتائج مطابقة لهذا المصطلح'
          ) : (
            searchMatches.map((m) => (
              <button
                key={m.topic.id}
                type="button"
                className="search-result-item"
                onClick={() => {
                  setLightbox(null);
                  setState((prev) => ({
                    ...prev,
                    currentView: 'lecture',
                    currentPage: m.page,
                  }));
                  window.setTimeout(() => {
                    const el = document.getElementById(`topic-${m.topic.id}`);
                    if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
                  }, 150);
                }}
              >
                <div style={{fontSize: '0.78rem', color: 'var(--turquoise)', fontWeight: 800}}>
                  صفحة {m.page}
                </div>
                <div className="ltr" style={{fontWeight: 800, color: 'var(--navy)'}}>
                  {m.topic.titleEn}
                </div>
                <div style={{fontSize: '0.86rem', color: 'var(--text-secondary)'}}>
                  {m.topic.titleAr}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky Topbar */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-block">
            <button
              type="button"
              className="menu-trigger"
              aria-label="فتح القائمة الجانبية"
              title="القائمة الجانبية"
              onClick={() => setDrawerOpen(true)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="brand-title-wrap">
              <div className="brand-name">منصة الدكتور ياسر ضياء الأسدي</div>
              <div className="brand-meta-inline">
                بكالوريوس طب وجراحة الفم والأسنان · مخترع عراقي · هندسة برمجية
              </div>
            </div>
          </div>

          <nav className="topbar-nav" aria-label="التنقل الرئيسي">
            <button
              type="button"
              className={`nav-tab ${state.currentView === 'lecture' ? 'active' : ''}`}
              onClick={() => switchView('lecture')}
            >
              الملزمة كاملة
            </button>
            <button
              type="button"
              className={`nav-tab ${state.currentView === 'review' ? 'active' : ''}`}
              onClick={() => switchView('review')}
            >
              المراجعة المركزة
            </button>
            <button
              type="button"
              className={`nav-tab ${state.currentView === 'qbank' ? 'active' : ''}`}
              onClick={() => switchView('qbank')}
            >
              بنك الأسئلة
            </button>
          </nav>

          <div className="topbar-actions">
            <button
              type="button"
              className="search-btn-top"
              aria-label="البحث الذكي"
              onClick={() => setLightbox({type: 'search'})}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>بحث ذكي</span>
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="تبديل الوضع الليلي والنهاري"
              title="الوضع الليلي / النهاري"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  theme: prev.theme === 'dark' ? 'light' : 'dark',
                }))
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="global-progress-bar" aria-hidden="true">
          <div className="global-progress-fill" style={{width: `${globalPct}%`}} />
        </div>
      </header>

      {/* Side Drawer */}
      <div
        className={`drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside className={`side-drawer ${drawerOpen ? 'open' : ''}`} aria-label="القائمة الجانبية">
        <div className="drawer-header">
          <div>
            <div style={{fontWeight: 800, color: 'var(--navy)', fontSize: '1.05rem'}}>
              أقسام الأكاديمية
            </div>
            <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
              تنقل سريع بين الملزمة والمراجعة وبنك الأسئلة
            </div>
          </div>
          <button
            type="button"
            className="lightbox-close"
            aria-label="إغلاق القائمة"
            onClick={() => setDrawerOpen(false)}
          >
            &times;
          </button>
        </div>

        <div className="drawer-body">
          <button
            type="button"
            className={`drawer-section-btn ${state.currentView === 'lecture' ? 'active' : ''}`}
            onClick={() => {
              setDrawerOpen(false);
              switchView('lecture');
            }}
          >
            <div>
              <div style={{fontWeight: 800, color: 'var(--navy)'}}>1. الملزمة كاملة</div>
              <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                جميع الصفحات الـ 12 والمواضيع بالترتيب الأصلي
              </div>
            </div>
            <span aria-hidden="true">&#8592;</span>
          </button>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-hairline)',
            }}
          >
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginBottom: '6px',
              }}
            >
              الانتقال السريع للصفحة
            </div>
            <div className="drawer-pages-grid">
              {ACADEMY_PAGES.map((p) => {
                let cls = 'drawer-page-chip';
                if (p.pageNumber === state.currentPage) cls += ' current';
                else if (state.completedPages.includes(p.pageNumber)) cls += ' done';
                return (
                  <button
                    key={p.pageNumber}
                    type="button"
                    className={cls}
                    onClick={() => {
                      setDrawerOpen(false);
                      goToPage(p.pageNumber);
                    }}
                  >
                    {p.pageNumber}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className={`drawer-section-btn ${state.currentView === 'review' ? 'active' : ''}`}
            onClick={() => {
              setDrawerOpen(false);
              switchView('review');
            }}
          >
            <div>
              <div style={{fontWeight: 800, color: 'var(--navy)'}}>2. المراجعة المركزة</div>
              <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                مراجعة المادة أو صفحات محددة + تكرار النقاط الصعبة
              </div>
            </div>
            <span aria-hidden="true">&#8592;</span>
          </button>

          <button
            type="button"
            className={`drawer-section-btn ${state.currentView === 'qbank' ? 'active' : ''}`}
            onClick={() => {
              setDrawerOpen(false);
              switchView('qbank');
            }}
          >
            <div>
              <div style={{fontWeight: 800, color: 'var(--navy)'}}>3. بنك الأسئلة</div>
              <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                بنك شامل واختبارات حسب الصفحة أو الموضوع والصعوبة
              </div>
            </div>
            <span aria-hidden="true">&#8592;</span>
          </button>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '14px',
              borderTop: '1px solid var(--border-hairline)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <a
              href="https://t.me/yaserzia/28"
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-showcase"
              style={{width: '100%', justifyContent: 'center'}}
            >
              <TelegramIcon />
              <span>رابط الملزمة</span>
            </a>
            <a
              href="https://www.instagram.com/oe2.?dmpr=dG5yM2dnZm9ueGx2"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-showcase"
              style={{width: '100%', justifyContent: 'center'}}
            >
              <InstagramIcon />
              <span>للتواصل مع الدكتور</span>
            </a>
          </div>
        </div>
      </aside>

      <main className="academy-container">
        {/* Hero Presentation */}
        <section className="hero-card">
          <div className="hero-grid">
            <div className="academy-identity">
              <h1>منصة الدكتور ياسر ضياء الأسدي</h1>
              <ul className="credentials-list">
                <li>
                  <span className="cred-marker" />
                  <span>بكالوريوس طب وجراحة الفم والأسنان</span>
                </li>
                <li>
                  <span className="cred-marker" />
                  <span>مخترع عراقي حاصد على براءة اختراع دولية</span>
                </li>
                <li>
                  <span className="cred-marker" />
                  <span>خبير في الهندسة البرمجية</span>
                </li>
              </ul>

              <div className="lecture-title-box">
                <div className="lecture-kicker">Oral &amp; Maxillofacial Surgery · Oral Pathology</div>
                <div className="lecture-en-title">Benign Cystic Lesions of the Oral Cavity</div>
                <div className="lecture-author">
                  Interactive Iraqi Clinical Lecture · Complete 12-Page Syllabus
                </div>
              </div>

              <div className="hero-cta-row">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    switchView('lecture');
                    window.setTimeout(() => {
                      lectureMountRef.current?.scrollIntoView({behavior: 'smooth'});
                    }, 60);
                  }}
                >
                  {state.currentPage > 1
                    ? `استئناف من الصفحة ${state.currentPage}`
                    : 'ابدأ من الصفحة 1'}
                </button>
                <a
                  href="https://t.me/yaserzia/28"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="telegram-showcase"
                >
                  <TelegramIcon />
                  <span>رابط الملزمة</span>
                </a>
                <a
                  href="https://www.instagram.com/oe2.?dmpr=dG5yM2dnZm9ueGx2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="instagram-showcase"
                >
                  <InstagramIcon />
                  <span>للتواصل مع الدكتور</span>
                </a>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => switchView('qbank')}
                >
                  بنك الأسئلة الشامل
                </button>
              </div>
            </div>

            <div className="stats-panel">
              <div className="stat-tile">
                <div className="stat-val tabular-nums">{heroCounters.pages}</div>
                <div className="stat-label">عدد صفحات الملزمة</div>
              </div>
              <div className="stat-tile">
                <div className="stat-val tabular-nums">{heroCounters.topics}</div>
                <div className="stat-label">عدد المواضيع الكلي</div>
              </div>
              <div className="stat-tile">
                <div className="stat-val tabular-nums">{heroCounters.slides}</div>
                <div className="stat-label">عدد الشرائح العلمية</div>
              </div>
              <div className="stat-tile">
                <div className="stat-val tabular-nums">{heroCounters.questions}</div>
                <div className="stat-label">أسئلة الاختبار الطبي</div>
              </div>
            </div>
          </div>
        </section>

        {/* View 1: Full Lecture */}
        {state.currentView === 'lecture' && currentPageObj && (
          <section>
            <div className="legend-bar">
              <div style={{fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy)'}}>
                دليل الطبقات اللونية (متطابق بين النص الإنجليزي والشرح العراقي):
              </div>
              <div className="legend-items">
                <span className="legend-item">
                  <span className="legend-swatch" style={{background: 'var(--hl-def)'}} />
                  تعاريف
                </span>
                <span className="legend-item">
                  <span className="legend-swatch" style={{background: 'var(--hl-func)'}} />
                  وظائف ومميزات
                </span>
                <span className="legend-item">
                  <span className="legend-swatch" style={{background: 'var(--hl-cause)'}} />
                  أسباب ودواعي
                </span>
                <span className="legend-item">
                  <span className="legend-swatch" style={{background: 'var(--hl-warn)'}} />
                  أعراض ومساوئ
                </span>
                <span className="legend-item">
                  <span className="legend-swatch" style={{background: 'var(--hl-class)'}} />
                  تصنيفات
                </span>
                <span className="legend-item">
                  <span className="legend-swatch" style={{background: 'var(--hl-diff)'}} />
                  فروقات
                </span>
                <span className="legend-item">
                  <span className="legend-swatch" style={{background: 'var(--hl-num)'}} />
                  أرقام مهمة
                </span>
                <span className="legend-item">
                  <span className="legend-swatch" style={{background: 'var(--hl-exam)'}} />
                  مهم للامتحان
                </span>
              </div>
            </div>

            <div className="page-navigator">
              <button
                type="button"
                className="btn-secondary"
                style={{padding: '8px 14px', fontSize: '0.85rem'}}
                disabled={currentPageObj.pageNumber <= 1}
                onClick={() => goToPage(currentPageObj.pageNumber - 1)}
              >
                الصفحة السابقة
              </button>
              <div className="page-pills-scroll">
                {ACADEMY_PAGES.map((p) => {
                  let cls = 'page-step-btn';
                  if (p.pageNumber === currentPageObj.pageNumber) cls += ' active';
                  else if (state.completedPages.includes(p.pageNumber)) cls += ' completed';
                  return (
                    <button
                      key={p.pageNumber}
                      type="button"
                      className={cls}
                      onClick={() => goToPage(p.pageNumber)}
                    >
                      صفحة {p.pageNumber}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{padding: '8px 14px', fontSize: '0.85rem'}}
                disabled={currentPageObj.pageNumber >= ACADEMY_PAGES.length}
                onClick={() => goToPage(currentPageObj.pageNumber + 1)}
              >
                الصفحة التالية
              </button>
            </div>

            <div ref={lectureMountRef}>
              <div className="page-banner">
                <div className="page-kicker">{currentPageObj.subtitle}</div>
                <h2 className="page-title-ar">{currentPageObj.titleAr}</h2>
                <div className="page-title-en">{currentPageObj.titleEn}</div>
                <div className="page-toolbar">
                  <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700}}>
                    مواضيع هذه الصفحة: {currentPageObj.topics.length} مواضيع مستقلة
                  </div>
                  <button
                    type="button"
                    className={`action-chip-btn ${
                      state.completedPages.includes(currentPageObj.pageNumber) ? 'active' : ''
                    }`}
                    onClick={() => togglePageComplete(currentPageObj.pageNumber)}
                  >
                    {state.completedPages.includes(currentPageObj.pageNumber)
                      ? 'الصفحة مكتملة'
                      : 'تحديد الصفحة كمكتملة'}
                  </button>
                </div>
              </div>

              {currentPageObj.topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isCompleted={state.completedTopics.includes(topic.id)}
                  isBookmarked={state.bookmarkedTopics.includes(topic.id)}
                  onToggleComplete={toggleTopicComplete}
                  onToggleBookmark={toggleTopicBookmark}
                  onOpenReview={(id) => setLightbox({type: 'topic-review', topicId: id})}
                  onOpenQuiz={(id) => setLightbox({type: 'topic-quiz', topicId: id})}
                />
              ))}

              <div className="page-end-divider">
                <span>
                  نهاية الصفحة {currentPageObj.pageNumber} من {ACADEMY_PAGES.length}
                </span>
              </div>
              <div className="page-gate-grid">
                <button
                  type="button"
                  className="page-gate-card"
                  onClick={() =>
                    setLightbox({type: 'page-review', pageNumber: currentPageObj.pageNumber})
                  }
                >
                  <div>
                    <div style={{fontWeight: 800, color: 'var(--navy)', fontSize: '1.05rem'}}>
                      مراجعة سريعة للصفحة {currentPageObj.pageNumber}
                    </div>
                    <div style={{fontSize: '0.84rem', color: 'var(--text-muted)'}}>
                      خلاصة النقاط الذهبية ومصائد الامتحان
                    </div>
                  </div>
                  <span style={{fontSize: '1.25rem', color: 'var(--turquoise)'}} aria-hidden="true">
                    &#8592;
                  </span>
                </button>
                <button
                  type="button"
                  className="page-gate-card"
                  onClick={() =>
                    setLightbox({type: 'page-quiz', pageNumber: currentPageObj.pageNumber})
                  }
                >
                  <div>
                    <div style={{fontWeight: 800, color: 'var(--navy)', fontSize: '1.05rem'}}>
                      جميع الأسئلة التي تخص هذه الصفحة
                    </div>
                    <div style={{fontSize: '0.84rem', color: 'var(--text-muted)'}}>
                      اختبار شامل لكل مواضيع الصفحة {currentPageObj.pageNumber}
                    </div>
                  </div>
                  <span style={{fontSize: '1.25rem', color: 'var(--gold)'}} aria-hidden="true">
                    &#8592;
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* View 2: Focused Review */}
        {state.currentView === 'review' && (
          <section className="workspace-panel">
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--navy)',
                marginBottom: '6px',
              }}
            >
              المراجعة المركزة الذكية
            </h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
              راجع المادة كاملة أو صفحة محددة أو المواضيع المحفوظة والصعبة بنظام الاستدعاء النشط والتكرار
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <button
                type="button"
                className={`sim-btn ${reviewScope === 'all' ? 'active' : ''}`}
                onClick={() => setReviewScope('all')}
              >
                كل المحاضرة ({totalTopicsCount} موضوع)
              </button>
              <button
                type="button"
                className={`sim-btn ${reviewScope === 'page' ? 'active' : ''}`}
                onClick={() => setReviewScope('page')}
              >
                صفحة محددة
              </button>
              <button
                type="button"
                className={`sim-btn ${reviewScope === 'hard' ? 'active' : ''}`}
                onClick={() => setReviewScope('hard')}
              >
                المحفوظة والصعبة (
                {state.reviewHardTopics.length + state.bookmarkedTopics.length})
              </button>
              {reviewScope === 'page' && (
                <select
                  className="select-input"
                  style={{maxWidth: '170px'}}
                  value={reviewPageSel}
                  onChange={(e) => setReviewPageSel(Number(e.target.value))}
                >
                  {ACADEMY_PAGES.map((p) => (
                    <option key={p.pageNumber} value={p.pageNumber}>
                      صفحة {p.pageNumber}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {(reviewScope === 'all' || reviewScope === 'page') && (
              <div style={{marginBottom: '22px'}}>
                <div
                  style={{
                    fontWeight: 800,
                    color: 'var(--turquoise)',
                    marginBottom: '10px',
                    fontSize: '0.95rem',
                  }}
                >
                  كبسولات الصفحات السريعة (زبدة كل صفحة بأسلوب العيادة):
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
                    gap: '10px',
                  }}
                >
                  {(reviewScope === 'page'
                    ? ACADEMY_PAGES.filter((p) => p.pageNumber === reviewPageSel)
                    : ACADEMY_PAGES
                  ).map((p) => {
                    const pr = PAGE_REVIEWS[p.pageNumber];
                    if (!pr) return null;
                    const summaryText =
                      pr.simpleWay || (pr.takeaways && pr.takeaways[0]) || '';
                    return (
                      <div
                        key={p.pageNumber}
                        style={{
                          padding: '13px 15px',
                          borderRadius: '12px',
                          background: 'var(--turquoise-bg)',
                          border: '1px solid rgba(13,148,136,0.28)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 800,
                              color: 'var(--navy)',
                              fontSize: '0.88rem',
                              marginBottom: '4px',
                            }}
                          >
                            {pr.title}
                          </div>
                          <div
                            style={{
                              fontSize: '0.84rem',
                              color: 'var(--text-primary)',
                              lineHeight: 1.68,
                            }}
                          >
                            <MarkedText text={summaryText} />
                          </div>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{padding: '5px 11px', fontSize: '0.78rem'}}
                            onClick={() =>
                              setLightbox({type: 'page-review', pageNumber: p.pageNumber})
                            }
                          >
                            مصائد وملخص الصفحة {p.pageNumber}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {reviewItems.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  background: 'var(--bg-canvas)',
                  borderRadius: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                لا توجد مواضيع محددة في هذه القائمة بعد — يمكنك حفظ أي موضوع من داخل المحاضرة أو نافذة المراجعة
              </div>
            ) : (
              reviewItems.map((it) => {
                const done = state.reviewCompletedTopics.includes(it.topic.id);
                return (
                  <div
                    key={it.topic.id}
                    style={{
                      padding: '18px',
                      borderRadius: '14px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-hairline)',
                      marginBottom: '14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        gap: '10px',
                        alignItems: 'center',
                        marginBottom: '10px',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--turquoise)',
                            fontWeight: 800,
                          }}
                        >
                          صفحة {it.page}
                        </span>
                        <div className="ltr" style={{fontWeight: 800, color: 'var(--navy)'}}>
                          {it.topic.titleEn}
                        </div>
                        <div style={{fontWeight: 700, color: 'var(--text-secondary)'}}>
                          {it.topic.titleAr}
                        </div>
                      </div>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{padding: '8px 14px', fontSize: '0.84rem'}}
                          onClick={() =>
                            setLightbox({type: 'topic-review', topicId: it.topic.id})
                          }
                        >
                          {done ? 'مكتملة — فتح المراجعة' : 'فتح بطاقات المراجعة'}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{padding: '8px 14px', fontSize: '0.84rem'}}
                          onClick={() =>
                            setLightbox({type: 'topic-quiz', topicId: it.topic.id})
                          }
                        >
                          اختبر نفسك
                        </button>
                      </div>
                    </div>

                    {it.topic.review?.simpleWay && (
                      <div
                        style={{
                          padding: '11px 14px',
                          borderRadius: '10px',
                          background: 'var(--gold-bg)',
                          border: '1px solid rgba(180,138,62,0.3)',
                          marginBottom: '10px',
                          fontSize: '0.92rem',
                          lineHeight: 1.7,
                        }}
                      >
                        <strong style={{color: 'var(--gold)'}}>أبسط طريقة تفهمها:</strong>{' '}
                        <MarkedText text={it.topic.review.simpleWay} />
                      </div>
                    )}

                    <ul
                      style={{
                        paddingRight: '18px',
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      {(it.topic.review?.focusPoints || []).map((pt, idx) => (
                        <li key={idx}>
                          <MarkedText text={pt} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </section>
        )}

        {/* View 3: Question Bank */}
        {state.currentView === 'qbank' && (
          <section className="workspace-panel">
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)'}}>
                  بنك الأسئلة الطبي الشامل
                </h2>
                <p style={{color: 'var(--text-secondary)'}}>
                  {MCQ_BANK.length} سؤال MCQ مترجم مع تحليل تفصيلي لكل خيار صح أو خطأ
                </p>
              </div>
              <div
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'var(--turquoise-bg)',
                  fontWeight: 800,
                  color: 'var(--navy)',
                }}
              >
                الإجمالي:{' '}
                <span className="tabular-nums" style={{color: 'var(--turquoise)'}}>
                  {totalCorrectCount} / {totalAnsweredCount}
                </span>{' '}
                صحيحة
              </div>
            </div>

            <div className="filter-grid">
              <select
                className="select-input"
                value={qbPageFilter}
                onChange={(e) => setQbPageFilter(e.target.value)}
              >
                <option value="all">كل الصفحات (1 - {ACADEMY_PAGES.length})</option>
                {ACADEMY_PAGES.map((p) => (
                  <option key={p.pageNumber} value={String(p.pageNumber)}>
                    صفحة {p.pageNumber}
                  </option>
                ))}
              </select>

              <select
                className="select-input"
                value={qbLevelFilter}
                onChange={(e) => setQbLevelFilter(e.target.value)}
              >
                <option value="all">كل المستويات</option>
                {Object.entries(LEVEL_AR).map(([lv, label]) => (
                  <option key={lv} value={lv}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                className="select-input"
                value={qbStatusFilter}
                onChange={(e) => setQbStatusFilter(e.target.value)}
              >
                <option value="all">كل الأسئلة</option>
                <option value="unanswered">غير المحلولة فقط</option>
                <option value="wrong">الأخطاء السابقة للمراجعة</option>
              </select>

              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setQbShuffleSeed((prev) =>
                    prev > 0 ? 0 : Math.floor(Math.random() * 10000) + 1,
                  )
                }
              >
                {qbShuffleSeed > 0 ? 'خلط عشوائي مفعل' : 'خلط عشوائي للأسئلة'}
              </button>
            </div>

            <QuizList
              questions={qbankFilteredList}
              titleContext="البنك المصفى"
              answeredMcqs={state.answeredMcqs}
              onAnswer={handleAnswerMcq}
              onResetGroup={handleResetQuizGroup}
            />
          </section>
        )}
      </main>

      <footer className="footer-bar">
        <div>
          منصة الدكتور ياسر ضياء الأسدي التفاعلية لطب وجراحة الفم والأسنان · Benign Cystic Lesions of
          the Oral Cavity
        </div>
      </footer>

      <LightboxModal
        open={lightbox !== null}
        title={lightboxTitle}
        onClose={() => setLightbox(null)}
      >
        {lightboxContent}
      </LightboxModal>

      <div
        className={`toast-banner ${toastVisible ? 'show' : ''}`}
        role="status"
        aria-live="polite"
      >
        {toastMsg}
      </div>
    </div>
  );
}
