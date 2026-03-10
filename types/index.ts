export type Position = 'neutral' | 'left' | 'right' | 'extreme_left' | 'extreme_right';

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
  Home: undefined;
  Poll: { pollId: string };
  Results: { pollId: string; voteX: number; voteY: number };
};
