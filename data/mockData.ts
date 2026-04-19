import { Poll, ResultDot, DailyQuestionSet } from '../types';
import { Colors } from '../constants/theme';
import { NATIONAL_POOL, STATE_POOL, LOCAL_POOL } from './questionPool';

// Helper — today/tomorrow as ISO date strings
const TODAY = new Date().toISOString().split('T')[0]; // e.g. '2026-04-16'
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const TOMORROW = tomorrow.toISOString().split('T')[0];

// ═══════════════════════════════════════════════════════════════════
// TODAY'S 3 LIVE POLLS (national + state + local)
// ═══════════════════════════════════════════════════════════════════

export const MOCK_POLLS: Poll[] = [
  {
    ...NATIONAL_POOL[0], // "How do you feel about people using racial slurs?"
    id: 'today-national',
    scheduledDate: TODAY,
    status: 'live',
    voteCount: 14832,
  },
  {
    ...STATE_POOL[0], // "Should your state legalize recreational marijuana?"
    id: 'today-state',
    scheduledDate: TODAY,
    status: 'live',
    voteCount: 8214,
  },
  {
    ...LOCAL_POOL[1], // "Should your city invest more in public transit or road expansion?"
    id: 'today-local',
    scheduledDate: TODAY,
    status: 'live',
    voteCount: 5103,
  },
];

// ═══════════════════════════════════════════════════════════════════
// TOMORROW'S DRAFT QUESTIONS (for admin approval flow)
// ═══════════════════════════════════════════════════════════════════

export const TOMORROW_DRAFTS: DailyQuestionSet = {
  date: TOMORROW,
  national: {
    ...NATIONAL_POOL[1], // "How do you feel about the war in the Middle East?"
    id: 'draft-national',
    scheduledDate: TOMORROW,
    status: 'draft',
    voteCount: 0,
  },
  state: {
    ...STATE_POOL[2], // "Is your state doing enough to prepare for climate-related disasters?"
    id: 'draft-state',
    scheduledDate: TOMORROW,
    status: 'draft',
    voteCount: 0,
  },
  local: {
    ...LOCAL_POOL[3], // "Is the homeless situation in your city being handled well?"
    id: 'draft-local',
    scheduledDate: TOMORROW,
    status: 'draft',
    voteCount: 0,
  },
  status: 'pending',
  generatedAt: new Date().toISOString(),
  generatedBy: 'ai',
};

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

export const getTodayPolls = (): Poll[] =>
  MOCK_POLLS.filter((p) => p.status === 'live' && p.scheduledDate === TODAY);

export const getMockResults = (pollId: string): ResultDot[] => [
  { label: 'Your Vote', color: Colors.dotYou, x: 0, y: 0 }, // will be overridden
  { label: 'Friends Avg', color: Colors.dotFriends, x: -0.15, y: 0.1 },
  { label: 'Phoenix Avg', color: Colors.dotCity, x: 0.05, y: -0.12 },
  { label: 'Arizona Avg', color: Colors.dotState, x: 0.18, y: -0.05 },
  { label: 'USA Avg', color: Colors.dotUSA, x: 0.08, y: 0.02 },
  { label: 'World Avg', color: Colors.dotWorld, x: -0.22, y: 0.08 },
];

export const getPollById = (id: string): Poll | undefined =>
  MOCK_POLLS.find((p) => p.id === id);
