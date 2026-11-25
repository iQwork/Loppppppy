export interface TopicSegment {
  enHtml: string;
  iqHtml: string;
}

export interface TopicReviewTerm {
  en: string;
  iq: string;
}

export interface TopicCompare {
  title: string;
  aLabel: string;
  aText: string;
  bLabel: string;
  bText: string;
}

export interface TopicReview {
  simpleWay?: string;
  focusPoints: string[];
  terms: TopicReviewTerm[];
  compare?: TopicCompare | null;
}

export interface TopicItem {
  id: string;
  indexLabel: string;
  titleEn: string;
  titleAr: string;
  simId: string;
  simMode: string;
  simTitle: string;
  segments: TopicSegment[];
  helperNote?: string;
  review: TopicReview;
}

export interface AcademyPage {
  pageNumber: number;
  titleEn: string;
  titleAr: string;
  subtitle: string;
  topics: TopicItem[];
}

export interface PageReviewItem {
  title: string;
  simpleWay?: string;
  takeaways: string[];
  traps: string[];
}

export interface McqItem {
  id: string;
  page: number;
  topicId: string;
  level: string;
  qEn: string;
  qIq: string;
  options: string[];
  optionsIq: string[];
  correctIndex: number;
  whyCorrectIq: string;
  whyWrongIq: string[];
}

export interface CameraFocus {
  cx: number;
  cy: number;
  scale: number;
}

export interface StudioScenario {
  label: string;
  activePart: string;
  focus: CameraFocus;
  duration?: number;
  seeIq: string;
  whyIq: string;
  tipIq: string;
}

export interface StudioPinPart {
  key: string;
  en: string;
  ar: string;
  posPct: [number, number];
  getPosPct?: (t: number, st: StudioRuntimeState) => [number, number];
  iq: string;
  clinical: string;
}

export interface StudioRuntimeState {
  scIdx: number;
  time: number;
  duration: number;
  playing: boolean;
  speed: number;
  activePart: string;
  showLabels: boolean;
  zoom: number;
  panX: number;
  panY: number;
}

export interface TopicStudioSpec {
  topicId: string;
  imgSrc: string;
  imgAlt: string;
  duration: number;
  scenarios: StudioScenario[];
  parts: StudioPinPart[];
  drawOverlay: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    st: StudioRuntimeState,
  ) => void;
}

export interface AcademyAppState {
  theme: 'light' | 'dark';
  currentView: 'lecture' | 'review' | 'qbank';
  currentPage: number;
  completedPages: number[];
  completedTopics: string[];
  bookmarkedTopics: string[];
  reviewCompletedTopics: string[];
  reviewHardTopics: string[];
  answeredMcqs: Record<string, {selected: number; correct: boolean; ts: number}>;
  testHistory: Array<{
    id: string;
    page: number;
    topicId: string;
    correct: boolean;
    ts: number;
  }>;
}
