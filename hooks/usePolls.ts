import { useState, useEffect, useCallback } from 'react';
import { Poll, ResultDot, DailyQuestionSet } from '../types';
import {
  fetchTodayPolls,
  fetchPolls,
  fetchPoll,
  fetchResults,
  submitVote,
  fetchDraftQuestions,
  generateQuestions,
  approveQuestionSet,
} from '../api/polls';

/** Fetch today's 3 live polls */
export function useTodayPolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchTodayPolls().then((data) => {
      if (mounted) {
        setPolls(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return { polls, loading };
}

/** Fetch all active polls (legacy) */
export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchPolls().then((data) => {
      if (mounted) {
        setPolls(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return { polls, loading };
}

/** Fetch a single poll by ID */
export function usePoll(id: string) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchPoll(id).then((data) => {
      if (mounted) {
        setPoll(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [id]);

  return { poll, loading };
}

/** Fetch results for a poll */
export function useResults(pollId: string) {
  const [dots, setDots] = useState<ResultDot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchResults(pollId).then((data) => {
      if (mounted) {
        setDots(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [pollId]);

  return { dots, loading };
}

/** Submit a vote */
export function useVote() {
  const [submitting, setSubmitting] = useState(false);

  const vote = async (pollId: string, x: number, y: number, selectedResponseId?: string) => {
    setSubmitting(true);
    const result = await submitVote(pollId, x, y, selectedResponseId);
    setSubmitting(false);
    return result;
  };

  return { vote, submitting };
}

// ─── Admin Hooks ──────────────────────────────────────────

/** Fetch tomorrow's draft question set */
export function useDraftQuestions() {
  const [questionSet, setQuestionSet] = useState<DailyQuestionSet | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchDraftQuestions().then((data) => {
      setQuestionSet(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { questionSet, loading, refresh };
}

/** Generate new questions for tomorrow */
export function useGenerateQuestions() {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<DailyQuestionSet | null>(null);

  const generate = async (city: string, state: string) => {
    setGenerating(true);
    const qs = await generateQuestions(city, state);
    setResult(qs);
    setGenerating(false);
    return qs;
  };

  return { generate, generating, result };
}

/** Approve a question set */
export function useApproveQuestions() {
  const [approving, setApproving] = useState(false);

  const approve = async (date: string) => {
    setApproving(true);
    const res = await approveQuestionSet(date);
    setApproving(false);
    return res;
  };

  return { approve, approving };
}
