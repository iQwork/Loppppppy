import type {TopicStudioSpec} from '../types/academy';
import {STUDIO_SPECS_PART1} from './studioSpecsPart1';
import {STUDIO_SPECS_PART2} from './studioSpecsPart2';

export const STUDIO_SPECS: Record<string, TopicStudioSpec> = {
  ...STUDIO_SPECS_PART1,
  ...STUDIO_SPECS_PART2,
};
