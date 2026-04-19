/**
 * Poll API layer — currently backed by mock data.
 * Swap this file when connecting to a real backend.
 */
import { MOCK_POLLS, getTodayPolls, getMockResults, TOMORROW_DRAFTS } from '../data/mockData';
import { Poll, ResultDot, DailyQuestionSet } from '../types';
import { generateDailyQuestions } from '../utils/questionGenerator';

/** Fetch today's 3 live polls (national + state + local) */
export async function fetchTodayPolls(): Promise<Poll[]> {
  await new Promise((r) => setTimeout(r, 300));
  return getTodayPolls();
}

/** Fetch all polls (legacy — kept for backwards compat) */
export async function fetchPolls(): Promise<Poll[]> {
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_POLLS;
}

export async function fetchPoll(id: string): Promise<Poll | null> {
  await new Promise((r) => setTimeout(r, 150));
  return MOCK_POLLS.find((p) => p.id === id) ?? null;
}

export async function submitVote(
  pollId: string,
  x: number,
  y: number,
  selectedResponseId?: string
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 200));
  // In production: POST /api/polls/:id/vote { x, y, selectedResponseId }
  return { success: true };
}

export async function fetchResults(pollId: string): Promise<ResultDot[]> {
  await new Promise((r) => setTimeout(r, 250));
  return getMockResults(pollId);
}

// ─── Admin API ────────────────────────────────────────────

/** Fetch tomorrow's draft question set (if any) */
export async function fetchDraftQuestions(): Promise<DailyQuestionSet | null> {
  await new Promise((r) => setTimeout(r, 200));
  return TOMORROW_DRAFTS;
}

/** Generate a new question set for the given date */
export async function generateQuestions(
  city: string,
  state: string
): Promise<DailyQuestionSet> {
  await new Promise((r) => setTimeout(r, 800)); // simulate AI generation time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toISOString().split('T')[0];
  return generateDailyQuestions(city, state, date);
}

/** Approve a question set, marking it ready for publishing */
export async function approveQuestionSet(
  date: string
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 300));
  // In production: PATCH /api/admin/questions/:date { status: 'approved' }
  return { success: true };
}
