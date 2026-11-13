import {
  BreathingProtocol,
  CheckInFocus,
  DailyCheckIn,
  DailyPromptQuestion,
  DimensionScores,
  MindfulnessPractice,
  MindfulnessSessionLog,
  MoodState,
  QuestionAnswers,
  WheelDimension,
  WheelDimensionId,
  WheelQuestion,
  WheelSnapshot,
} from '../types';

export const WHEEL_DIMENSIONS: WheelDimension[] = [
  {
    id: 'career',
    label: 'Career & Purpose',
    shortLabel: 'Career',
    description: 'Alignment, meaningful contribution, and sustainable pace in your daily work.',
  },
  {
    id: 'health',
    label: 'Health & Vitality',
    shortLabel: 'Health',
    description: 'Physical energy, sleep quality, nourishment, and regular movement.',
  },
  {
    id: 'relationships',
    label: 'Relationships & Love',
    shortLabel: 'Relationships',
    description: 'Connection, trust, warmth, and honest communication with people who matter.',
  },
  {
    id: 'growth',
    label: 'Personal Growth',
    shortLabel: 'Growth',
    description: 'Curiosity, learning new skills, and stepping gently beyond familiar routines.',
  },
  {
    id: 'finances',
    label: 'Finances & Security',
    shortLabel: 'Finances',
    description: 'Clarity around spending, savings resilience, and freedom from financial worry.',
  },
  {
    id: 'creativity',
    label: 'Fun & Creativity',
    shortLabel: 'Creativity',
    description: 'Play, unhurried hobbies, aesthetic joy, and making things without pressure.',
  },
  {
    id: 'mindfulness',
    label: 'Rest & Mindfulness',
    shortLabel: 'Mindfulness',
    description: 'Inner quiet, emotional regulation, screen-free pauses, and true mental recovery.',
  },
  {
    id: 'environment',
    label: 'Environment & Home',
    shortLabel: 'Environment',
    description: 'Order, light, comfort, and calm in the physical spaces where you spend your time.',
  },
];

export const WHEEL_QUESTIONS: WheelQuestion[] = [
  {
    id: 'career_1',
    dimensionId: 'career',
    prompt: 'How meaningful and engaging does your day-to-day work or vocation feel right now?',
    lowAnchor: 'Draining',
    highAnchor: 'Deeply purposeful',
  },
  {
    id: 'career_2',
    dimensionId: 'career',
    prompt: 'Do your daily responsibilities leave space for focused work without constant burnout?',
    lowAnchor: 'Overloaded',
    highAnchor: 'Sustainable pace',
  },
  {
    id: 'career_3',
    dimensionId: 'career',
    prompt: 'How clear are you on the next step in your professional or purposeful direction?',
    lowAnchor: 'Foggy',
    highAnchor: 'Clear direction',
  },
  {
    id: 'health_1',
    dimensionId: 'health',
    prompt: 'How rested do you feel when you wake up most mornings?',
    lowAnchor: 'Depleted',
    highAnchor: 'Restored',
  },
  {
    id: 'health_2',
    dimensionId: 'health',
    prompt: 'How consistently are you moving your body and nourishing yourself with steady energy?',
    lowAnchor: 'Neglected',
    highAnchor: 'Consistent care',
  },
  {
    id: 'health_3',
    dimensionId: 'health',
    prompt: 'How attentively do you respond when your body signals fatigue or tension?',
    lowAnchor: 'Push through',
    highAnchor: 'Listen & adjust',
  },
  {
    id: 'relationships_1',
    dimensionId: 'relationships',
    prompt: 'How deeply connected and understood do you feel in your closest relationships?',
    lowAnchor: 'Distant',
    highAnchor: 'Close & supported',
  },
  {
    id: 'relationships_2',
    dimensionId: 'relationships',
    prompt: 'Are you protecting unhurried, phone-free time for friends, family, or community?',
    lowAnchor: 'Rarely',
    highAnchor: 'Regularly',
  },
  {
    id: 'relationships_3',
    dimensionId: 'relationships',
    prompt: 'How comfortable do you feel expressing boundaries and honest needs with others?',
    lowAnchor: 'Guarded',
    highAnchor: 'Open & grounded',
  },
  {
    id: 'growth_1',
    dimensionId: 'growth',
    prompt: 'How often are you learning something new or stretching your thinking with curiosity?',
    lowAnchor: 'Stagnant',
    highAnchor: 'Actively curious',
  },
  {
    id: 'growth_2',
    dimensionId: 'growth',
    prompt: 'Are you reading, reflecting, or practicing skills that matter to your long-term self?',
    lowAnchor: 'On hold',
    highAnchor: 'Steady rhythm',
  },
  {
    id: 'growth_3',
    dimensionId: 'growth',
    prompt: 'How kind and constructive is your self-talk when you make a mistake or face uncertainty?',
    lowAnchor: 'Self-critical',
    highAnchor: 'Compassionate',
  },
  {
    id: 'finances_1',
    dimensionId: 'finances',
    prompt: 'How calm and informed do you feel when you look at your current finances?',
    lowAnchor: 'Anxious',
    highAnchor: 'Clear & steady',
  },
  {
    id: 'finances_2',
    dimensionId: 'finances',
    prompt: 'Are your spending habits aligned with what truly brings stability and value to your life?',
    lowAnchor: 'Unplanned',
    highAnchor: 'Intentional',
  },
  {
    id: 'finances_3',
    dimensionId: 'finances',
    prompt: 'How confident are you in your buffer for unexpected expenses or future plans?',
    lowAnchor: 'Vulnerable',
    highAnchor: 'Well cushioned',
  },
  {
    id: 'creativity_1',
    dimensionId: 'creativity',
    prompt: 'How much room is in your week for play, music, art, or hobbies with no productivity goal?',
    lowAnchor: 'None',
    highAnchor: 'Abundant',
  },
  {
    id: 'creativity_2',
    dimensionId: 'creativity',
    prompt: 'When was the last time you felt absorbed in making, exploring, or laughing freely?',
    lowAnchor: 'Weeks ago',
    highAnchor: 'This week',
  },
  {
    id: 'creativity_3',
    dimensionId: 'creativity',
    prompt: 'Do you allow yourself creative exploration without judging the result too quickly?',
    lowAnchor: 'Perfectionist',
    highAnchor: 'Playful & free',
  },
  {
    id: 'mindfulness_1',
    dimensionId: 'mindfulness',
    prompt: 'How easily can you quiet mental noise and be present in ordinary moments?',
    lowAnchor: 'Restless',
    highAnchor: 'Present & calm',
  },
  {
    id: 'mindfulness_2',
    dimensionId: 'mindfulness',
    prompt: 'Do you take intentional pauses during the day before stress accumulates?',
    lowAnchor: 'Rarely pause',
    highAnchor: 'Steady pauses',
  },
  {
    id: 'mindfulness_3',
    dimensionId: 'mindfulness',
    prompt: 'How well are you protecting evening wind-down time away from work and feeds?',
    lowAnchor: 'Always on',
    highAnchor: 'Protected rest',
  },
  {
    id: 'environment_1',
    dimensionId: 'environment',
    prompt: 'Does your living and working space feel uncluttered, welcoming, and calm?',
    lowAnchor: 'Chaotic',
    highAnchor: 'Restorative',
  },
  {
    id: 'environment_2',
    dimensionId: 'environment',
    prompt: 'How often do you spend time in natural light, fresh air, or green spaces?',
    lowAnchor: 'Indoors mostly',
    highAnchor: 'Daily outdoors',
  },
  {
    id: 'environment_3',
    dimensionId: 'environment',
    prompt: 'Does your immediate physical environment support the habits you want to nurture?',
    lowAnchor: 'Creates friction',
    highAnchor: 'Supports ease',
  },
];

