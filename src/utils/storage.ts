import {
  DEFAULT_QUESTION_ANSWERS,
  MOOD_META,
  WHEEL_DIMENSIONS,
  createSampleCheckIns,
  createSampleMindfulnessLogs,
  createSampleSnapshots,
} from '../data/wheelData';
import {
  DailyCheckIn,
  DimensionScores,
  MindfulnessPractice,
  MindfulnessSessionLog,
  MoodState,
  QuestionAnswers,
  WheelDimensionId,
  WheelSnapshot,
} from '../types';

const STORAGE_KEYS = {
  ANSWERS: 'sweetspot_wheel_answers_v1',
  SNAPSHOTS: 'sweetspot_wheel_snapshots_v1',
  CHECKINS: 'sweetspot_checkins_v1',
  MINDFULNESS_LOGS: 'sweetspot_mindfulness_logs_v1',
  CUSTOM_RECOMMENDATIONS: 'sweetspot_mindfulness_recs_v1',
  SEEDED: 'sweetspot_seeded_v1',
};

export interface PersistedState {
  answers: QuestionAnswers;
  snapshots: WheelSnapshot[];
  checkIns: DailyCheckIn[];
  mindfulnessLogs: MindfulnessSessionLog[];
  customRecommendations: MindfulnessPractice[];
}

export function loadPersistedState(): PersistedState {
  try {
    const alreadySeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    if (!alreadySeeded) {
      const initial: PersistedState = {
        answers: DEFAULT_QUESTION_ANSWERS,
        snapshots: createSampleSnapshots(),
        checkIns: createSampleCheckIns(),
        mindfulnessLogs: createSampleMindfulnessLogs(),
        customRecommendations: [],
      };
      savePersistedState(initial);
      localStorage.setItem(STORAGE_KEYS.SEEDED, '1');
      return initial;
    }

    const answers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWERS) || 'null') ?? DEFAULT_QUESTION_ANSWERS;
    const snapshots = JSON.parse(localStorage.getItem(STORAGE_KEYS.SNAPSHOTS) || 'null') ?? [];
    const checkIns = (JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || 'null') ?? []).map(
      (c: DailyCheckIn) => ({
        ...c,
        activities: Array.isArray(c.activities) ? c.activities : [],
        promptResponses: Array.isArray(c.promptResponses) ? c.promptResponses : [],
      })
    );
    const mindfulnessLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.MINDFULNESS_LOGS) || 'null') ?? [];
    const customRecommendations = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_RECOMMENDATIONS) || 'null') ?? [];

    return {
      answers,
      snapshots,
      checkIns,
      mindfulnessLogs,
      customRecommendations,
    };
  } catch {
    return {
      answers: DEFAULT_QUESTION_ANSWERS,
      snapshots: createSampleSnapshots(),
      checkIns: createSampleCheckIns(),
      mindfulnessLogs: createSampleMindfulnessLogs(),
      customRecommendations: [],
    };
  }
}

export function savePersistedState(partial: Partial<PersistedState>): void {
  try {
    if (partial.answers !== undefined) {
      localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(partial.answers));
    }
    if (partial.snapshots !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(partial.snapshots));
    }
    if (partial.checkIns !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(partial.checkIns));
    }
    if (partial.mindfulnessLogs !== undefined) {
      localStorage.setItem(STORAGE_KEYS.MINDFULNESS_LOGS, JSON.stringify(partial.mindfulnessLogs));
    }
    if (partial.customRecommendations !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_RECOMMENDATIONS, JSON.stringify(partial.customRecommendations));
    }
  } catch {
    // Ignore storage quota errors safely
  }
}

export function computeBalanceSummary(scores: DimensionScores) {
  const values = WHEEL_DIMENSIONS.map((d) => ({
    dimension: d,
    score: scores[d.id],
  }));
  const avg = values.reduce((sum, v) => sum + v.score, 0) / values.length;
  const sorted = [...values].sort((a, b) => b.score - a.score);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v.score - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const harmonyPct = Math.max(0, Math.min(100, Math.round(100 - stdDev * 18)));

  return {
    average: Number(avg.toFixed(1)),
    highest,
    lowest,
    harmonyPct,
    sortedAsc: [...values].sort((a, b) => a.score - b.score),
  };
}

export interface ActivityCorrelation {
  activity: string;
  count: number;
  avgMood: number;
  deltaFromBaseline: number;
  avgEnergy: number;
  avgStress: number;
}

