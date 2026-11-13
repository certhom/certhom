import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCcw, Save } from 'lucide-react';
import {
  DEFAULT_QUESTION_ANSWERS,
  WHEEL_DIMENSIONS,
  WHEEL_QUESTIONS,
} from '../data/wheelData';
import {
  DimensionScores,
  QuestionAnswers,
  WheelDimensionId,
  WheelSnapshot,
} from '../types';
import { computeBalanceSummary } from '../utils/storage';
import { RadarChart } from './RadarChart';

interface WheelAssessmentViewProps {
  answers: QuestionAnswers;
  scores: DimensionScores;
  snapshots: WheelSnapshot[];
  onUpdateAnswer: (questionId: string, value: number) => void;
  onResetAnswers: (nextAnswers: QuestionAnswers) => void;
  onSaveSnapshot: (note: string) => void;
  onNavigateToCheckIn: (dimensionId: WheelDimensionId) => void;
}

export const WheelAssessmentView: React.FC<WheelAssessmentViewProps> = ({
  answers,
  scores,
  snapshots,
  onUpdateAnswer,
  onResetAnswers,
  onSaveSnapshot,
  onNavigateToCheckIn,
}) => {
  const [selectedDimId, setSelectedDimId] = useState<WheelDimensionId>('career');
  const [questionMode, setQuestionMode] = useState<'single' | 'all'>('single');
  const [showComparison, setShowComparison] = useState(true);
  const [showTargetRing, setShowTargetRing] = useState(true);
  const [snapshotNote, setSnapshotNote] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const summary = useMemo(() => computeBalanceSummary(scores), [scores]);

  // Pick the most recent prior snapshot (or second latest if user already saved one just now)
  const comparisonSnapshot = useMemo(() => {
    if (snapshots.length === 0) return null;
    if (snapshots.length === 1) return snapshots[0];
    // Compare against the previous snapshot relative to latest saved or oldest baseline
    return snapshots[0];
  }, [snapshots]);

  const currentDimIndex = WHEEL_DIMENSIONS.findIndex((d) => d.id === selectedDimId);
  const currentDimension = WHEEL_DIMENSIONS[currentDimIndex] ?? WHEEL_DIMENSIONS[0];

  const visibleQuestions = useMemo(() => {
    if (questionMode === 'all') return WHEEL_QUESTIONS;
    return WHEEL_QUESTIONS.filter((q) => q.dimensionId === selectedDimId);
  }, [questionMode, selectedDimId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSnapshot(snapshotNote.trim());
    setSnapshotNote('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2600);
  };

  const handleStepDimension = (dir: -1 | 1) => {
    const nextIdx = (currentDimIndex + dir + WHEEL_DIMENSIONS.length) % WHEEL_DIMENSIONS.length;
    setSelectedDimId(WHEEL_DIMENSIONS[nextIdx].id);
  };

  return (
    <div className="space-y-6">
      {/* Intro & Top Balance Strip */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-[#1C2825] text-balance">
            Your Wheel of Life
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-[#556862]">
            Answer the reflection prompts on the right to see your balance chart reshape in real time.
          </p>
        </div>

        {/* Chart Overlay Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowComparison((v) => !v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              showComparison
                ? 'bg-[#E8EDF3] border-[#C1CDDB] text-[#33465E]'
                : 'bg-white border-[#DDE4E0] text-[#556862] hover:text-[#1C2825]'
            }`}
          >
            {showComparison ? 'Comparing Prior Snapshot' : 'Compare Prior Snapshot'}
          </button>
          <button
            type="button"
            onClick={() => setShowTargetRing((v) => !v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              showTargetRing
                ? 'bg-[#DCEAE5] border-[#B8D4CA] text-[#23554B]'
                : 'bg-white border-[#DDE4E0] text-[#556862] hover:text-[#1C2825]'
            }`}
          >
            Target Ring (8.0)
          </button>
        </div>
      </div>

      {/* 4-column summary metrics strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E1E7E4] rounded-xl p-4">
          <p className="text-xs text-[#647771]">Overall Balance</p>
          <p className="mt-1 text-2xl font-mono font-medium tabular-nums text-[#1C2825]">
            {summary.average.toFixed(1)}
            <span className="text-sm text-[#7D8F89]">/10</span>
          </p>
          <p className="mt-1 text-xs text-[#647771]">Across 8 life dimensions</p>
        </div>

        <div className="bg-white border border-[#E1E7E4] rounded-xl p-4">
          <p className="text-xs text-[#647771]">Wheel Harmony</p>
          <p className="mt-1 text-2xl font-mono font-medium tabular-nums text-[#2D6A5E]">
            {summary.harmonyPct}%
          </p>
          <p className="mt-1 text-xs text-[#647771]">Evenness across spokes</p>
        </div>

        <div className="bg-white border border-[#E1E7E4] rounded-xl p-4">
          <p className="text-xs text-[#647771]">Strongest Area</p>
          <p className="mt-1 text-base font-medium text-[#1C2825] truncate">
            {summary.highest.dimension.label}
          </p>
          <p className="mt-1 text-xs font-mono tabular-nums text-[#2D6A5E]">
            {summary.highest.score.toFixed(1)} / 10
          </p>
        </div>

        <div className="bg-white border border-[#E1E7E4] rounded-xl p-4">
          <p className="text-xs text-[#647771]">Area Inviting Care</p>
          <p className="mt-1 text-base font-medium text-[#1C2825] truncate">
            {summary.lowest.dimension.label}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-xs font-mono tabular-nums text-[#94625A]">
              {summary.lowest.score.toFixed(1)} / 10
            </span>
            <button
              type="button"
              onClick={() => onNavigateToCheckIn(summary.lowest.dimension.id)}
              className="text-xs font-medium text-[#2D6A5E] hover:underline whitespace-nowrap shrink-0"
            >
              Set goal
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-column Interactive Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Real-Time Radar Chart + Snapshot Form */}
        <section className="lg:col-span-7 bg-white border border-[#E1E7E4] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-4 text-xs text-[#596C66]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 bg-[#2D6A5E]" aria-hidden="true" />
                  Live Assessment
                </span>
                {showComparison && comparisonSnapshot && (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block w-3 h-0.5 border-t border-dashed border-[#4B6382]"
                      aria-hidden="true"
                    />
                    Baseline ({new Date(comparisonSnapshot.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                  </span>
                )}
              </div>
              <span className="text-xs font-mono tabular-nums text-[#647771]">
                {snapshots.length} saved {snapshots.length === 1 ? 'snapshot' : 'snapshots'}
              </span>
            </div>

            <RadarChart
              scores={scores}
              previousScores={comparisonSnapshot?.scores ?? null}
              selectedDimensionId={selectedDimId}
              onSelectDimension={(id) => {
                setSelectedDimId(id);
                setQuestionMode('single');
              }}
              showComparison={showComparison}
              showTargetRing={showTargetRing}
            />
          </div>

          {/* Save Snapshot Strip */}
          <form
            onSubmit={handleSave}
            className="mt-5 pt-4 border-t border-[#E6ECE9] flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <input
              type="text"
              value={snapshotNote}
              onChange={(e) => setSnapshotNote(e.target.value)}
              placeholder="Optional note for this Wheel snapshot (e.g., After autumn reset)..."
              maxLength={140}
              className="flex-1 min-w-0 px-3.5 py-2 text-sm bg-[#F8FAF9] border border-[#DCE4E0] rounded-lg text-[#1C2825] placeholder:text-[#869791] focus:outline-none focus:border-[#2D6A5E] focus:bg-white transition-colors"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2D6A5E] hover:bg-[#24564C] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {savedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedNotice ? 'Snapshot Saved' : 'Save Snapshot'}</span>
            </button>
          </form>
        </section>

        {/* Right: Guided Wheel of Life Questionnaire */}
        <section className="lg:col-span-5 bg-white border border-[#E1E7E4] rounded-xl p-6 flex flex-col justify-between">
          <div>
            {/* Mode Switcher + Reset */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E6ECE9]">
              <div className="flex items-center gap-1 p-1 bg-[#EFF3F1] rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuestionMode('single')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    questionMode === 'single'
                      ? 'bg-white text-[#1C2825] shadow-xs'
                      : 'text-[#596C66] hover:text-[#1C2825]'
                  }`}
                >
                  By Dimension
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionMode('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    questionMode === 'all'
                      ? 'bg-white text-[#1C2825] shadow-xs'
                      : 'text-[#596C66] hover:text-[#1C2825]'
                  }`}
                >
                  All 24 Questions
                </button>
              </div>

              <button
                type="button"
                onClick={() => onResetAnswers(DEFAULT_QUESTION_ANSWERS)}
                className="inline-flex items-center gap-1.5 text-xs text-[#647771] hover:text-[#1C2825] transition-colors whitespace-nowrap shrink-0"
                title="Reset sliders to baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Dimension Quick Selector Pills (Interactive Filter Controls) */}
            {questionMode === 'single' && (
              <div className="mt-4">
                <div className="grid grid-cols-4 gap-1.5">
                  {WHEEL_DIMENSIONS.map((dim) => {
                    const active = dim.id === selectedDimId;
                    return (
                      <button
                        key={dim.id}
                        type="button"
                        onClick={() => setSelectedDimId(dim.id)}
                        className={`px-2 py-2 rounded-lg text-left border transition-colors ${
                          active
                            ? 'bg-[#EDF5F2] border-[#2D6A5E] text-[#1C2825]'
                            : 'bg-[#F8FAF9] border-[#E6ECE9] text-[#596C66] hover:border-[#C5D1CC] hover:text-[#1C2825]'
                        }`}
                      >
                        <span className="block text-[11px] font-medium truncate">
                          {dim.shortLabel}
                        </span>
                        <span className="block text-xs font-mono tabular-nums text-[#2D6A5E] mt-0.5">
                          {scores[dim.id].toFixed(1)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Dimension Header */}
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-display font-medium text-[#1C2825]">
                      {currentDimension.label}
                    </h2>
                    <p className="text-xs text-[#596C66] mt-0.5">
                      {currentDimension.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-mono font-medium tabular-nums text-[#2D6A5E]">
                      {scores[currentDimension.id].toFixed(1)}
                    </span>
                    <span className="text-xs text-[#7D8F89] font-mono">/10</span>
                  </div>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div
              className={`mt-5 divide-y divide-[#E9EFEC] ${
                questionMode === 'all' ? 'max-h-[540px] overflow-y-auto pr-2' : ''
              }`}
            >
              {visibleQuestions.map((q, idx) => {
                const value = answers[q.id] ?? 5;
                const dimLabel =
                  questionMode === 'all'
                    ? WHEEL_DIMENSIONS.find((d) => d.id === q.dimensionId)?.shortLabel
                    : null;

                return (
                  <div key={q.id} className={idx === 0 ? 'pb-4' : 'py-4'}>
                    <div className="flex items-start justify-between gap-3">
                      <label
                        htmlFor={`slider-${q.id}`}
                        className="text-sm text-[#1C2825] leading-snug font-medium"
                      >
                        {dimLabel && (
                          <span className="text-xs font-normal text-[#647771] mr-1.5">
                            {dimLabel} ·
                          </span>
                        )}
                        {q.prompt}
                      </label>
                      <span className="text-sm font-mono font-medium tabular-nums text-[#2D6A5E] shrink-0">
                        {value}
                      </span>
                    </div>

                    <div className="mt-3">
                      <input
                        id={`slider-${q.id}`}
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={value}
                        onChange={(e) => onUpdateAnswer(q.id, Number(e.target.value))}
                        className="w-full calm-slider"
                      />
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#73857F]">
                        <span>1 · {q.lowAnchor}</span>
                        <span>10 · {q.highAnchor}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Footer for Single-Dimension Mode */}
          {questionMode === 'single' && (
            <div className="mt-4 pt-4 border-t border-[#E6ECE9] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleStepDimension(-1)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4E615B] hover:text-[#1C2825] bg-[#F5F7F6] hover:bg-[#EAEFED] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-mono tabular-nums text-[#647771]">
                {currentDimIndex + 1} / {WHEEL_DIMENSIONS.length}
              </span>

              <button
                type="button"
                onClick={() => handleStepDimension(1)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1C2825] bg-[#DCEAE5] hover:bg-[#CFE2DB] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span>Next Area</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Saved Snapshots History Strip */}
      {snapshots.length > 0 && (
        <section className="bg-white border border-[#E1E7E4] rounded-xl p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-base font-medium text-[#1C2825]">Saved Wheel Snapshots</h2>
            <span className="text-xs text-[#647771]">
              Load any past snapshot to inspect or compare against your live wheel
            </span>
          </div>

          <div className="divide-y divide-[#E9EFEC]">
            {[...snapshots]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((snap) => {
                const snapSummary = computeBalanceSummary(snap.scores);
                return (
                  <div
                    key={snap.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-[#647771]">
                        <span className="font-mono tabular-nums text-[#1C2825] font-medium">
                          {new Date(snap.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Avg {snapSummary.average.toFixed(1)}/10
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Harmony {snapSummary.harmonyPct}%</span>
                      </div>
                      {snap.note && (
                        <p className="text-sm text-[#4E615B] mt-1 truncate">{snap.note}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onResetAnswers(snap.answers)}
                      className="px-3 py-1.5 text-xs font-medium text-[#2D6A5E] bg-[#EDF5F2] hover:bg-[#DCEAE5] rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      Load into Wheel
                    </button>
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
};
