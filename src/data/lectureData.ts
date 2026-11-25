import academyPagesRaw from './academyPages.json';
import pageReviewsRaw from './pageReviews.json';
import mcqBankRaw from './mcqBank.json';
import type {AcademyPage, McqItem, PageReviewItem} from '../types/academy';

export const ACADEMY_PAGES: AcademyPage[] = (academyPagesRaw as AcademyPage[]).map((page) => ({
  ...page,
  topics: page.topics.map((topic) => ({
    ...topic,
    simMode: 'media-studio',
    simTitle: topic.simTitle.replace(/محاكاة\s*3D\s*تفاعلية/g, 'استوديو بصري تفاعلي'),
  })),
}));

export const PAGE_REVIEWS: Record<number, PageReviewItem> = pageReviewsRaw as Record<
  number,
  PageReviewItem
>;

export const MCQ_BANK: McqItem[] = mcqBankRaw as McqItem[];