export const DAILY_ACTIVITIES = [
  'Movement & Walk',
  'Deep Focus',
  'Time Outdoors',
  'Social Connection',
  'Creative Play',
  'Quiet Reading',
  'Screen-Free Evening',
  'Restful Sleep',
  'Mindful Breathwork',
  'Home Reset',
];

export const DAILY_PROMPT_POOL: DailyPromptQuestion[] = [
  {
    id: 'dp_feeling_1',
    category: CheckInFocus.FEELING,
    prompt: 'What emotion lingered longest with you today, and where did you notice it physically?',
    placeholder: 'e.g., Quiet relief after finishing a long-delayed call...',
    linkedDimensionId: 'mindfulness',
  },
  {
    id: 'dp_feeling_2',
    category: CheckInFocus.FEELING,
    prompt: 'What gave you a genuine sense of ease or steadiness over the last 24 hours?',
    placeholder: 'e.g., Ten unhurried minutes in morning light before checking messages...',
    linkedDimensionId: 'health',
  },
  {
    id: 'dp_feeling_3',
    category: CheckInFocus.FEELING,
    prompt: 'Was there a moment today when you felt stretched thin? What was asking for your energy?',
    placeholder: 'e.g., Too many context switches right after lunch...',
    linkedDimensionId: 'career',
  },
  {
    id: 'dp_goal_1',
    category: CheckInFocus.GOAL,
    prompt: 'Which single small action today would make tomorrow feel noticeably lighter?',
    placeholder: 'e.g., Closing two open tabs and outlining Thursday’s priorities...',
    linkedDimensionId: 'career',
  },
  {
    id: 'dp_goal_2',
    category: CheckInFocus.GOAL,
    prompt: 'What boundary or gentle commitment do you want to protect this evening?',
    placeholder: 'e.g., Leaving my phone on the charger outside the bedroom at 10 PM...',
    linkedDimensionId: 'mindfulness',
  },
  {
    id: 'dp_goal_3',
    category: CheckInFocus.GOAL,
    prompt: 'Thinking of your lowest Wheel of Life area, what is one 10-minute step you could take today?',
    placeholder: 'e.g., Sketching for ten minutes without expecting a finished piece...',
    linkedDimensionId: 'creativity',
  },
  {
    id: 'dp_activity_1',
    category: 'Activity',
    prompt: 'Which recent activity left you feeling more grounded or energized afterward?',
    placeholder: 'e.g., A slow walk after lunch with no headphones...',
    linkedDimensionId: 'health',
  },
  {
    id: 'dp_activity_2',
    category: 'Activity',
    prompt: 'Did you have a meaningful conversation or shared moment with someone recently?',
    placeholder: 'e.g., Caught up with my sister over tea...',
    linkedDimensionId: 'relationships',
  },
  {
    id: 'dp_activity_3',
    category: 'Activity',
    prompt: 'How did your physical surroundings (workspace, light, clutter) affect your focus today?',
    placeholder: 'e.g., Clearing my desk before starting made concentration much easier...',
    linkedDimensionId: 'environment',
  },
  {
    id: 'dp_idea_1',
    category: CheckInFocus.IDEA,
    prompt: 'What small habit experiment or fresh idea has been quietly tugging at your curiosity?',
    placeholder: 'e.g., Keeping Friday mornings free of recurring meetings...',
    linkedDimensionId: 'growth',
  },
  {
    id: 'dp_idea_2',
    category: CheckInFocus.IDEA,
    prompt: 'What could you simplify or delegate this week to reclaim breathing room?',
    placeholder: 'e.g., Automating two recurring bill transfers and simplifying dinner prep...',
    linkedDimensionId: 'finances',
  },
  {
    id: 'dp_idea_3',
    category: CheckInFocus.IDEA,
    prompt: 'If you had an unscheduled hour strictly for play or curiosity, how would you spend it?',
    placeholder: 'e.g., Visiting the botanical conservatory or baking sourdough...',
    linkedDimensionId: 'creativity',
  },
];