export function computeMoodAnalytics(checkIns: DailyCheckIn[], mindfulnessLogs: MindfulnessSessionLog[]) {
  const sortedDesc = [...checkIns].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const total = sortedDesc.length;

  const avgMood =
    total > 0
      ? Number((sortedDesc.reduce((sum, c) => sum + c.moodScore, 0) / total).toFixed(1))
      : 0;
  const avgEnergy =
    total > 0
      ? Number((sortedDesc.reduce((sum, c) => sum + c.energy, 0) / total).toFixed(1))
      : 0;
  const avgStress =
    total > 0
      ? Number((sortedDesc.reduce((sum, c) => sum + c.stress, 0) / total).toFixed(1))
      : 0;

  const uniqueDates = Array.from(new Set(sortedDesc.map((c) => c.dateISO))).sort().reverse();
  let streakDays = 0;
  if (uniqueDates.length > 0) {
    streakDays = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1] + 'T00:00:00');
      const curr = new Date(uniqueDates[i] + 'T00:00:00');
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
      if (diffDays === 1) {
        streakDays++;
      } else {
        break;
      }
    }
  }

  const counts: Record<MoodState, number> = {
    [MoodState.GROUNDED]: 0,
    [MoodState.ENERGIZED]: 0,
    [MoodState.REFLECTIVE]: 0,
    [MoodState.UNCERTAIN]: 0,
    [MoodState.STRETCHED]: 0,
  };
  for (const entry of sortedDesc) {
    counts[entry.mood] = (counts[entry.mood] || 0) + 1;
  }

  const distribution = (Object.keys(MOOD_META) as MoodState[]).map((mood) => ({
    mood,
    count: counts[mood],
    pct: total > 0 ? Math.round((counts[mood] / total) * 100) : 0,
    meta: MOOD_META[mood],
  }));

  const dominantMood = [...distribution].sort((a, b) => b.count - a.count)[0];

  // Life area (Wheel dimension) mood correlation
  const dimStats: Partial<Record<WheelDimensionId, { count: number; moodSum: number; stressSum: number; energySum: number }>> = {};
  for (const entry of sortedDesc) {
    if (!entry.linkedDimensionId) continue;
    const prev = dimStats[entry.linkedDimensionId] || { count: 0, moodSum: 0, stressSum: 0, energySum: 0 };
    dimStats[entry.linkedDimensionId] = {
      count: prev.count + 1,
      moodSum: prev.moodSum + entry.moodScore,
      stressSum: prev.stressSum + entry.stress,
      energySum: prev.energySum + entry.energy,
    };
  }

  const dimensionCorrelations = WHEEL_DIMENSIONS.map((dim) => {
    const stat = dimStats[dim.id];
    const dMood = stat ? Number((stat.moodSum / stat.count).toFixed(1)) : null;
    return {
      dimension: dim,
      count: stat?.count ?? 0,
      avgMood: dMood,
      deltaFromBaseline: dMood !== null ? Number((dMood - avgMood).toFixed(2)) : 0,
      avgStress: stat ? Number((stat.stressSum / stat.count).toFixed(1)) : null,
      avgEnergy: stat ? Number((stat.energySum / stat.count).toFixed(1)) : null,
    };
  })
    .filter((d) => d.count > 0)
    .sort((a, b) => (b.avgMood ?? 0) - (a.avgMood ?? 0));

  // Logged activity correlation with mood
  const actStats: Record<string, { count: number; moodSum: number; energySum: number; stressSum: number }> = {};
  for (const entry of sortedDesc) {
    for (const act of entry.activities || []) {
      const prev = actStats[act] || { count: 0, moodSum: 0, energySum: 0, stressSum: 0 };
      actStats[act] = {
        count: prev.count + 1,
        moodSum: prev.moodSum + entry.moodScore,
        energySum: prev.energySum + entry.energy,
        stressSum: prev.stressSum + entry.stress,
      };
    }
  }

  const activityCorrelations: ActivityCorrelation[] = Object.entries(actStats)
    .map(([activity, stat]) => {
      const aMood = Number((stat.moodSum / stat.count).toFixed(1));
      return {
        activity,
        count: stat.count,
        avgMood: aMood,
        deltaFromBaseline: Number((aMood - avgMood).toFixed(2)),
        avgEnergy: Number((stat.energySum / stat.count).toFixed(1)),
        avgStress: Number((stat.stressSum / stat.count).toFixed(1)),
      };
    })
    .sort((a, b) => b.deltaFromBaseline - a.deltaFromBaseline);

  // Balance-to-mood correlation (comparing check-in wheelBalanceAtCheckIn vs moodScore)
  const balanceEntries = sortedDesc.filter((c) => typeof c.wheelBalanceAtCheckIn === 'number');
  let balanceMoodInsight = 'Log check-ins alongside your Wheel of Life to surface balance-to-mood trends.';
  if (balanceEntries.length >= 3) {
    const highBalance = balanceEntries.filter((c) => (c.wheelBalanceAtCheckIn ?? 0) >= 6.5);
    const lowBalance = balanceEntries.filter((c) => (c.wheelBalanceAtCheckIn ?? 0) < 6.5);
    if (highBalance.length > 0 && lowBalance.length > 0) {
      const highMood = highBalance.reduce((s, c) => s + c.moodScore, 0) / highBalance.length;
      const lowMood = lowBalance.reduce((s, c) => s + c.moodScore, 0) / lowBalance.length;
      const diff = Number((highMood - lowMood).toFixed(1));
      if (diff > 0) {
        balanceMoodInsight = `Days when your Wheel balance averages 6.5+ show +${diff} higher mood (${highMood.toFixed(1)} vs ${lowMood.toFixed(1)}/5).`;
      } else {
        balanceMoodInsight = `Your mood stays steady (${highMood.toFixed(1)}/5) even across fluctuating Wheel scores.`;
      }
    }
  }

  const totalMindfulMinutes = mindfulnessLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const completedTipsCount = sortedDesc.reduce(
    (sum, c) => sum + c.goalTips.filter((t) => t.completed).length,
    0
  );
  const totalTipsCount = sortedDesc.reduce((sum, c) => sum + c.goalTips.length, 0);

  return {
    total,
    avgMood,
    avgEnergy,
    avgStress,
    streakDays,
    distribution,
    dominantMood: total > 0 ? dominantMood : null,
    dimensionCorrelations,
    activityCorrelations,
    balanceMoodInsight,
    totalMindfulMinutes,
    completedTipsCount,
    totalTipsCount,
  };
}
