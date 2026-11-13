import React, { useMemo, useState } from 'react';
import { MOOD_META, WHEEL_DIMENSIONS } from '../data/wheelData';
import { DailyCheckIn, DimensionScores, MindfulnessSessionLog } from '../types';
import { computeBalanceSummary, computeMoodAnalytics } from '../utils/storage';

interface MoodAnalyticsViewProps {
  checkIns: DailyCheckIn[];
  mindfulnessLogs: MindfulnessSessionLog[];
  scores: DimensionScores;
  onNavigateToCheckIn: () => void;
}

type RangeWindow = '7D' | '30D' | '1Y';

const CHART_W = 760;
const CHART_H = 260;
const PAD_L = 38;
const PAD_R = 20;
const PAD_T = 22;
const PAD_B = 34;

export const MoodAnalyticsView: React.FC<MoodAnalyticsViewProps> = ({
  checkIns,
  mindfulnessLogs,
  scores,
  onNavigateToCheckIn,
}) => {
  const [range, setRange] = useState<RangeWindow>('30D');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showEnergy, setShowEnergy] = useState(true);
  const [showCalmness, setShowCalmness] = useState(true);

  const analytics = useMemo(
    () => computeMoodAnalytics(checkIns, mindfulnessLogs),
    [checkIns, mindfulnessLogs]
  );
  const balanceSummary = useMemo(() => computeBalanceSummary(scores), [scores]);

  const timelineEntries = useMemo(() => {
    const daysLimit = range === '7D' ? 7 : range === '30D' ? 30 : 365;
    const cutoff = Date.now() - daysLimit * 86400000;
    return [...checkIns]
      .filter((c) => new Date(c.createdAt).getTime() >= cutoff)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [checkIns, range]);

  const rangeStats = useMemo(() => {
    if (timelineEntries.length === 0) {
      return { avgMood: 0, avgEnergy: 0, avgStress: 0, count: 0 };
    }
    const count = timelineEntries.length;
    return {
      count,
      avgMood: Number(
        (timelineEntries.reduce((s, e) => s + e.moodScore, 0) / count).toFixed(1)
      ),
      avgEnergy: Number(
        (timelineEntries.reduce((s, e) => s + e.energy, 0) / count).toFixed(1)
      ),
      avgStress: Number(
        (timelineEntries.reduce((s, e) => s + e.stress, 0) / count).toFixed(1)
      ),
    };
  }, [timelineEntries]);

  const chartPoints = useMemo(() => {
    if (timelineEntries.length === 0) return [];
    const plotW = CHART_W - PAD_L - PAD_R;
    const plotH = CHART_H - PAD_T - PAD_B;

    const minTime = new Date(timelineEntries[0].createdAt).getTime();
    const maxTime = new Date(
      timelineEntries[timelineEntries.length - 1].createdAt
    ).getTime();
    const span = Math.max(1, maxTime - minTime);

    const valueToY = (val: number) => {
      const clamped = Math.max(1, Math.min(5, val));
      return PAD_T + plotH - ((clamped - 1) / 4) * plotH;
    };

    return timelineEntries.map((entry, idx) => {
      const t = new Date(entry.createdAt).getTime();
      const x =
        timelineEntries.length === 1
          ? PAD_L + plotW / 2
          : PAD_L + ((t - minTime) / span) * plotW;
      const calmness = 6 - entry.stress;
      return {
        idx,
        entry,
        x,
        moodY: valueToY(entry.moodScore),
        energyY: valueToY(entry.energy),
        calmY: valueToY(calmness),
        calmness,
      };
    });
  }, [timelineEntries]);

  const moodPath = chartPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.moodY.toFixed(1)}`)
    .join(' ');
  const energyPath = chartPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.energyY.toFixed(1)}`)
    .join(' ');
  const calmPath = chartPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.calmY.toFixed(1)}`)
    .join(' ');

  const areaPath =
    chartPoints.length > 1
      ? `${moodPath} L ${chartPoints[chartPoints.length - 1].x.toFixed(1)} ${
          CHART_H - PAD_B
        } L ${chartPoints[0].x.toFixed(1)} ${CHART_H - PAD_B} Z`
      : '';

  const activePoint =
    hoveredIdx !== null
      ? chartPoints[hoveredIdx]
      : chartPoints[chartPoints.length - 1] ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-[#1C2825] text-balance">
            Mood Statistics &amp; Correlations
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-[#556862]">
            Explore mood fluctuations across the past week, month, and year alongside life-area and activity patterns.
          </p>
        </div>

        {/* Range Switcher (Week / Month / Year) */}
        <div className="flex items-center gap-1 p-1 bg-[#E8EEEC] rounded-lg self-start sm:self-auto shrink-0">
          {(
            [
              { id: '7D', label: 'Past Week' },
              { id: '30D', label: 'Past Month' },
              { id: '1Y', label: 'Past Year' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setRange(opt.id);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                range === opt.id
                  ? 'bg-white text-[#1C2825] shadow-xs'
                  : 'text-[#556862] hover:text-[#1C2825]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4-column Summary Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E1E7E4] rounded-xl p-4">
          <p className="text-xs text-[#647771]">Average Mood ({range})</p>
          <p className="mt-1 text-2xl font-mono font-medium tabular-nums text-[#2D6A5E]">
            {rangeStats.count > 0 ? rangeStats.avgMood.toFixed(1) : '—'}
            <span className="text-sm text-[#7D8F89]">/5</span>
          </p>
          <p className="mt-1 text-xs text-[#647771] tabular-nums">
            {rangeStats.count} {rangeStats.count === 1 ? 'check-in' : 'check-ins'} in window
          </p>
        </div>

        <div className="bg-white border border-[#E1E7E4] rounded-xl p-4">
          <p className="text-xs text-[#647771]">Energy vs. Stress ({range})</p>
          <p className="mt-1 text-2xl font-mono font-medium tabular-nums text-[#1C2825]">
            {rangeStats.count > 0 ? rangeStats.avgEnergy.toFixed(1) : '—'}
            <span className="text-sm text-[#7D8F89]"> / </span>
            <span className="text-[#94625A]">
              {rangeStats.count > 0 ? rangeStats.avgStress.toFixed(1) : '—'}
            </span>
          </p>
          <p className="mt-1 text-xs text-[#647771]">Energy vs. tension (1–5)</p>
        </div>

        <div className="bg-white border border-[#E1E7E4] rounded-xl p-4">
          <p className="text-xs text-[#647771]">Check-In Consistency</p>
          <p className="mt-1 text-2xl font-mono font-medium tabular-nums text-[#1C2825]">
            {analytics.streakDays}d
          </p>
          <p className="mt-1 text-xs text-[#647771] tabular-nums">
            {analytics.total} total entries · {analytics.totalMindfulMinutes} mindful min
          </p>
        </div>

        <div className="bg-white border border-[#E1E7E4] rounded-xl p-4">
          <p className="text-xs text-[#647771]">Dominant Emotional State</p>
          <p
            className="mt-1 text-lg font-medium truncate"
            style={{
              color: analytics.dominantMood ? analytics.dominantMood.meta.color : '#1C2825',
            }}
          >
            {analytics.dominantMood ? analytics.dominantMood.mood : 'No entries'}
          </p>
          <p className="mt-1 text-xs text-[#647771] tabular-nums">
            {analytics.dominantMood
              ? `${analytics.dominantMood.pct}% of check-ins · ${analytics.completedTipsCount}/${analytics.totalTipsCount} tips done`
              : 'Log a check-in to start'}
          </p>
        </div>
      </div>

      {/* Main Fluctuation Timeline Chart */}
      <section className="bg-white border border-[#E1E7E4] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-medium text-[#1C2825]">
              Emotional Balance Trajectory
            </h2>
            <p className="text-xs text-[#647771]">
              Hover any data point to inspect mood, energy, calmness, and reflection context
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#1C2825] px-2.5 py-1 bg-[#EDF5F2] rounded-md">
              <span className="w-2.5 h-0.5 bg-[#2D6A5E]" aria-hidden="true" />
              Mood
            </span>
            <button
              type="button"
              onClick={() => setShowEnergy((v) => !v)}
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                showEnergy
                  ? 'bg-[#E8EDF3] border-[#C1CDDB] text-[#33465E]'
                  : 'bg-white border-[#E1E7E4] text-[#73857F]'
              }`}
            >
              <span className="w-2.5 h-0.5 bg-[#4B6382]" aria-hidden="true" />
              Energy
            </button>
            <button
              type="button"
              onClick={() => setShowCalmness((v) => !v)}
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                showCalmness
                  ? 'bg-[#EFEDF4] border-[#CFC9DE] text-[#5B5273]'
                  : 'bg-white border-[#E1E7E4] text-[#73857F]'
              }`}
            >
              <span className="w-2.5 h-0.5 bg-[#736A8C]" aria-hidden="true" />
              Calmness
            </button>
          </div>
        </div>

        {chartPoints.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[#DCE4E0] rounded-lg">
            <p className="text-sm font-medium text-[#1C2825]">
              No check-ins recorded in this timeframe
            </p>
            <p className="text-xs text-[#647771] mt-1">
              Try switching to Past Month / Past Year or log today’s reflection.
            </p>
            <button
              type="button"
              onClick={onNavigateToCheckIn}
              className="mt-4 px-4 py-2 text-xs font-medium text-white bg-[#2D6A5E] hover:bg-[#23554B] rounded-lg transition-colors"
            >
              Log First Entry
            </button>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                className="w-full min-w-[540px] h-auto select-none"
                role="img"
                aria-label="Mood, energy, and calmness fluctuations over time"
              >
                <defs>
                  <linearGradient id="moodAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D6A5E" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2D6A5E" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Horizontal Y Grid Lines 1..5 */}
                {[1, 2, 3, 4, 5].map((val) => {
                  const plotH = CHART_H - PAD_T - PAD_B;
                  const y = PAD_T + plotH - ((val - 1) / 4) * plotH;
                  return (
                    <g key={val}>
                      <line
                        x1={PAD_L}
                        y1={y}
                        x2={CHART_W - PAD_R}
                        y2={y}
                        stroke="#E9EFEC"
                        strokeWidth={1}
                      />
                      <text
                        x={PAD_L - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-[#7D8F89] text-[10px] font-mono tabular-nums"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Area fill under Mood */}
                {areaPath && <path d={areaPath} fill="url(#moodAreaGrad)" />}

                {/* Secondary series */}
                {showEnergy && chartPoints.length > 1 && (
                  <path
                    d={energyPath}
                    fill="none"
                    stroke="#4B6382"
                    strokeWidth={1.75}
                    strokeDasharray="4 3"
                  />
                )}
                {showCalmness && chartPoints.length > 1 && (
                  <path
                    d={calmPath}
                    fill="none"
                    stroke="#736A8C"
                    strokeWidth={1.75}
                    strokeDasharray="2 3"
                  />
                )}

                {/* Primary Mood line */}
                {chartPoints.length > 1 && (
                  <path
                    d={moodPath}
                    fill="none"
                    stroke="#2D6A5E"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}

                {/* Data Nodes & X-Axis Labels */}
                {chartPoints.map((p, i) => {
                  const isActive = activePoint?.idx === p.idx;
                  const showLabel =
                    chartPoints.length <= 8 ||
                    i === 0 ||
                    i === chartPoints.length - 1 ||
                    i % Math.ceil(chartPoints.length / 6) === 0;
                  return (
                    <g
                      key={p.entry.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      {isActive && (
                        <line
                          x1={p.x}
                          y1={PAD_T}
                          x2={p.x}
                          y2={CHART_H - PAD_B}
                          stroke="#B8D4CA"
                          strokeWidth={1}
                        />
                      )}
                      <circle cx={p.x} cy={p.moodY} r={14} fill="transparent" />
                      <circle
                        cx={p.x}
                        cy={p.moodY}
                        r={isActive ? 5.5 : 4}
                        fill={isActive ? '#2D6A5E' : '#FFFFFF'}
                        stroke="#2D6A5E"
                        strokeWidth={2}
                      />
                      {showLabel && (
                        <text
                          x={p.x}
                          y={CHART_H - 10}
                          textAnchor="middle"
                          className="fill-[#73857F] text-[10px] font-mono tabular-nums"
                        >
                          {new Date(p.entry.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Active Data Point Inspection Strip */}
            {activePoint && (
              <div className="mt-4 pt-4 border-t border-[#EAEFED] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[#647771]">
                    <span className="font-mono tabular-nums text-[#1C2825] font-medium">
                      {activePoint.entry.dateISO}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className="font-medium"
                      style={{ color: MOOD_META[activePoint.entry.mood].color }}
                    >
                      {activePoint.entry.mood}
                    </span>
                    {activePoint.entry.activities.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{activePoint.entry.activities.join(', ')}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-[#2C3E38] mt-1 truncate">
                    {activePoint.entry.feelingNote ||
                      activePoint.entry.goalText ||
                      'Check-in reflection'}
                  </p>
                </div>

                <div className="flex items-center gap-5 shrink-0 font-mono tabular-nums">
                  <div>
                    <span className="text-[#647771] block">Mood</span>
                    <span className="text-sm font-medium text-[#2D6A5E]">
                      {activePoint.entry.moodScore.toFixed(1)}/5
                    </span>
                  </div>
                  <div>
                    <span className="text-[#647771] block">Energy</span>
                    <span className="text-sm font-medium text-[#4B6382]">
                      {activePoint.entry.energy}/5
                    </span>
                  </div>
                  <div>
                    <span className="text-[#647771] block">Calm</span>
                    <span className="text-sm font-medium text-[#736A8C]">
                      {activePoint.calmness}/5
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Correlations Grid: Activities + Life Areas + Mood Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Logged Activities Correlation */}
        <section className="lg:col-span-5 bg-white border border-[#E1E7E4] rounded-xl p-6">
          <h2 className="text-base font-medium text-[#1C2825]">
            Activity-to-Mood Correlations
          </h2>
          <p className="text-xs text-[#647771] mt-0.5 mb-4">
            How logged activities compare against your {analytics.avgMood.toFixed(1)}/5 baseline mood
          </p>

          {analytics.activityCorrelations.length === 0 ? (
            <p className="text-xs text-[#647771] py-6">
              Tag activities in your Daily Check-Ins to uncover which habits lift your mood.
            </p>
          ) : (
            <div className="divide-y divide-[#EAEFED]">
              {analytics.activityCorrelations.slice(0, 7).map((item) => {
                const positive = item.deltaFromBaseline >= 0;
                const barWidth = Math.min(100, Math.round((item.avgMood / 5) * 100));
                return (
                  <div key={item.activity} className="py-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-[#1C2825] truncate">
                        {item.activity}
                        <span className="text-[#73857F] font-normal ml-1.5 tabular-nums">
                          ({item.count}x)
                        </span>
                      </span>
                      <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                        <span className="text-[#1C2825]">{item.avgMood.toFixed(1)}/5</span>
                        <span
                          className={
                            positive ? 'text-[#2D6A5E] font-medium' : 'text-[#94625A] font-medium'
                          }
                        >
                          {positive ? `+${item.deltaFromBaseline.toFixed(1)}` : item.deltaFromBaseline.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-[#EDF2EF] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: positive ? '#2D6A5E' : '#94625A',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Wheel Life Area Correlations + Balance Insight */}
        <section className="lg:col-span-4 bg-white border border-[#E1E7E4] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-medium text-[#1C2825]">
              Life Area Correlations
            </h2>
            <p className="text-xs text-[#647771] mt-0.5 mb-4">
              Mood &amp; stress linked to Wheel of Life dimensions
            </p>

            <div className="divide-y divide-[#EAEFED]">
              {analytics.dimensionCorrelations.map((row) => (
                <div
                  key={row.dimension.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#1C2825] truncate">
                      {row.dimension.label}
                    </p>
                    <p className="text-[#73857F] tabular-nums">
                      Wheel {scores[row.dimension.id].toFixed(1)}/10 · {row.count}{' '}
                      {row.count === 1 ? 'log' : 'logs'}
                    </p>
                  </div>
                  <div className="text-right font-mono tabular-nums shrink-0">
                    <span className="block text-[#2D6A5E] font-medium">
                      Mood {row.avgMood?.toFixed(1)}
                    </span>
                    <span className="block text-[#73857F]">
                      Stress {row.avgStress?.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#EAEFED] bg-[#F6F9F8] rounded-lg p-3">
            <p className="text-xs font-medium text-[#1C2825]">Wheel Balance Link</p>
            <p className="text-xs text-[#4E615B] mt-1 leading-relaxed">
              {analytics.balanceMoodInsight} Current overall Wheel average is{' '}
              <span className="font-mono tabular-nums font-medium">
                {balanceSummary.average.toFixed(1)}/10
              </span>
              .
            </p>
          </div>
        </section>

        {/* Emotional State Distribution */}
        <section className="lg:col-span-3 bg-white border border-[#E1E7E4] rounded-xl p-6">
          <h2 className="text-base font-medium text-[#1C2825]">Mood Distribution</h2>
          <p className="text-xs text-[#647771] mt-0.5 mb-4">
            Frequency across all {analytics.total} check-ins
          </p>

          <div className="space-y-3.5">
            {analytics.distribution.map((d) => (
              <div key={d.mood}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-[#1C2825]">{d.mood}</span>
                  <span className="font-mono tabular-nums text-[#596C66]">
                    {d.count} ({d.pct}%)
                  </span>
                </div>
                <div className="h-2 bg-[#EDF2EF] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${d.pct}%`,
                      backgroundColor: d.meta.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Compact Check-In Log Table */}
      <section className="bg-white border border-[#E1E7E4] rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-base font-medium text-[#1C2825]">
            Logged Entries in Selected Window
          </h2>
          <span className="text-xs font-mono tabular-nums text-[#647771]">
            {timelineEntries.length} rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E1E7E4] text-[#647771]">
                <th className="py-2.5 pr-4 font-medium">Date</th>
                <th className="py-2.5 pr-4 font-medium">Mood State</th>
                <th className="py-2.5 pr-4 font-medium">Life Area</th>
                <th className="py-2.5 pr-4 font-medium">Activities &amp; Goal</th>
                <th className="py-2.5 pl-4 text-right font-medium">Mood</th>
                <th className="py-2.5 pl-4 text-right font-medium">Energy</th>
                <th className="py-2.5 pl-4 text-right font-medium">Stress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEFED]">
              {[...timelineEntries].reverse().map((row) => {
                const dimName =
                  WHEEL_DIMENSIONS.find((d) => d.id === row.linkedDimensionId)?.shortLabel ??
                  '—';
                return (
                  <tr key={row.id} className="hover:bg-[#F8FAF9] transition-colors h-10">
                    <td className="py-2 pr-4 font-mono tabular-nums text-[#1C2825] whitespace-nowrap">
                      {row.dateISO}
                    </td>
                    <td
                      className="py-2 pr-4 font-medium whitespace-nowrap"
                      style={{ color: MOOD_META[row.mood].color }}
                    >
                      {row.mood}
                    </td>
                    <td className="py-2 pr-4 text-[#4E615B] whitespace-nowrap">{dimName}</td>
                    <td className="py-2 pr-4 text-[#2C3E38] max-w-[340px] truncate">
                      {row.goalText || row.feelingNote || row.activities.join(', ') || '—'}
                    </td>
                    <td className="py-2 pl-4 text-right font-mono tabular-nums text-[#2D6A5E]">
                      {row.moodScore.toFixed(1)}
                    </td>
                    <td className="py-2 pl-4 text-right font-mono tabular-nums text-[#1C2825]">
                      {row.energy}/5
                    </td>
                    <td className="py-2 pl-4 text-right font-mono tabular-nums text-[#94625A]">
                      {row.stress}/5
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
