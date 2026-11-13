import React, { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Pause, Play, RefreshCw, RotateCcw } from 'lucide-react';
import {
  BREATHING_PROTOCOLS,
  WHEEL_DIMENSIONS,
  getCuratedMindfulnessForState,
} from '../data/wheelData';
import {
  DailyCheckIn,
  DimensionScores,
  MindfulnessPractice,
  MindfulnessSessionLog,
} from '../types';
import { computeBalanceSummary, computeMoodAnalytics } from '../utils/storage';

interface MindfulnessStudioViewProps {
  scores: DimensionScores;
  checkIns: DailyCheckIn[];
  mindfulnessLogs: MindfulnessSessionLog[];
  customRecommendations: MindfulnessPractice[];
  onSaveCustomRecommendations: (recs: MindfulnessPractice[]) => void;
  onLogMindfulnessSession: (practiceTitle: string, durationMinutes: number) => void;
}

export const MindfulnessStudioView: React.FC<MindfulnessStudioViewProps> = ({
  scores,
  checkIns,
  mindfulnessLogs,
  customRecommendations,
  onSaveCustomRecommendations,
  onLogMindfulnessSession,
}) => {
  const balanceSummary = useMemo(() => computeBalanceSummary(scores), [scores]);
  const moodAnalytics = useMemo(
    () => computeMoodAnalytics(checkIns, mindfulnessLogs),
    [checkIns, mindfulnessLogs]
  );

  const latestCheckIn = useMemo(() => {
    return [...checkIns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [checkIns]);

  const displayedRecommendations = useMemo(() => {
    if (customRecommendations.length > 0) return customRecommendations;
    return getCuratedMindfulnessForState(scores, latestCheckIn?.mood);
  }, [customRecommendations, scores, latestCheckIn?.mood]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [loggedPracticeTitle, setLoggedPracticeTitle] = useState<string | null>(null);

  // Interactive Breathing Studio State
  const [protocolId, setProtocolId] = useState(BREATHING_PROTOCOLS[0].id);
  const [targetMinutes, setTargetMinutes] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  const activeProtocol =
    BREATHING_PROTOCOLS.find((p) => p.id === protocolId) ?? BREATHING_PROTOCOLS[0];

  const totalCycleSec =
    activeProtocol.inhaleSec +
    activeProtocol.holdSec +
    activeProtocol.exhaleSec +
    activeProtocol.holdAfterExhaleSec;

  const targetTotalSec = targetMinutes * 60;

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setElapsedSec((prev) => {
        if (prev + 1 >= targetTotalSec) {
          setIsRunning(false);
          onLogMindfulnessSession(activeProtocol.name, targetMinutes);
          setLoggedPracticeTitle(activeProtocol.name);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, targetTotalSec, activeProtocol.name, targetMinutes, onLogMindfulnessSession]);

  const breathPhase = useMemo(() => {
    const pos = elapsedSec % totalCycleSec;
    if (pos < activeProtocol.inhaleSec) {
      return {
        label: 'Inhale gently',
        remaining: activeProtocol.inhaleSec - pos,
        scale: 1.18,
      };
    }
    if (pos < activeProtocol.inhaleSec + activeProtocol.holdSec) {
      return {
        label: 'Hold softly',
        remaining: activeProtocol.inhaleSec + activeProtocol.holdSec - pos,
        scale: 1.18,
      };
    }
    if (
      pos <
      activeProtocol.inhaleSec + activeProtocol.holdSec + activeProtocol.exhaleSec
    ) {
      return {
        label: 'Exhale slowly',
        remaining:
          activeProtocol.inhaleSec +
          activeProtocol.holdSec +
          activeProtocol.exhaleSec -
          pos,
        scale: 0.86,
      };
    }
    return {
      label: 'Rest empty',
      remaining: totalCycleSec - pos,
      scale: 0.86,
    };
  }, [elapsedSec, totalCycleSec, activeProtocol]);

  const handleAnalyzeAndRefresh = async () => {
    setRefreshError(null);
    setIsRefreshing(true);

    const wheelScoresLabeled: Record<string, number> = {};
    for (const d of WHEEL_DIMENSIONS) {
      wheelScoresLabeled[d.label] = scores[d.id];
    }

    const lowestDimensions = balanceSummary.sortedAsc.slice(0, 2).map((item) => ({
      label: item.dimension.label,
      score: item.score,
    }));

    try {
      const response = await fetch('/api/mindfulness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wheelScores: wheelScoresLabeled,
          lowestDimensions,
          latestMood: latestCheckIn?.mood ?? 'Reflective',
          avgMood: moodAnalytics.avgMood,
          avgEnergy: moodAnalytics.avgEnergy,
          avgStress: moodAnalytics.avgStress,
          topActivities: moodAnalytics.activityCorrelations
            .filter((a) => a.deltaFromBaseline >= 0)
            .slice(0, 3)
            .map((a) => ({ activity: a.activity, avgMood: a.avgMood })),
          recentGoals: checkIns
            .map((c) => c.goalText)
            .filter(Boolean)
            .slice(0, 3),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not generate tailored mindfulness plan.');
      }
      if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        onSaveCustomRecommendations(data.recommendations);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to refresh right now.';
      setRefreshError(msg);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleQuickLog = (title: string, mins: number) => {
    onLogMindfulnessSession(title, mins);
    setLoggedPracticeTitle(title);
    setTimeout(() => setLoggedPracticeTitle(null), 2400);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const lowestTwo = balanceSummary.sortedAsc.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header + Joint Analysis Action */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-[#1C2825] text-balance">
            Mindfulness &amp; Balance Support
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-[#556862]">
            Recommendations synthesized from your lowest Wheel of Life dimensions and recent mood-tracking telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAnalyzeAndRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2D6A5E] hover:bg-[#23554B] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{isRefreshing ? 'Analyzing patterns...' : 'Analyze & Refresh Plan'}</span>
        </button>
      </div>

      {/* Joint Analysis Diagnosis Strip */}
      <div className="bg-white border border-[#E1E7E4] rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-5 divide-y md:divide-y-0 md:divide-x divide-[#EAEFED]">
        <div className="pb-4 md:pb-0 md:pr-5">
          <p className="text-xs text-[#647771]">Wheel Areas Seeking Care</p>
          <p className="mt-1 text-sm font-medium text-[#1C2825]">
            {lowestTwo.map((i) => `${i.dimension.shortLabel} (${i.score.toFixed(1)})`).join(' · ')}
          </p>
          <p className="mt-1 text-xs text-[#596C66]">
            Prioritized in the practices below to restore roundness across your wheel.
          </p>
        </div>

        <div className="pt-4 md:pt-0 md:px-5">
          <p className="text-xs text-[#647771]">Mood &amp; Stress Signal</p>
          <p className="mt-1 text-sm font-medium text-[#1C2825] tabular-nums">
            Mood {moodAnalytics.avgMood.toFixed(1)}/5 · Stress {moodAnalytics.avgStress.toFixed(1)}/5
          </p>
          <p className="mt-1 text-xs text-[#596C66]">
            {moodAnalytics.avgStress >= 3.2
              ? 'Elevated tension detected — favoring nervous-system downshifting.'
              : 'Steady emotional baseline — favoring restorative presence and clarity.'}
          </p>
        </div>

        <div className="pt-4 md:pt-0 md:pl-5">
          <p className="text-xs text-[#647771]">Mindful Practice Logged</p>
          <p className="mt-1 text-sm font-mono font-medium tabular-nums text-[#2D6A5E]">
            {moodAnalytics.totalMindfulMinutes} total minutes
          </p>
          <p className="mt-1 text-xs text-[#596C66] tabular-nums">
            {mindfulnessLogs.length} completed sessions recorded
          </p>
        </div>
      </div>

      {refreshError && (
        <p className="text-xs text-[#73514B] bg-[#F4EAE8] border border-[#DEC2BD] rounded-lg px-4 py-2.5">
          {refreshError}
        </p>
      )}

      {/* Main 2-column Studio: Personalized Recommendations + Interactive Breathing Pacer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3 Tailored Mindfulness Practices */}
        <section className="lg:col-span-7 space-y-4">
          {displayedRecommendations.map((practice, idx) => {
            const justLogged = loggedPracticeTitle === practice.title;
            return (
              <article
                key={`${practice.title}-${idx}`}
                className="bg-white border border-[#E1E7E4] rounded-xl p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#647771]">
                      <span className="font-medium text-[#2D6A5E]">{practice.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {practice.durationMinutes} min
                      </span>
                      {practice.targetDimension && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Supports {practice.targetDimension}</span>
                        </>
                      )}
                    </div>
                    <h2 className="mt-1.5 text-lg font-display font-medium text-[#1C2825]">
                      {practice.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLog(practice.title, practice.durationMinutes)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2D6A5E] bg-[#EDF5F2] hover:bg-[#DCEAE5] rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    {justLogged ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Logged</span>
                      </>
                    ) : (
                      <span>Log {practice.durationMinutes}m Practice</span>
                    )}
                  </button>
                </div>

                <p className="mt-2 text-sm text-[#4E615B] leading-relaxed">
                  {practice.whyItFits}
                </p>

                <ol className="mt-4 pt-4 border-t border-[#EAEFED] space-y-2 text-sm text-[#2C3E38] list-decimal list-inside">
                  {practice.steps.map((step, sIdx) => (
                    <li key={sIdx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </section>

        {/* Right: Interactive Guided Breathing Pacer */}
        <section className="lg:col-span-5 bg-white border border-[#E1E7E4] rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-display font-medium text-[#1C2825]">
              Guided Breathing Pacer
            </h2>
            <p className="text-xs text-[#596C66] mt-0.5">
              Select a cadence and follow the calm expansion cycle
            </p>
          </div>

          {/* Protocol Selector */}
          <div className="space-y-1.5">
            {BREATHING_PROTOCOLS.map((proto) => {
              const active = proto.id === protocolId;
              return (
                <button
                  key={proto.id}
                  type="button"
                  onClick={() => {
                    setProtocolId(proto.id);
                    setIsRunning(false);
                    setElapsedSec(0);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-left transition-colors ${
                    active
                      ? 'bg-[#EDF5F2] border-[#2D6A5E]'
                      : 'bg-[#F8FAF9] border-[#E6ECE9] hover:border-[#C5D1CC]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#1C2825]">{proto.name}</span>
                    <span className="text-[11px] text-[#647771]">{proto.recommendedFor}</span>
                  </div>
                  <p className="text-xs text-[#596C66] mt-0.5">{proto.subtitle}</p>
                </button>
              );
            })}
          </div>

          {/* Visual Breathing Circle */}
          <div className="py-6 flex flex-col items-center justify-center bg-[#F6F9F8] rounded-xl border border-[#E6ECE9]">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div
                className="w-32 h-32 rounded-full bg-[#DCEAE5] border border-[#9EC3B7] flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out"
                style={{
                  transform: `scale(${isRunning ? breathPhase.scale : 1})`,
                }}
              >
                <span className="text-sm font-medium text-[#1C2825]">
                  {isRunning ? breathPhase.label : 'Ready'}
                </span>
                <span className="text-xl font-mono tabular-nums text-[#2D6A5E] mt-0.5">
                  {isRunning ? `${breathPhase.remaining}s` : formatTimer(targetTotalSec)}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs font-mono tabular-nums text-[#647771]">
              Elapsed {formatTimer(elapsedSec)} / {formatTimer(targetTotalSec)}
            </p>
          </div>

          {/* Duration & Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#4E615B]">Session Length</span>
              <div className="flex items-center gap-1 p-1 bg-[#EFF3F1] rounded-lg">
                {[2, 3, 5].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setTargetMinutes(mins);
                      setIsRunning(false);
                      setElapsedSec(0);
                    }}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                      targetMinutes === mins
                        ? 'bg-white text-[#1C2825] shadow-xs'
                        : 'text-[#596C66] hover:text-[#1C2825]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRunning((r) => !r)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#2D6A5E] hover:bg-[#23554B] rounded-lg transition-colors"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>{elapsedSec > 0 ? 'Resume' : 'Start Session'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  setElapsedSec(0);
                }}
                className="p-2.5 text-[#556862] hover:text-[#1C2825] bg-[#EFF3F1] hover:bg-[#E4EBE8] rounded-lg transition-colors"
                aria-label="Reset breathing timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recent Mindfulness Session Logs */}
          {mindfulnessLogs.length > 0 && (
            <div className="pt-4 border-t border-[#EAEFED]">
              <h3 className="text-xs font-medium text-[#4E615B] mb-2">Recent Mindful Sessions</h3>
              <div className="divide-y divide-[#EAEFED]">
                {[...mindfulnessLogs]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .slice(0, 4)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="py-2 flex items-center justify-between text-xs"
                    >
                      <span className="text-[#1C2825] truncate pr-3">{log.practiceTitle}</span>
                      <span className="font-mono tabular-nums text-[#647771] shrink-0">
                        {log.durationMinutes}m ·{' '}
                        {new Date(log.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
