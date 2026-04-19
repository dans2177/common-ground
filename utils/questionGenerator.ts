/**
 * Question generation utility.
 * Currently picks randomly from the curated question pool.
 * Designed to be swapped out for an LLM API call later.
 */
import { DailyQuestionSet, Poll } from '../types';
import { NATIONAL_POOL, STATE_POOL, LOCAL_POOL } from '../data/questionPool';

function pickRandom<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

let idCounter = Date.now();
function nextId(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Generate a set of 3 daily questions for a given city/state.
 * In production this would call an LLM. For now it picks from the curated pool.
 */
export function generateDailyQuestions(
  city: string,
  state: string,
  date: string
): DailyQuestionSet {
  const nationalTemplate = pickRandom(NATIONAL_POOL);
  const stateTemplate = pickRandom(STATE_POOL);
  const localTemplate = pickRandom(LOCAL_POOL);

  const national: Poll = {
    ...nationalTemplate,
    id: nextId('gen-national'),
    scheduledDate: date,
    status: 'draft',
    voteCount: 0,
  };

  const statePoll: Poll = {
    ...stateTemplate,
    id: nextId('gen-state'),
    scheduledDate: date,
    status: 'draft',
    voteCount: 0,
    // Customize question text with state name where applicable
    question: stateTemplate.question.replace('your state', state),
  };

  const local: Poll = {
    ...localTemplate,
    id: nextId('gen-local'),
    scheduledDate: date,
    status: 'draft',
    voteCount: 0,
    // Customize question text with city name where applicable
    question: localTemplate.question.replace('your city', city),
  };

  return {
    date,
    national,
    state: statePoll,
    local,
    status: 'pending',
    generatedAt: new Date().toISOString(),
    generatedBy: 'ai',
  };
}
