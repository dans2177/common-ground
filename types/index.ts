export type Position = 'neutral' | 'left' | 'right' | 'extreme_left' | 'extreme_right';

export type PollScope = 'national' | 'state' | 'local';

export type PollStatus = 'draft' | 'approved' | 'live' | 'archived';

/** A custom "vibe" response that maps to a position on the diamond */
export interface CustomResponse {
  id: string;
  text: string;
  emoji: string;
  mappedPosition: { x: number; y: number }; // normalized -1 to 1
  /** Which quadrant this vibe represents */
  quadrant: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

/** Real-world context pulled from news / internet (AI-generated) */
export interface NewsContext {
  headline: string;
  source: string;
  date: string;           // e.g. 'Apr 15, 2026'
  snippet: string;        // 1-2 sentence neutral summary
  url?: string;           // optional link
  relevance: string;      // why this matters to this question
}

/** What psychologically drives people to hold this view */
export interface PerspectiveCard {
  position: Position;
  headline: string;       // short label e.g. "The Protector"
  icon: string;           // single letter for icon badge
  coreBelief: string;     // the deep value driving this view
  argument: string;       // their best-faith argument
  fear: string;           // what they're afraid of if the other side wins
  color: string;          // accent color for this card
}

export interface Poll {
  id: string;
  question: string;
  category: string;
  scope: PollScope;
  scheduledDate: string;  // ISO date e.g. '2026-04-16'
  status: PollStatus;
  generatedBy: 'ai' | 'manual';
  customResponses: CustomResponse[];
  newsContext?: NewsContext[];  // AI-pulled neutral context from news/internet
  takes: Record<Position, string>;
  perspectives: PerspectiveCard[];
  commonGround: {
    statement: string;    // the golden middle — what most people agree on
    percent: number;       // fake % agreement
    sharedValues: string[]; // 2-3 values both sides share
  };
  createdAt: string;
  voteCount: number;
}

/** A set of 3 daily questions (national + state + local) */
export interface DailyQuestionSet {
  date: string;           // ISO date e.g. '2026-04-17'
  national: Poll;
  state: Poll;
  local: Poll;
  status: 'pending' | 'approved' | 'live';
  generatedAt: string;
  generatedBy: 'ai' | 'manual';
  approvedAt?: string;
}

export interface ResultDot {
  label: string;
  color: string;
  x: number; // normalized -1 to 1
  y: number; // normalized -1 to 1
}

export interface VotePosition {
  x: number; // normalized -1 to 1 (left to right)
  y: number; // normalized -1 to 1 (moderate to extreme)
}

export type RootStackParamList = {
  Onboarding: { previewMode?: boolean } | undefined;
  Home: undefined;
  Poll: { pollId: string };
  Results: { pollId: string; voteX: number; voteY: number; selectedVibeId?: string };
  Admin: undefined;
};

// ── Onboarding ──────────────────────────────────────────

export type OnboardingAnswerType = 'spectrum' | 'pick-one' | 'pick-many' | 'binary';

export interface OnboardingOption {
  id: string;
  emoji: string;
  label: string;
  /** Segmentation weight: maps to psychological dimensions */
  weight: {
    authority?: number;      // -1 (libertarian) to 1 (authoritarian)
    economics?: number;      // -1 (left/collectivist) to 1 (right/individualist)
    change?: number;         // -1 (traditional) to 1 (progressive)
    empathy?: number;        // 0 to 1 — moral foundation: care/harm
    fairness?: number;       // 0 to 1 — moral foundation: fairness/cheating
    loyalty?: number;        // 0 to 1 — moral foundation: loyalty/betrayal
    purity?: number;         // 0 to 1 — moral foundation: sanctity/degradation
    engagement?: number;     // 0 to 1 — political engagement level
  };
}

export interface OnboardingQuestion {
  id: string;
  text: string;
  subtext?: string;
  type: OnboardingAnswerType;
  options: OnboardingOption[];
  category: 'values' | 'identity' | 'priorities' | 'style';
}

export interface OnboardingProfile {
  answers: Record<string, string | string[]>; // questionId → optionId(s)
  dimensions: {
    authority: number;
    economics: number;
    change: number;
    empathy: number;
    fairness: number;
    loyalty: number;
    purity: number;
    engagement: number;
  };
  completedAt: string;
}