export function selectDailyPrompts(dateISO: string, salt = 0, count = 4): DailyPromptQuestion[] {
  // Deterministic daily seed with optional shuffle salt
  let hash = salt * 2654435761;
  for (let i = 0; i < dateISO.length; i++) {
    hash = (hash * 31 + dateISO.charCodeAt(i)) >>> 0;
  }

  // Ensure balanced coverage across Feeling, Goal, Activity, Idea
  const byCategory: Record<string, DailyPromptQuestion[]> = {
    Feeling: DAILY_PROMPT_POOL.filter((q) => q.category === CheckInFocus.FEELING),
    Goal: DAILY_PROMPT_POOL.filter((q) => q.category === CheckInFocus.GOAL),
    Activity: DAILY_PROMPT_POOL.filter((q) => q.category === 'Activity'),
    Idea: DAILY_PROMPT_POOL.filter((q) => q.category === CheckInFocus.IDEA),
  };

  const picks: DailyPromptQuestion[] = [];
  const categories = ['Feeling', 'Goal', 'Activity', 'Idea'];
  categories.forEach((cat, idx) => {
    const list = byCategory[cat];
    if (list.length > 0) {
      const pickIdx = (hash + idx * 7 + salt * (idx + 3)) % list.length;
      picks.push(list[pickIdx]);
    }
  });

  return picks.slice(0, count);
}

export const MOOD_META: Record<
  MoodState,
  {
    label: string;
    description: string;
    color: string;
    softBg: string;
    borderColor: string;
    valence: number;
  }
> = {
  [MoodState.GROUNDED]: {
    label: 'Grounded',
    description: 'Calm, present, and emotionally steady',
    color: '#2D6A5E',
    softBg: '#E6F0EC',
    borderColor: '#B8D4CA',
    valence: 4.6,
  },
  [MoodState.ENERGIZED]: {
    label: 'Energized',
    description: 'Clear-headed, motivated, and optimistic',
    color: '#346E7A',
    softBg: '#E5EFF2',
    borderColor: '#B5CFD6',
    valence: 4.8,
  },
  [MoodState.REFLECTIVE]: {
    label: 'Reflective',
    description: 'Quiet, thoughtful, and inward-looking',
    color: '#4B6382',
    softBg: '#E8EDF3',
    borderColor: '#C1CDDB',
    valence: 3.6,
  },
  [MoodState.UNCERTAIN]: {
    label: 'Uncertain',
    description: 'Tender, foggy, or seeking clarity',
    color: '#736A8C',
    softBg: '#EFEDF4',
    borderColor: '#CFC9DE',
    valence: 2.5,
  },
  [MoodState.STRETCHED]: {
    label: 'Stretched',
    description: 'Tense, tired, or carrying too much at once',
    color: '#94625A',
    softBg: '#F4EAE8',
    borderColor: '#DEC2BD',
    valence: 2.0,
  },
};

export const BREATHING_PROTOCOLS: BreathingProtocol[] = [
  {
    id: 'calm_478',
    name: '4-7-8 Evening Calm',
    subtitle: 'Slows heart rate and quiets racing thoughts',
    inhaleSec: 4,
    holdSec: 7,
    exhaleSec: 8,
    holdAfterExhaleSec: 0,
    recommendedFor: 'Stretched or Uncertain moods',
  },
  {
    id: 'box_4444',
    name: 'Box Breathing (4-4-4-4)',
    subtitle: 'Restores steady focus before deep work or decisions',
    inhaleSec: 4,
    holdSec: 4,
    exhaleSec: 4,
    holdAfterExhaleSec: 4,
    recommendedFor: 'Reflective or busy days',
  },
  {
    id: 'coherent_55',
    name: 'Coherent Breath (5-5)',
    subtitle: 'Balances autonomic rhythm in two quiet minutes',
    inhaleSec: 5,
    holdSec: 0,
    exhaleSec: 5,
    holdAfterExhaleSec: 0,
    recommendedFor: 'Grounded maintenance',
  },
];

export const DEFAULT_QUESTION_ANSWERS: QuestionAnswers = {
  career_1: 7,
  career_2: 6,
  career_3: 7,
  health_1: 6,
  health_2: 7,
  health_3: 6,
  relationships_1: 8,
  relationships_2: 7,
  relationships_3: 8,
  growth_1: 7,
  growth_2: 6,
  growth_3: 7,
  finances_1: 6,
  finances_2: 7,
  finances_3: 6,
  creativity_1: 5,
  creativity_2: 4,
  creativity_3: 6,
  mindfulness_1: 5,
  mindfulness_2: 5,
  mindfulness_3: 6,
  environment_1: 8,
  environment_2: 6,
  environment_3: 7,
};

