export enum AppView {
  WHEEL = 'wheel',
  CHECK_IN = 'checkin',
  ANALYTICS = 'analytics',
  MINDFULNESS = 'mindfulness',
}

export enum MoodState {
  GROUNDED = 'Grounded',
  ENERGIZED = 'Energized',
  REFLECTIVE = 'Reflective',
  UNCERTAIN = 'Uncertain',
  STRETCHED = 'Stretched',
}

export enum CheckInFocus {
  FEELING = 'Feeling',
  IDEA = 'Idea',
  GOAL = 'Goal',
}

export type WheelDimensionId =
  | 'career'
  | 'health'
  | 'relationships'
  | 'growth'
  | 'finances'
  | 'creativity'
  | 'mindfulness'
  | 'environment';

export interface WheelDimension {
  id: WheelDimensionId;
  label: string;
  shortLabel: string;
  description: string;
}

export interface WheelQuestion {
  id: string;
  dimensionId: WheelDimensionId;
  prompt: string;
  lowAnchor: string;
  highAnchor: string;
}

export type QuestionAnswers = Record<string, number>;
export type DimensionScores = Record<WheelDimensionId, number>;

export interface WheelSnapshot {
  id: string;
  createdAt: string;
  scores: DimensionScores;
  answers: QuestionAnswers;
  note?: string;
}

export interface GoalTip {
  id: string;
  title: string;
  detail: string;
  completed: boolean;
}

export interface MindfulnessPractice {
  title: string;
  category: string;
  durationMinutes: number;
  targetDimension?: string;
  whyItFits: string;
  steps: string[];
}

export interface DailyPromptQuestion {
  id: string;
  category: CheckInFocus | 'Activity';
  prompt: string;
  placeholder: string;
  linkedDimensionId: WheelDimensionId;
}

export interface DailyPromptResponse {
  questionId: string;
  category: string;
  prompt: string;
  response: string;
  linkedDimensionId: WheelDimensionId;
}

export interface DailyCheckIn {
  id: string;
  dateISO: string; // YYYY-MM-DD
  createdAt: string;
  mood: MoodState;
  moodScore: number; // 1..5 derived + intensity
  moodIntensity: number; // 1..5
  energy: number; // 1..5
  stress: number; // 1..5
  focusType: CheckInFocus;
  feelingNote: string;
  ideaNote: string;
  goalText: string;
  linkedDimensionId?: WheelDimensionId;
  activities: string[];
  promptResponses: DailyPromptResponse[];
  wheelBalanceAtCheckIn?: number; // 1..10 average snapshot at time of check-in
  goalTips: GoalTip[];
  mindfulness?: MindfulnessPractice;
  reflectionNote?: string;
}

export interface MindfulnessSessionLog {
  id: string;
  createdAt: string;
  practiceTitle: string;
  durationMinutes: number;
}

export interface BreathingProtocol {
  id: string;
  name: string;
  subtitle: string;
  inhaleSec: number;
  holdSec: number;
  exhaleSec: number;
  holdAfterExhaleSec: number;
  recommendedFor: string;
}
