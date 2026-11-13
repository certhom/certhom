import { useCallback, useEffect, useMemo, useState } from 'react';
import { DailyCheckInView } from './components/DailyCheckInView';
import { MindfulnessStudioView } from './components/MindfulnessStudioView';
import { MoodAnalyticsView } from './components/MoodAnalyticsView';
import { WheelAssessmentView } from './components/WheelAssessmentView';
import {
  DEFAULT_QUESTION_ANSWERS,
  computeDimensionScores,
  createSampleCheckIns,
  createSampleMindfulnessLogs,
  createSampleSnapshots,
} from './data/wheelData';
import {
  AppView,
  DailyCheckIn,
  MindfulnessPractice,
  MindfulnessSessionLog,
  QuestionAnswers,
  WheelDimensionId,
  WheelSnapshot,
} from './types';
import { loadPersistedState, savePersistedState } from './utils/storage';

export function App() {
  const initial = useMemo(() => loadPersistedState(), []);

  const [activeView, setActiveView] = useState<AppView>(AppView.WHEEL);
  const [answers, setAnswers] = useState<QuestionAnswers>(initial.answers);
  const [snapshots, setSnapshots] = useState<WheelSnapshot[]>(initial.snapshots);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(initial.checkIns);
  const [mindfulnessLogs, setMindfulnessLogs] = useState<MindfulnessSessionLog[]>(
    initial.mindfulnessLogs
  );
  const [customRecommendations, setCustomRecommendations] = useState<
    MindfulnessPractice[]
  >(initial.customRecommendations);
  const [preferredCheckInDim, setPreferredCheckInDim] = useState<
    WheelDimensionId | undefined
  >(undefined);

  const scores = useMemo(() => computeDimensionScores(answers), [answers]);

  useEffect(() => {
    savePersistedState({
      answers,
      snapshots,
      checkIns,
      mindfulnessLogs,
      customRecommendations,
    });
  }, [answers, snapshots, checkIns, mindfulnessLogs, customRecommendations]);

  const handleUpdateAnswer = useCallback((questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  const handleSaveSnapshot = useCallback(
    (note: string) => {
      const nextSnap: WheelSnapshot = {
        id: `snap_${Date.now()}`,
        createdAt: new Date().toISOString(),
        answers: { ...answers },
        scores: computeDimensionScores(answers),
        note: note || undefined,
      };
      setSnapshots((prev) => [nextSnap, ...prev]);
    },
    [answers]
  );

  const handleAddCheckIn = useCallback((entry: DailyCheckIn) => {
    setCheckIns((prev) => [entry, ...prev]);
  }, []);

  const handleToggleTip = useCallback((checkInId: string, tipId: string) => {
    setCheckIns((prev) =>
      prev.map((entry) => {
        if (entry.id !== checkInId) return entry;
        return {
          ...entry,
          goalTips: entry.goalTips.map((t) =>
            t.id === tipId ? { ...t, completed: !t.completed } : t
          ),
        };
      })
    );
  }, []);

  const handleDeleteCheckIn = useCallback((checkInId: string) => {
    setCheckIns((prev) => prev.filter((c) => c.id !== checkInId));
  }, []);

  const handleLogMindfulnessSession = useCallback(
    (practiceTitle: string, durationMinutes: number) => {
      const entry: MindfulnessSessionLog = {
        id: `ms_${Date.now()}`,
        createdAt: new Date().toISOString(),
        practiceTitle,
        durationMinutes,
      };
      setMindfulnessLogs((prev) => [entry, ...prev]);
    },
    []
  );

  const handleResetDemoData = useCallback(() => {
    setAnswers(DEFAULT_QUESTION_ANSWERS);
    setSnapshots(createSampleSnapshots());
    setCheckIns(createSampleCheckIns());
    setMindfulnessLogs(createSampleMindfulnessLogs());
    setCustomRecommendations([]);
  }, []);

  const handleExportData = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      scores,
      snapshots,
      checkIns,
      mindfulnessLogs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sweet-spot-journal-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scores, snapshots, checkIns, mindfulnessLogs]);

  const navItems: Array<{ id: AppView; label: string }> = [
    { id: AppView.WHEEL, label: 'Life Wheel' },
    { id: AppView.CHECK_IN, label: 'Daily Check-In' },
    { id: AppView.ANALYTICS, label: 'Mood Stats' },
    { id: AppView.MINDFULNESS, label: 'Mindfulness' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F6] text-[#1C2825]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-20 bg-[#F5F7F6]/95 backdrop-blur-xs border-b border-[#E1E7E4]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveView(AppView.WHEEL)}
            className="text-xl font-display font-medium tracking-tight text-[#1C2825] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sweet Spot
          </button>

          {/* Zone 2: 4 single-line clean navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7"
          >
            {navItems.map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    active
                      ? 'text-[#1C2825] border-[#2D6A5E]'
                      : 'text-[#596C66] border-transparent hover:text-[#1C2825]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setActiveView(AppView.CHECK_IN)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#2D6A5E] hover:bg-[#23554B] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              New Check-In
            </button>
          </div>
        </div>

        {/* Mobile single-line scrollable nav strip */}
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#E6ECE9] px-4 py-2 flex items-center gap-4 overflow-x-auto"
        >
          {navItems.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`text-xs font-medium py-1 whitespace-nowrap shrink-0 border-b-2 ${
                  active
                    ? 'text-[#1C2825] border-[#2D6A5E]'
                    : 'text-[#596C66] border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-8 py-8">
        {activeView === AppView.WHEEL && (
          <WheelAssessmentView
            answers={answers}
            scores={scores}
            snapshots={snapshots}
            onUpdateAnswer={handleUpdateAnswer}
            onResetAnswers={setAnswers}
            onSaveSnapshot={handleSaveSnapshot}
            onNavigateToCheckIn={(dimId) => {
              setPreferredCheckInDim(dimId);
              setActiveView(AppView.CHECK_IN);
            }}
          />
        )}

        {activeView === AppView.CHECK_IN && (
          <DailyCheckInView
            scores={scores}
            checkIns={checkIns}
            initialDimensionId={preferredCheckInDim}
            onAddCheckIn={handleAddCheckIn}
            onToggleTip={handleToggleTip}
            onDeleteCheckIn={handleDeleteCheckIn}
          />
        )}

        {activeView === AppView.ANALYTICS && (
          <MoodAnalyticsView
            checkIns={checkIns}
            mindfulnessLogs={mindfulnessLogs}
            scores={scores}
            onNavigateToCheckIn={() => setActiveView(AppView.CHECK_IN)}
          />
        )}

        {activeView === AppView.MINDFULNESS && (
          <MindfulnessStudioView
            scores={scores}
            checkIns={checkIns}
            mindfulnessLogs={mindfulnessLogs}
            customRecommendations={customRecommendations}
            onSaveCustomRecommendations={setCustomRecommendations}
            onLogMindfulnessSession={handleLogMindfulnessSession}
          />
        )}
      </main>

      {/* Quiet Footer with Real User Actions */}
      <footer className="border-t border-[#E1E7E4] bg-[#F5F7F6]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#647771]">
          <p>Sweet Spot · Wheel of Life &amp; Daily Reflection</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleExportData}
              className="hover:text-[#1C2825] transition-colors whitespace-nowrap"
            >
              Export Journal JSON
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleResetDemoData}
              className="hover:text-[#1C2825] transition-colors whitespace-nowrap"
            >
              Restore Sample History
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