export function computeDimensionScores(answers: QuestionAnswers): DimensionScores {
  const result = {} as DimensionScores;
  for (const dim of WHEEL_DIMENSIONS) {
    const dimQuestions = WHEEL_QUESTIONS.filter((q) => q.dimensionId === dim.id);
    const sum = dimQuestions.reduce((acc, q) => acc + (answers[q.id] ?? 5), 0);
    result[dim.id] = Number((sum / dimQuestions.length).toFixed(1));
  }
  return result;
}

export function createSampleSnapshots(): WheelSnapshot[] {
  const prevAnswers: QuestionAnswers = {
    ...DEFAULT_QUESTION_ANSWERS,
    career_1: 6,
    career_2: 5,
    health_1: 5,
    health_2: 5,
    creativity_1: 4,
    creativity_2: 4,
    mindfulness_1: 4,
    mindfulness_2: 4,
    environment_1: 7,
  };
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
  const today = new Date().toISOString();

  return [
    {
      id: 'snap_seed_1',
      createdAt: twoWeeksAgo,
      answers: prevAnswers,
      scores: computeDimensionScores(prevAnswers),
      note: 'Baseline reflection — noticed creative play and mindfulness needed gentler boundaries.',
    },
    {
      id: 'snap_seed_2',
      createdAt: today,
      answers: DEFAULT_QUESTION_ANSWERS,
      scores: computeDimensionScores(DEFAULT_QUESTION_ANSWERS),
      note: 'Steady progress in relationships and home calm; still carving out time for unhurried rest.',
    },
  ];
}

