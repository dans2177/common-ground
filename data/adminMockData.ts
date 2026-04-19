import { Colors } from '../constants/theme';
import { DailyQuestionSet } from '../types';
import { TOMORROW_DRAFTS } from './mockData';

export interface CityQuestionSet {
  city: string;
  state: string;
  questionsReady: number;
  categories: { name: string; count: number; color: string }[];
  sampleQuestions: string[];
  avgSentiment: 'mild' | 'moderate' | 'spicy';
  localRelevance: number; // 0-100
}

export interface AdminStats {
  totalQuestionsReady: number;
  citiesCovered: number;
  aiGeneratedAt: string;
  aiModel: string;
  nextDropTime: string;
  approvalRate: number; // % questions that passed filter
  flaggedCount: number; // questions flagged as too extreme
  avgReadability: number; // 1-10
  categoryBreakdown: { name: string; count: number; color: string }[];
  dailyTrend: { day: string; questions: number; approved: number }[];
}

export const ADMIN_STATS: AdminStats = {
  totalQuestionsReady: 312,
  citiesCovered: 14,
  aiGeneratedAt: '2026-03-28T02:14:00Z',
  aiModel: 'GPT-5-turbo',
  nextDropTime: '2026-03-29T05:00:00Z',
  approvalRate: 87,
  flaggedCount: 41,
  avgReadability: 7.8,
  categoryBreakdown: [
    { name: 'Politics', count: 68, color: Colors.redTint },
    { name: 'Economy', count: 54, color: Colors.greenTint },
    { name: 'Culture', count: 47, color: Colors.purpleTint },
    { name: 'Technology', count: 39, color: Colors.blueTint },
    { name: 'Local', count: 62, color: Colors.accent },
    { name: 'Fun / Lifestyle', count: 42, color: Colors.yellowTint },
  ],
  dailyTrend: [
    { day: 'Mon', questions: 280, approved: 245 },
    { day: 'Tue', questions: 295, approved: 261 },
    { day: 'Wed', questions: 310, approved: 270 },
    { day: 'Thu', questions: 305, approved: 268 },
    { day: 'Fri', questions: 298, approved: 259 },
    { day: 'Sat', questions: 275, approved: 240 },
    { day: 'Sun', questions: 312, approved: 271 },
  ],
};

export const CITY_QUESTION_SETS: CityQuestionSet[] = [
  {
    city: 'Scottsdale',
    state: 'AZ',
    questionsReady: 28,
    categories: [
      { name: 'Local Politics', count: 6, color: Colors.redTint },
      { name: 'Lifestyle', count: 8, color: Colors.yellowTint },
      { name: 'Economy', count: 5, color: Colors.greenTint },
      { name: 'Culture', count: 5, color: Colors.purpleTint },
      { name: 'Fun', count: 4, color: Colors.accent },
    ],
    sampleQuestions: [
      'Should Scottsdale ban short-term rentals in residential neighborhoods?',
      'Is the Valley\'s water supply secure enough to keep building?',
      'Best late-night food spot: Taco Guild or Chuckbox?',
      'Should Arizona move to permanent daylight saving time?',
      'Is the Scottsdale art scene overrated or underappreciated?',
    ],
    avgSentiment: 'moderate',
    localRelevance: 92,
  },
  {
    city: 'Sioux Falls',
    state: 'SD',
    questionsReady: 22,
    categories: [
      { name: 'Local Politics', count: 5, color: Colors.redTint },
      { name: 'Agriculture', count: 6, color: Colors.greenTint },
      { name: 'Economy', count: 4, color: Colors.blueTint },
      { name: 'Culture', count: 4, color: Colors.purpleTint },
      { name: 'Fun', count: 3, color: Colors.accent },
    ],
    sampleQuestions: [
      'Should South Dakota legalize recreational marijuana?',
      'Is the meat-packing industry doing enough for worker safety?',
      'Falls Park vs. Good Earth State Park for a weekend hike?',
      'Should Sioux Falls invest more in public transit?',
      'Are property taxes fair for what you get in services?',
    ],
    avgSentiment: 'mild',
    localRelevance: 88,
  },
  {
    city: 'Austin',
    state: 'TX',
    questionsReady: 31,
    categories: [
      { name: 'Tech Industry', count: 8, color: Colors.blueTint },
      { name: 'Politics', count: 7, color: Colors.redTint },
      { name: 'Culture', count: 6, color: Colors.purpleTint },
      { name: 'Housing', count: 5, color: Colors.greenTint },
      { name: 'Fun', count: 5, color: Colors.accent },
    ],
    sampleQuestions: [
      'Is Austin losing its soul to tech money?',
      'Should Texas reform its power grid before another freeze?',
      'Best breakfast taco: Veracruz or Valentina\'s?',
      'Should Austin cap rent increases in the downtown core?',
      'Is SXSW still relevant or just a corporate playground?',
    ],
    avgSentiment: 'spicy',
    localRelevance: 95,
  },
  {
    city: 'Portland',
    state: 'OR',
    questionsReady: 24,
    categories: [
      { name: 'Homelessness', count: 6, color: Colors.redTint },
      { name: 'Environment', count: 6, color: Colors.greenTint },
      { name: 'Culture', count: 5, color: Colors.purpleTint },
      { name: 'Economy', count: 4, color: Colors.blueTint },
      { name: 'Fun', count: 3, color: Colors.accent },
    ],
    sampleQuestions: [
      'Is Portland\'s approach to homelessness working?',
      'Should Oregon ban all single-use plastics?',
      'Powell\'s Books vs. a Kindle — which side are you on?',
      'Is the restaurant scene recovering post-pandemic?',
      'Should Portland bring back the arts tax?',
    ],
    avgSentiment: 'spicy',
    localRelevance: 90,
  },
  {
    city: 'Miami',
    state: 'FL',
    questionsReady: 26,
    categories: [
      { name: 'Climate', count: 7, color: Colors.blueTint },
      { name: 'Housing', count: 6, color: Colors.greenTint },
      { name: 'Culture', count: 5, color: Colors.purpleTint },
      { name: 'Politics', count: 4, color: Colors.redTint },
      { name: 'Fun', count: 4, color: Colors.accent },
    ],
    sampleQuestions: [
      'Should Miami require all new buildings to be hurricane-proof?',
      'Is the crypto/tech influx good or bad for locals?',
      'Best Cuban coffee: Versailles or La Carreta?',
      'Should Florida expand Medicaid?',
      'Is Miami Beach too commercialized to enjoy anymore?',
    ],
    avgSentiment: 'moderate',
    localRelevance: 91,
  },
];

export const FAKE_POLLING_RESULTS = {
  totalVotesToday: 47832,
  peakHour: '8:00 PM EST',
  avgTimeToVote: '12s',
  completionRate: 73, // % of users who voted on all polls
  mostEngaged: 'Austin, TX',
  leastEngaged: 'Sioux Falls, SD',
  topQuestion: 'Should the US continue its military campaign against Iran?',
  topQuestionVotes: 14832,
  sentimentDistribution: {
    left: 31,
    centerLeft: 18,
    center: 24,
    centerRight: 16,
    right: 11,
  },
};

// ═══════════════════════════════════════════════════════════════════
// PENDING QUESTION SET (for admin generate/approve flow)
// ═══════════════════════════════════════════════════════════════════

export const PENDING_QUESTION_SET: DailyQuestionSet = TOMORROW_DRAFTS;
