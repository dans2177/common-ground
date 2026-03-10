import { useState, useEffect } from 'react';
import { Poll, ResultDot } from '../types';
import { fetchPolls, fetchPoll, fetchResults, submitVote } from '../api/polls';

/** Fetch all active polls */
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

  const vote = async (pollId: string, x: number, y: number) => {
    setSubmitting(true);
    const result = await submitVote(pollId, x, y);
    setSubmitting(false);
    return result;
  };

  return { vote, submitting };
}