function isoDaysAgo(days: number): { dateISO: string; createdAt: string } {
  const d = new Date(Date.now() - days * 86400000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return {
    dateISO: `${year}-${month}-${day}`,
    createdAt: d.toISOString(),
  };
}

export function createSampleCheckIns(): DailyCheckIn[] {
  const entries: Array<{
    daysAgo: number;
    mood: MoodState;
    moodIntensity: number;
    energy: number;
    stress: number;
    focusType: CheckInFocus;
    feelingNote: string;
    ideaNote: string;
    goalText: string;
    linkedDimensionId: WheelDimensionId;
    activities: string[];
    wheelBalanceAtCheckIn: number;
    tips: Array<{ title: string; detail: string; completed: boolean }>;
    mindfulness: MindfulnessPractice;
    reflectionNote: string;
  }> = [
    // Historical entries across the past year (300d, 210d, 140d, 75d, 25d, 18d, and recent 11d -> 1d)
    {
      daysAgo: 310,
      mood: MoodState.REFLECTIVE,
      moodIntensity: 3,
      energy: 3,
      stress: 3,
      focusType: CheckInFocus.IDEA,
      feelingNote: 'Early-year reset; looking for calmer structure across work and home.',
      ideaNote: 'Block one quiet hour each Sunday to review priorities.',
      goalText: 'Create a simple weekly planning ritual with tea.',
      linkedDimensionId: 'growth',
      activities: ['Quiet Reading', 'Home Reset'],
      wheelBalanceAtCheckIn: 5.8,
      tips: [
        { title: 'Pick a fixed 20-minute window', detail: 'Sunday late afternoon works well before Monday noise begins.', completed: true },
        { title: 'Keep notes on one index card', detail: 'Limit weekly focus to three realistic outcomes.', completed: true },
        { title: 'Pair with a warm drink', detail: 'Associate planning with calm rather than urgency.', completed: true },
      ],
      mindfulness: {
        title: 'Intentional Breath Arrival',
        category: 'Breathwork',
        durationMinutes: 4,
        targetDimension: 'Personal Growth',
        whyItFits: 'Transitions your attention into reflective planning.',
        steps: ['Sit upright comfortably.', 'Exhale fully for 6 seconds.', 'Repeat five cycles before writing.'],
      },
      reflectionNote: 'Steady rituals outlast intense bursts of motivation.',
    },
    {
      daysAgo: 225,
      mood: MoodState.STRETCHED,
      moodIntensity: 4,
      energy: 2,
      stress: 4,
      focusType: CheckInFocus.FEELING,
      feelingNote: 'Heavy workload compressed sleep and evening recovery.',
      ideaNote: 'Protect midday outdoor walks even when inbox volume spikes.',
      goalText: 'Step outside for 15 minutes at lunch without phone notifications.',
      linkedDimensionId: 'health',
      activities: ['Deep Focus'],
      wheelBalanceAtCheckIn: 5.4,
      tips: [
        { title: 'Put lunch walk on calendar', detail: 'Treat a 15-minute daylight break as non-negotiable.', completed: true },
        { title: 'Leave earbuds on desk', detail: 'Let eyes rest on natural distance.', completed: false },
        { title: 'Drink water on return', detail: 'Rehydrate before opening messages.', completed: true },
      ],
      mindfulness: {
        title: 'Midday Shoulder Drop',
        category: 'Body Scan',
        durationMinutes: 3,
        targetDimension: 'Health & Vitality',
        whyItFits: 'Releases accumulated desk tension.',
        steps: ['Drop shoulders down.', 'Soften jaw.', 'Take four long exhales.'],
      },
      reflectionNote: 'Brief daylight breaks prevent afternoon stress from compounding.',
    },
    {
      daysAgo: 145,
      mood: MoodState.GROUNDED,
      moodIntensity: 4,
      energy: 4,
      stress: 2,
      focusType: CheckInFocus.GOAL,
      feelingNote: 'Steady energy after two weeks of earlier bedtimes and evening walks.',
      ideaNote: 'Keep creative reading beside the bed instead of devices.',
      goalText: 'Read 15 pages of fiction before sleep five nights this week.',
      linkedDimensionId: 'creativity',
      activities: ['Movement & Walk', 'Quiet Reading', 'Restful Sleep'],
      wheelBalanceAtCheckIn: 6.4,
      tips: [
        { title: 'Place book on pillow', detail: 'Make the calming choice the easiest one.', completed: true },
        { title: 'Plug phone in kitchen', detail: 'Remove late-night scroll temptation.', completed: true },
        { title: 'Dim bedroom lamp early', detail: 'Cue natural melatonin rhythm.', completed: true },
      ],
      mindfulness: {
        title: 'Evening Unwind Scan',
        category: 'Body Scan',
        durationMinutes: 5,
        targetDimension: 'Fun & Creativity',
        whyItFits: 'Deepens evening restoration.',
        steps: ['Relax forehead and eyes.', 'Notice weight of blanket.', 'Breathe gently.'],
      },
      reflectionNote: 'Small environmental cues quietly sustain better sleep.',
    },
    {
      daysAgo: 80,
      mood: MoodState.ENERGIZED,
      moodIntensity: 5,
      energy: 5,
      stress: 2,
      focusType: CheckInFocus.GOAL,
      feelingNote: 'Energized after hiking with close friends and clearing creative backlog.',
      ideaNote: 'Plan a monthly outdoor day trip to stay connected to nature.',
      goalText: 'Schedule next month’s trail walk with friends this week.',
      linkedDimensionId: 'relationships',
      activities: ['Time Outdoors', 'Social Connection', 'Movement & Walk'],
      wheelBalanceAtCheckIn: 6.9,
      tips: [
        { title: 'Send two weekend options', detail: 'Lock a date while momentum is warm.', completed: true },
        { title: 'Keep route accessible', detail: 'Choose an easy-paced trail so conversation flows.', completed: true },
        { title: 'Pack shared thermos', detail: 'Add a simple warm pause halfway.', completed: false },
      ],
      mindfulness: {
        title: 'Open Horizon Noticing',
        category: 'Grounding',
        durationMinutes: 4,
        targetDimension: 'Relationships & Love',
        whyItFits: 'Anchors feelings of warmth and spaciousness.',
        steps: ['Recall a favorite moment outdoors.', 'Breathe smoothly for 4 cycles.', 'Carry that ease forward.'],
      },
      reflectionNote: 'Combining nature and connection consistently lifts your entire balance wheel.',
    },
    {
      daysAgo: 26,
      mood: MoodState.UNCERTAIN,
      moodIntensity: 3,
      energy: 3,
      stress: 4,
      focusType: CheckInFocus.FEELING,
      feelingNote: 'Financial planning review felt slightly overwhelming at first.',
      ideaNote: 'Break monthly budget check-in into a calm 15-minute Friday routine.',
      goalText: 'Automate monthly savings transfer so decisions feel effortless.',
      linkedDimensionId: 'finances',
      activities: ['Deep Focus'],
      wheelBalanceAtCheckIn: 6.1,
      tips: [
        { title: 'Set a 15-minute timer', detail: 'Keep financial check-ins bounded and predictable.', completed: true },
        { title: 'Automate one recurring transfer', detail: 'Reduce recurring willpower friction.', completed: true },
        { title: 'Celebrate clarity', detail: 'Acknowledge every honest look at the numbers.', completed: true },
      ],
      mindfulness: {
        title: 'Calm Clarity Ledger Pause',
        category: 'Grounding',
        durationMinutes: 4,
        targetDimension: 'Finances & Security',
        whyItFits: 'Steadies nervous energy around numbers.',
        steps: ['Take 4 calm breaths.', 'Focus on one concrete fact.', 'Release perfectionism.'],
      },
      reflectionNote: 'Clarity removes far more anxiety than perfection ever does.',
    },
    {
      daysAgo: 18,
      mood: MoodState.GROUNDED,
      moodIntensity: 4,
      energy: 4,
      stress: 2,
      focusType: CheckInFocus.IDEA,
      feelingNote: 'Felt calm after tidying studio corner and making time for sketching.',
      ideaNote: 'Keep sketchpad open on the side table for 10-minute breaks.',
      goalText: 'Take two 10-minute analog creative breaks this week.',
      linkedDimensionId: 'creativity',
      activities: ['Creative Play', 'Home Reset', 'Screen-Free Evening'],
      wheelBalanceAtCheckIn: 6.6,
      tips: [
        { title: 'Leave pen on top of pad', detail: 'Zero setup friction makes 10 minutes inviting.', completed: true },
        { title: 'No erasing rule', detail: 'Focus on hand movement over outcome.', completed: true },
        { title: 'Pair with afternoon tea', detail: 'Create a soothing mid-afternoon anchor.', completed: false },
      ],
      mindfulness: {
        title: 'Tactile Sketch Pause',
        category: 'Movement',
        durationMinutes: 5,
        targetDimension: 'Fun & Creativity',
        whyItFits: 'Engages gentle sensory attention.',
        steps: ['Feel pen on paper.', 'Draw slow curved lines with breath.', 'Notice calm focus.'],
      },
      reflectionNote: 'Playful pauses restore mental flexibility for analytical work.',
    },
    {
      daysAgo: 11,
      mood: MoodState.STRETCHED,
      moodIntensity: 4,
      energy: 2,
      stress: 4,
      focusType: CheckInFocus.FEELING,
      feelingNote: 'Back-to-back afternoons left very little quiet margin before dinner.',
      ideaNote: 'Keep the last 30 minutes of the workday strictly for closing loops.',
      goalText: 'Log off by 6:00 PM and take a screen-free walk around the block.',
      linkedDimensionId: 'mindfulness',
      activities: ['Deep Focus'],
      wheelBalanceAtCheckIn: 5.9,
      tips: [
        { title: 'Set a 5:45 PM shutdown cue', detail: 'Write tomorrow’s top two priorities on paper so your mind can release open loops.', completed: true },
        { title: 'Leave your phone in the hallway', detail: 'Take a 12-minute neighborhood walk without podcasts or notifications.', completed: true },
        { title: 'Soften evening lighting', detail: 'Switch to warm lamps after sunset to signal physical recovery.', completed: false },
      ],
      mindfulness: {
        title: 'Physiological Sigh Reset',
        category: 'Breathwork',
        durationMinutes: 3,
        targetDimension: 'Rest & Mindfulness',
        whyItFits: 'Two double-inhales quickly lower elevated evening tension.',
        steps: [
          'Inhale slowly through your nose until lungs feel comfortably full.',
          'Take a second short sip of air at the very top.',
          'Exhale long and unhurried through your mouth for 6–8 seconds.',
          'Repeat for six calm cycles with shoulders dropped.',
        ],
      },
      reflectionNote: 'Ending the day intentionally is a skill, not a luxury. Small boundary signals teach your nervous system that the workday is truly done.',
    },
    {
      daysAgo: 6,
      mood: MoodState.UNCERTAIN,
      moodIntensity: 3,
      energy: 3,
      stress: 3,
      focusType: CheckInFocus.GOAL,
      feelingNote: 'Unsure how to sequence two big projects without sacrificing sleep.',
      ideaNote: 'Batch deep creative work before noon and leave admin for 3 PM.',
      goalText: 'Clarify one primary milestone for this week and defer two non-urgent tasks.',
      linkedDimensionId: 'career',
      activities: ['Deep Focus', 'Quiet Reading'],
      wheelBalanceAtCheckIn: 6.2,
      tips: [
        { title: 'Name a single weekly anchor', detail: 'Write one sentence finishing: "This week feels successful if I complete..."', completed: true },
        { title: 'Renegotiate two soft deadlines', detail: 'Send a brief, proactive note moving low-impact tasks to next week.', completed: false },
        { title: 'Guard 90 morning minutes', detail: 'Mute chat channels during your clearest morning focus block.', completed: true },
      ],
      mindfulness: {
        title: '5-4-3-2-1 Desk Grounding',
        category: 'Grounding',
        durationMinutes: 4,
        targetDimension: 'Career & Purpose',
        whyItFits: 'Pulls attention out of future-planning loops into immediate clarity.',
        steps: [
          'Name 5 calm objects visible in your room.',
          'Notice 4 physical sensations such as feet on the floor and chair support.',
          'Listen for 3 quiet ambient sounds, then take 2 deep breaths.',
        ],
      },
      reflectionNote: 'Uncertainty often eases the moment you choose one concrete milestone and release the rest for later.',
    },
    {
      daysAgo: 4,
      mood: MoodState.GROUNDED,
      moodIntensity: 4,
      energy: 4,
      stress: 2,
      focusType: CheckInFocus.FEELING,
      feelingNote: 'Slept 7.5 hours and felt noticeably steadier during morning conversations.',
      ideaNote: 'Evening stretch routine really helps sleep onset.',
      goalText: 'Maintain lights-out by 10:45 PM for three consecutive nights.',
      linkedDimensionId: 'health',
      activities: ['Movement & Walk', 'Restful Sleep', 'Screen-Free Evening'],
      wheelBalanceAtCheckIn: 6.6,
      tips: [
        { title: 'Set a 10:15 PM wind-down chime', detail: 'Use a gentle reminder to close screens and brew herbal tea.', completed: true },
        { title: 'Five minutes of floor stretching', detail: 'Release neck and hip tension right next to your bed.', completed: true },
        { title: 'Charge devices outside the bedroom', detail: 'Replace late scrolling with two pages of calming fiction.', completed: true },
      ],
      mindfulness: {
        title: 'Progressive Shoulder Release',
        category: 'Body Scan',
        durationMinutes: 5,
        targetDimension: 'Health & Vitality',
        whyItFits: 'Reinforces the restorative rhythm you built today.',
        steps: [
          'Sit comfortably and lift shoulders gently toward your ears for 4 seconds.',
          'Release completely on a long exhale, noticing the warmth of relaxation.',
          'Scan slowly from jaw to hands, softening any subtle holding.',
        ],
      },
      reflectionNote: 'Consistent sleep quietly lifts every other spoke of your Wheel. Notice how much calmer decisions feel when energy is steady.',
    },
    {
      daysAgo: 2,
      mood: MoodState.ENERGIZED,
      moodIntensity: 4,
      energy: 5,
      stress: 2,
      focusType: CheckInFocus.GOAL,
      feelingNote: 'Great conversation with an old friend over lunch; felt genuinely recharged.',
      ideaNote: 'Host a simple monthly dinner with close friends — potluck style so it stays easy.',
      goalText: 'Message two friends to pick a relaxed dinner date next Thursday.',
      linkedDimensionId: 'relationships',
      activities: ['Social Connection', 'Time Outdoors', 'Movement & Walk'],
      wheelBalanceAtCheckIn: 6.8,
      tips: [
        { title: 'Send two dates right now', detail: 'Offer two concrete evening options to avoid endless scheduling threads.', completed: true },
        { title: 'Keep the menu effortless', detail: 'Choose a single shared dish or ask each guest to bring one small side.', completed: false },
        { title: 'Leave phones in a basket', detail: 'Create an easy, warm space for unhurried conversation.', completed: false },
      ],
      mindfulness: {
        title: 'Gratitude & Warmth Pause',
        category: 'Journaling',
        durationMinutes: 4,
        targetDimension: 'Relationships & Love',
        whyItFits: 'Anchors positive connection while energy is high.',
        steps: [
          'Recall one specific moment from today’s conversation that made you smile.',
          'Write down one quality you appreciate in that person.',
          'Take three unhurried breaths letting that feeling of ease settle.',
        ],
      },
      reflectionNote: 'Shared meals don’t need polish to be deeply nourishing. Keeping the invitation simple makes consistency effortless.',
    },
    {
      daysAgo: 1,
      mood: MoodState.GROUNDED,
      moodIntensity: 4,
      energy: 4,
      stress: 2,
      focusType: CheckInFocus.IDEA,
      feelingNote: 'Cleared my desk and opened the window; the workspace feels much lighter.',
      ideaNote: 'Keep a small ceramic tray for daily essentials so surfaces stay calm.',
      goalText: 'Spend 10 minutes tidying the entryway and watering houseplants.',
      linkedDimensionId: 'environment',
      activities: ['Home Reset', 'Mindful Breathwork', 'Screen-Free Evening'],
      wheelBalanceAtCheckIn: 6.7,
      tips: [
        { title: 'Clear one horizontal surface', detail: 'Start strictly with the entryway console before touching closets.', completed: true },
        { title: 'Pair plant care with morning light', detail: 'Water plants while waiting for morning kettle or coffee.', completed: true },
        { title: 'Donate three unused items', detail: 'Keep a small tote bag by the door for effortless clutter release.', completed: false },
      ],
      mindfulness: {
        title: 'Mindful Tidy Reset',
        category: 'Movement',
        durationMinutes: 6,
        targetDimension: 'Environment & Home',
        whyItFits: 'Turns light physical care of your space into a moving meditation.',
        steps: [
          'Move at 80% of your usual speed while clearing one surface.',
          'Notice the texture and weight of each object you put away.',
          'Pause for two full breaths once the surface is clear.',
        ],
      },
      reflectionNote: 'Visual quiet in your surroundings creates immediate cognitive breathing room. Small daily resets keep calm effortless.',
    },
  ];

  return entries.map((e, idx) => {
    const { dateISO, createdAt } = isoDaysAgo(e.daysAgo);
    const baseValence = MOOD_META[e.mood].valence;
    const moodScore = Number(Math.min(5, Math.max(1, baseValence + (e.moodIntensity - 3) * 0.2)).toFixed(1));
    return {
      id: `checkin_seed_${idx + 1}`,
      dateISO,
      createdAt,
      mood: e.mood,
      moodScore,
      moodIntensity: e.moodIntensity,
      energy: e.energy,
      stress: e.stress,
      focusType: e.focusType,
      feelingNote: e.feelingNote,
      ideaNote: e.ideaNote,
      goalText: e.goalText,
      linkedDimensionId: e.linkedDimensionId,
      activities: e.activities,
      promptResponses: [
        {
          questionId: `dp_seed_${idx}_1`,
          category: e.focusType,
          prompt: 'What stood out most in your emotional balance today?',
          response: e.feelingNote,
          linkedDimensionId: e.linkedDimensionId,
        },
        {
          questionId: `dp_seed_${idx}_2`,
          category: 'Goal',
          prompt: 'Which small intention felt most supportive right now?',
          response: e.goalText,
          linkedDimensionId: e.linkedDimensionId,
        },
      ],
      wheelBalanceAtCheckIn: e.wheelBalanceAtCheckIn,
      goalTips: e.tips.map((t, tIdx) => ({
        id: `tip_seed_${idx}_${tIdx}`,
        ...t,
      })),
      mindfulness: e.mindfulness,
      reflectionNote: e.reflectionNote,
    };
  });
}

export function createSampleMindfulnessLogs(): MindfulnessSessionLog[] {
  return [
    {
      id: 'ms_1',
      createdAt: isoDaysAgo(4).createdAt,
      practiceTitle: 'Coherent Breath (5-5)',
      durationMinutes: 5,
    },
    {
      id: 'ms_2',
      createdAt: isoDaysAgo(2).createdAt,
      practiceTitle: '4-7-8 Evening Calm',
      durationMinutes: 4,
    },
    {
      id: 'ms_3',
      createdAt: isoDaysAgo(1).createdAt,
      practiceTitle: 'Box Breathing (4-4-4-4)',
      durationMinutes: 6,
    },
  ];
}

export function getCuratedMindfulnessForState(
  scores: DimensionScores,
  latestMood?: MoodState
): MindfulnessPractice[] {
  const sorted = [...WHEEL_DIMENSIONS].sort((a, b) => scores[a.id] - scores[b.id]);
  const lowest = sorted[0];
  const secondLowest = sorted[1];

  const catalog: Record<WheelDimensionId, MindfulnessPractice> = {
    career: {
      title: 'Single-Task Horizon Pause',
      category: 'Grounding',
      durationMinutes: 5,
      targetDimension: 'Career & Purpose',
      whyItFits: 'Supports clarity when work priorities feel crowded.',
      steps: [
        'Close extra tabs and place both feet flat on the floor.',
        'Take five slow breaths, exhaling slightly longer than you inhale.',
        'Choose only the next 25 minutes of meaningful work before resuming messages.',
      ],
    },
    health: {
      title: 'Somatic Body Check-In',
      category: 'Body Scan',
      durationMinutes: 6,
      targetDimension: 'Health & Vitality',
      whyItFits: 'Reconnects awareness to physical tension, posture, and rest cues.',
      steps: [
        'Sit or lie down comfortably and soften your gaze.',
        'Scan slowly from forehead, jaw, and shoulders down to your hands and feet.',
        'Ask gently: "What does my body need in the next hour — water, stretch, or rest?"',
      ],
    },
    relationships: {
      title: 'Loving-Kindness Connection Breath',
      category: 'Breathwork',
      durationMinutes: 5,
      targetDimension: 'Relationships & Love',
      whyItFits: 'Nurtures warmth and emotional openness toward yourself and others.',
      steps: [
        'Place one hand lightly over your heart or collarbone.',
        'Bring to mind someone you appreciate and breathe slowly for four cycles.',
        'Silently offer a simple wish of ease to yourself, then to them.',
      ],
    },
    growth: {
      title: 'Beginner’s Mind Observation',
      category: 'Journaling',
      durationMinutes: 7,
      targetDimension: 'Personal Growth',
      whyItFits: 'Replaces self-criticism with calm curiosity.',
      steps: [
        'Write down one area where you feel stuck without judging it.',
        'List two small experiments you could test with zero expectation of perfection.',
        'Take three steady breaths and pick the gentlest experiment.',
      ],
    },
    finances: {
      title: 'Calm Clarity Ledger Pause',
      category: 'Grounding',
      durationMinutes: 5,
      targetDimension: 'Finances & Security',
      whyItFits: 'Reduces avoidance or tension around financial planning.',
      steps: [
        'Take four 4-7-8 breaths before opening any numbers or accounts.',
        'Write one factual observation and one calm, concrete next action.',
        'Acknowledge your effort toward clarity rather than chasing instant certainty.',
      ],
    },
    creativity: {
      title: 'Sensory Noticing Walk',
      category: 'Movement',
      durationMinutes: 8,
      targetDimension: 'Fun & Creativity',
      whyItFits: 'Replenishes playful attention when weeks feel overly utilitarian.',
      steps: [
        'Step away from screens for an 8-minute walk without audio.',
        'Notice three subtle colors, textures, or light patterns along your route.',
        'Let ideas drift without forcing any immediate productivity.',
      ],
    },
    mindfulness: {
      title: '4-7-8 Nervous System Reset',
      category: 'Breathwork',
      durationMinutes: 4,
      targetDimension: 'Rest & Mindfulness',
      whyItFits: 'Directly creates quiet space when mental recovery is running low.',
      steps: [
        'Inhale quietly through the nose for 4 counts.',
        'Hold gently without straining for 7 counts.',
        'Exhale softly through the mouth for 8 counts; repeat 4–6 rounds.',
      ],
    },
    environment: {
      title: 'Window Light & Horizon Rest',
      category: 'Grounding',
      durationMinutes: 3,
      targetDimension: 'Environment & Home',
      whyItFits: 'Relieves visual fatigue and anchors you in your physical space.',
      steps: [
        'Look away from near screens toward the farthest natural point out a window.',
        'Let your peripheral vision widen while taking six slow breaths.',
        'Clear one small item from your immediate desk or table before returning.',
      ],
    },
  };

  const moodPractice: MindfulnessPractice =
    latestMood === MoodState.STRETCHED || latestMood === MoodState.UNCERTAIN
      ? {
          title: 'Two-Minute Anchor & Release',
          category: 'Breathwork',
          durationMinutes: 2,
          targetDimension: `${latestMood} Mood Support`,
          whyItFits: `Designed specifically to soften ${latestMood.toLowerCase()} tension without requiring extra willpower.`,
          steps: [
            'Exhale all air gently, then inhale for 4 slow seconds.',
            'Drop your shoulders 1 inch away from your ears on the exhale.',
            'Name one thing that does not need to be solved today.',
          ],
        }
      : {
          title: 'Evening Gratitude Integration',
          category: 'Journaling',
          durationMinutes: 5,
          targetDimension: 'Emotional Balance',
          whyItFits: 'Reinforces calm momentum and helps consolidate positive mood patterns.',
          steps: [
            'Write three brief lines: one effort you’re proud of, one small comfort, and one tomorrow intention.',
            'Read them back slowly with an unhurried breath.',
          ],
        };

  return [catalog[lowest.id], catalog[secondLowest.id], moodPractice];
}
