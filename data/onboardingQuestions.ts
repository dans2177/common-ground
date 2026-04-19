import { OnboardingQuestion } from '../types';

/**
 * 12 onboarding questions designed for political-psychological segmentation.
 *
 * Framework:
 *   - Moral Foundations Theory (Haidt): care, fairness, loyalty, purity
 *   - Political compass axes: authority↔liberty, collective↔individual
 *   - Change orientation: traditional↔progressive
 *   - Engagement level: passive↔activist
 *
 * Each option carries weights that accumulate into a profile.
 * Questions are ordered to feel natural — start light / identity,
 * ramp into values, end with priorities & style.
 */

const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  // ──────────────────────────────────────────────────────
  // BLOCK 1 — IDENTITY  (warm-up, low stakes, get them tapping)
  // ──────────────────────────────────────────────────────
  {
    id: 'q1_news',
    text: 'Where do you actually get your news?',
    subtext: "No judgment — pick what's real.",
    type: 'pick-one',
    category: 'identity',
    options: [
      {
        id: 'q1_tiktok',
        emoji: '📱',
        label: 'TikTok / Reels',
        weight: { change: 0.3, engagement: 0.3 },
      },
      {
        id: 'q1_twitter',
        emoji: '🐦',
        label: 'X / Twitter',
        weight: { engagement: 0.6, change: 0.1 },
      },
      {
        id: 'q1_cable',
        emoji: '📺',
        label: 'Cable news / TV',
        weight: { engagement: 0.5, change: -0.2 },
      },
      {
        id: 'q1_pod',
        emoji: '🎧',
        label: 'Podcasts',
        weight: { engagement: 0.6, change: 0.1 },
      },
      {
        id: 'q1_friends',
        emoji: '💬',
        label: 'Friends & family',
        weight: { loyalty: 0.4, engagement: 0.2 },
      },
      {
        id: 'q1_none',
        emoji: '🤷',
        label: "I don't really follow news",
        weight: { engagement: -0.3 },
      },
    ],
  },
  {
    id: 'q2_dinner',
    text: "You're at a dinner party. Politics comes up. You…",
    type: 'pick-one',
    category: 'identity',
    options: [
      {
        id: 'q2_dive',
        emoji: '🔥',
        label: 'Dive right in',
        weight: { engagement: 0.8, authority: 0.1 },
      },
      {
        id: 'q2_listen',
        emoji: '👂',
        label: 'Listen first, then talk',
        weight: { empathy: 0.5, engagement: 0.4 },
      },
      {
        id: 'q2_joke',
        emoji: '😂',
        label: 'Crack a joke & change the subject',
        weight: { engagement: 0.1, loyalty: 0.2 },
      },
      {
        id: 'q2_leave',
        emoji: '🚪',
        label: 'Excuse myself immediately',
        weight: { engagement: -0.2 },
      },
    ],
  },
  {
    id: 'q3_label',
    text: 'If you had to pick a label (even if none fit perfectly):',
    type: 'pick-one',
    category: 'identity',
    options: [
      {
        id: 'q3_liberal',
        emoji: '💙',
        label: 'Liberal / Progressive',
        weight: { economics: -0.6, change: 0.7, empathy: 0.5 },
      },
      {
        id: 'q3_conservative',
        emoji: '❤️',
        label: 'Conservative',
        weight: { economics: 0.6, change: -0.6, loyalty: 0.5, purity: 0.4 },
      },
      {
        id: 'q3_libertarian',
        emoji: '💛',
        label: 'Libertarian',
        weight: { authority: -0.8, economics: 0.5 },
      },
      {
        id: 'q3_moderate',
        emoji: '💜',
        label: 'Moderate / Independent',
        weight: { fairness: 0.3 },
      },
      {
        id: 'q3_none',
        emoji: '🖤',
        label: "None of these / Don't do labels",
        weight: { change: 0.1 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // BLOCK 2 — VALUES  (moral foundations, the real segmentation meat)
  // ──────────────────────────────────────────────────────
  {
    id: 'q4_fair',
    text: 'What does "fairness" mean to you?',
    subtext: "This one splits people more than you'd think.",
    type: 'pick-one',
    category: 'values',
    options: [
      {
        id: 'q4_equal_outcome',
        emoji: '⚖️',
        label: 'Everyone ends up with enough',
        weight: { fairness: 0.7, economics: -0.6, empathy: 0.4 },
      },
      {
        id: 'q4_equal_rules',
        emoji: '📏',
        label: 'Same rules for everyone, no exceptions',
        weight: { fairness: 0.7, authority: 0.2, economics: 0.3 },
      },
      {
        id: 'q4_earned',
        emoji: '🏆',
        label: 'You get what you earn',
        weight: { fairness: 0.4, economics: 0.7 },
      },
      {
        id: 'q4_context',
        emoji: '🔍',
        label: 'Depends on the situation honestly',
        weight: { fairness: 0.3, empathy: 0.3 },
      },
    ],
  },
  {
    id: 'q5_safety',
    text: 'A kid in your neighborhood is struggling. Whose job is it to help?',
    type: 'pick-one',
    category: 'values',
    options: [
      {
        id: 'q5_community',
        emoji: '🏘️',
        label: 'The community — we look out for each other',
        weight: { empathy: 0.6, loyalty: 0.5, economics: -0.3 },
      },
      {
        id: 'q5_government',
        emoji: '🏛️',
        label: "The government — that's what taxes are for",
        weight: { authority: 0.3, economics: -0.6, empathy: 0.4 },
      },
      {
        id: 'q5_family',
        emoji: '👨‍👩‍👧',
        label: 'Their family first',
        weight: { loyalty: 0.6, purity: 0.2, economics: 0.3 },
      },
      {
        id: 'q5_themselves',
        emoji: '💪',
        label: 'Ultimately they have to figure it out',
        weight: { authority: -0.4, economics: 0.6 },
      },
    ],
  },
  {
    id: 'q6_tradition',
    text: "When someone says 'respect your elders,' what's your gut reaction?",
    type: 'pick-one',
    category: 'values',
    options: [
      {
        id: 'q6_agree',
        emoji: '🙏',
        label: 'Facts. Wisdom comes with age.',
        weight: { authority: 0.5, loyalty: 0.6, purity: 0.3, change: -0.5 },
      },
      {
        id: 'q6_earn',
        emoji: '🤔',
        label: 'Respect is earned, not automatic',
        weight: { authority: -0.5, change: 0.4, fairness: 0.3 },
      },
      {
        id: 'q6_both',
        emoji: '🤝',
        label: 'Be respectful, but think for yourself',
        weight: { empathy: 0.3, fairness: 0.2 },
      },
      {
        id: 'q6_outdated',
        emoji: '🙄',
        label: "That's just used to shut young people up",
        weight: { authority: -0.7, change: 0.7 },
      },
    ],
  },
  {
    id: 'q7_freedom',
    text: 'You can only protect one. Which do you choose?',
    subtext: "Hard choice. That's the point.",
    type: 'pick-one',
    category: 'values',
    options: [
      {
        id: 'q7_speech',
        emoji: '🗣️',
        label: 'Freedom to say whatever you want',
        weight: { authority: -0.7, economics: 0.2 },
      },
      {
        id: 'q7_safety_val',
        emoji: '🛡️',
        label: 'Freedom from being harassed or hurt',
        weight: { empathy: 0.6, authority: 0.3, change: 0.3 },
      },
      {
        id: 'q7_opportunity',
        emoji: '🚀',
        label: 'Freedom to build your own life without barriers',
        weight: { economics: 0.5, authority: -0.3, fairness: 0.3 },
      },
      {
        id: 'q7_privacy',
        emoji: '🔒',
        label: 'Freedom to be left alone by the government',
        weight: { authority: -0.8, purity: 0.2 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // BLOCK 3 — PRIORITIES  (what do they actually care about)
  // ──────────────────────────────────────────────────────
  {
    id: 'q8_issues',
    text: 'Pick the 2-3 issues that keep you up at night.',
    subtext: 'Not what you "should" care about. What you actually do.',
    type: 'pick-many',
    category: 'priorities',
    options: [
      { id: 'q8_cost', emoji: '💸', label: 'Cost of living / rent', weight: { economics: -0.2, empathy: 0.2 } },
      { id: 'q8_climate', emoji: '🌍', label: 'Climate change', weight: { change: 0.5, empathy: 0.3 } },
      { id: 'q8_guns', emoji: '🔫', label: 'Gun violence', weight: { authority: 0.2, empathy: 0.4 } },
      { id: 'q8_rights', emoji: '✊', label: 'Civil rights / equality', weight: { change: 0.5, fairness: 0.5, empathy: 0.3 } },
      { id: 'q8_immigration', emoji: '🛂', label: 'Immigration', weight: { loyalty: 0.3, authority: 0.2 } },
      { id: 'q8_education', emoji: '📚', label: 'Education', weight: { empathy: 0.3, change: 0.1 } },
      { id: 'q8_crime', emoji: '🚨', label: 'Crime / public safety', weight: { authority: 0.4, loyalty: 0.2, purity: 0.2 } },
      { id: 'q8_jobs', emoji: '💼', label: 'Jobs / economy', weight: { economics: 0.3 } },
      { id: 'q8_health', emoji: '🏥', label: 'Healthcare', weight: { empathy: 0.4, economics: -0.3 } },
      { id: 'q8_tech', emoji: '🤖', label: 'AI / technology', weight: { change: 0.3 } },
    ],
  },
  {
    id: 'q9_taxes',
    text: 'A billionaire pays less in taxes than a teacher. Your reaction?',
    type: 'pick-one',
    category: 'priorities',
    options: [
      {
        id: 'q9_outrage',
        emoji: '🤬',
        label: "That's broken and we need to fix it NOW",
        weight: { economics: -0.8, fairness: 0.6, change: 0.4 },
      },
      {
        id: 'q9_problem',
        emoji: '😤',
        label: "Not great, but raising taxes isn't the answer",
        weight: { economics: 0.4, fairness: 0.3 },
      },
      {
        id: 'q9_fine',
        emoji: '🤷',
        label: 'They earned it, good for them',
        weight: { economics: 0.8, authority: -0.2 },
      },
      {
        id: 'q9_complex',
        emoji: '🧐',
        label: "It's more complicated than people make it sound",
        weight: { fairness: 0.2, engagement: 0.3 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // BLOCK 4 — STYLE  (how they engage, not what they believe)
  // ──────────────────────────────────────────────────────
  {
    id: 'q10_disagree',
    text: 'Your close friend posts something politically you totally disagree with. You…',
    type: 'pick-one',
    category: 'style',
    options: [
      {
        id: 'q10_confront',
        emoji: '📲',
        label: "DM them — let's talk about it",
        weight: { engagement: 0.7, empathy: 0.3, fairness: 0.2 },
      },
      {
        id: 'q10_public',
        emoji: '💥',
        label: 'Reply publicly — people need to see both sides',
        weight: { engagement: 0.8, authority: 0.2 },
      },
      {
        id: 'q10_mute',
        emoji: '🔇',
        label: 'Mute them and move on',
        weight: { engagement: 0.1 },
      },
      {
        id: 'q10_curious',
        emoji: '🤔',
        label: 'Try to understand why they think that',
        weight: { empathy: 0.7, fairness: 0.4, engagement: 0.5 },
      },
    ],
  },
  {
    id: 'q11_change',
    text: 'How do you think real change actually happens?',
    type: 'pick-one',
    category: 'style',
    options: [
      {
        id: 'q11_vote',
        emoji: '🗳️',
        label: 'Voting and elections',
        weight: { engagement: 0.5, authority: 0.2 },
      },
      {
        id: 'q11_streets',
        emoji: '✊',
        label: 'People in the streets',
        weight: { engagement: 0.8, change: 0.6, authority: -0.4 },
      },
      {
        id: 'q11_convo',
        emoji: '💬',
        label: 'One conversation at a time',
        weight: { empathy: 0.6, engagement: 0.4 },
      },
      {
        id: 'q11_money',
        emoji: '💰',
        label: 'Follow the money — economics drives everything',
        weight: { economics: 0.3, engagement: 0.4 },
      },
      {
        id: 'q11_doesnt',
        emoji: '😔',
        label: "It doesn't, honestly",
        weight: { engagement: -0.4 },
      },
    ],
  },
  {
    id: 'q12_hope',
    text: 'Last one. When you imagine the future, you feel…',
    type: 'pick-one',
    category: 'style',
    options: [
      {
        id: 'q12_hopeful',
        emoji: '🌅',
        label: 'Genuinely hopeful',
        weight: { change: 0.3, engagement: 0.4, empathy: 0.2 },
      },
      {
        id: 'q12_anxious',
        emoji: '😰',
        label: 'Anxious but trying',
        weight: { empathy: 0.3, engagement: 0.3 },
      },
      {
        id: 'q12_angry',
        emoji: '😤',
        label: 'Angry and ready to fight for it',
        weight: { engagement: 0.8, change: 0.2 },
      },
      {
        id: 'q12_numb',
        emoji: '😶',
        label: 'Numb — too much is happening',
        weight: { engagement: -0.2 },
      },
      {
        id: 'q12_build',
        emoji: '🔨',
        label: "Like it's ours to build",
        weight: { engagement: 0.6, change: 0.4, empathy: 0.2, fairness: 0.2 },
      },
    ],
  },
];

export default ONBOARDING_QUESTIONS;

/**
 * Compute a profile from answers.
 * Each dimension is averaged from the weights of selected options,
 * then clamped to [-1, 1] (or [0, 1] for moral foundations).
 */
export function computeProfile(
  answers: Record<string, string | string[]>,
): {
  authority: number;
  economics: number;
  change: number;
  empathy: number;
  fairness: number;
  loyalty: number;
  purity: number;
  engagement: number;
} {
  const dims = {
    authority: { sum: 0, count: 0 },
    economics: { sum: 0, count: 0 },
    change: { sum: 0, count: 0 },
    empathy: { sum: 0, count: 0 },
    fairness: { sum: 0, count: 0 },
    loyalty: { sum: 0, count: 0 },
    purity: { sum: 0, count: 0 },
    engagement: { sum: 0, count: 0 },
  };

  for (const question of ONBOARDING_QUESTIONS) {
    const answer = answers[question.id];
    if (!answer) continue;

    const selectedIds = Array.isArray(answer) ? answer : [answer];

    for (const optId of selectedIds) {
      const option = question.options.find((o) => o.id === optId);
      if (!option) continue;

      for (const [key, val] of Object.entries(option.weight)) {
        const dim = dims[key as keyof typeof dims];
        if (dim && val !== undefined) {
          dim.sum += val;
          dim.count += 1;
        }
      }
    }
  }

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  return {
    authority: clamp(dims.authority.count ? dims.authority.sum / dims.authority.count : 0, -1, 1),
    economics: clamp(dims.economics.count ? dims.economics.sum / dims.economics.count : 0, -1, 1),
    change: clamp(dims.change.count ? dims.change.sum / dims.change.count : 0, -1, 1),
    empathy: clamp(dims.empathy.count ? dims.empathy.sum / dims.empathy.count : 0, 0, 1),
    fairness: clamp(dims.fairness.count ? dims.fairness.sum / dims.fairness.count : 0, 0, 1),
    loyalty: clamp(dims.loyalty.count ? dims.loyalty.sum / dims.loyalty.count : 0, 0, 1),
    purity: clamp(dims.purity.count ? dims.purity.sum / dims.purity.count : 0, 0, 1),
    engagement: clamp(dims.engagement.count ? dims.engagement.sum / dims.engagement.count : 0, -1, 1),
  };
}
