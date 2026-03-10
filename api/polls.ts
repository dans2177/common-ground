/**
 * Poll API layer — currently backed by mock data.
 * Swap this file when connecting to a real backend.
 */
import { MOCK_POLLS, getMockResults } from '../data/mockData';
import { Poll, ResultDot } from '../types';

export async function fetchPolls(): Promise<Poll[]> {
  // Simulate network latency
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
  y: number
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 200));
  // In production: POST /api/polls/:id/vote { x, y }
  return { success: true };
}

export async function fetchResults(pollId: string): Promise<ResultDot[]> {
  await new Promise((r) => setTimeout(r, 250));
  return getMockResults(pollId);
}
