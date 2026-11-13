import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Search,
  Shuffle,
  Trash2,
} from 'lucide-react';
import {
  DAILY_ACTIVITIES,
  MOOD_META,
  WHEEL_DIMENSIONS,
  getCuratedMindfulnessForState,
  selectDailyPrompts,
} from '../data/wheelData';
import {
  CheckInFocus,
  DailyCheckIn,
  DailyPromptResponse,
  DimensionScores,
  GoalTip,
  MindfulnessPractice,
  MoodState,
  WheelDimensionId,
} from '../types';
import { computeBalanceSummary } from '../utils/storage';

interface DailyCheckInViewProps {
  scores: DimensionScores;
  checkIns: DailyCheckIn[];
  initialDimensionId?: WheelDimensionId;
  onAddCheckIn: (entry: DailyCheckIn) => void;
  onToggleTip: (checkInId: string, tipId: string) => void;
  onDeleteCheckIn: (checkInId: string) => void;
}

export const DailyCheckInView: React.FC<DailyCheckInViewProps> = ({
  scores,
  checkIns,
  initialDimensionId,
  onAddCheckIn,
  onToggleTip,
  onDeleteCheckIn,
}) => {
  const todayISO = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const balanceSummary = useMemo(() => computeBalanceSummary(scores), [scores]);

  // Randomized 4 daily questions seeded by today's date + optional shuffle
  const [promptSalt, setPromptSalt] = useState(0);
  const dailyPrompts = useMemo(
    () => selectDailyPrompts(todayISO, promptSalt, 4),
    [todayISO, promptSalt]
  );
  const [promptDrafts, setPromptDrafts] = useState<Record<string, string>>({});

  // Mood & Reflection State
  const [mood, setMood] = useState<MoodState>(MoodState.GROUNDED);
  const [moodIntensity, setMoodIntensity] = useState(4);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(2);
  const [focusType, setFocusType] = useState<CheckInFocus>(CheckInFocus.GOAL);
  const [linkedDimensionId, setLinkedDimensionId] = useState<WheelDimensionId>(
    initialDimensionId ?? balanceSummary.lowest.dimension.id
  );
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    'Movement & Walk',
  ]);
  const [feelingNote, setFeelingNote] = useState('');
  const [ideaNote, setIdeaNote] = useState('');
  const [goalText, setGoalText] = useState('');

  // Submission & Feedback State
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    checkIns[0]?.id ?? null
  );

  // Filter & Search
  const [filterFocus, setFilterFocus] = useState<'ALL' | CheckInFocus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleActivity = (act: string) => {
    setSelectedActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const filteredCheckIns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...checkIns]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((item) => {
        if (filterFocus !== 'ALL' && item.focusType !== filterFocus) return false;
        if (!q) return true;
        return (
          item.goalText.toLowerCase().includes(q) ||
          item.feelingNote.toLowerCase().includes(q) ||
          item.ideaNote.toLowerCase().includes(q) ||
          item.mood.toLowerCase().includes(q) ||
          item.activities.some((a) => a.toLowerCase().includes(q))
        );
      });
  }, [checkIns, filterFocus, searchQuery]);

  const activeEntry = useMemo(() => {
    return (
      filteredCheckIns.find((c) => c.id === selectedEntryId) ??
      filteredCheckIns[0] ??
      null
    );
  }, [filteredCheckIns, selectedEntryId]);

  const buildLocalFallbackGuidance = (
    dimLabel: string
  ): {
    goalTips: GoalTip[];
    mindfulness: MindfulnessPractice;
    reflectionNote: string;
  } => {
    const curated = getCuratedMindfulnessForState(scores, mood)[0];
    return {
      goalTips: [
        {
          id: `tip_${Date.now()}_1`,
          title: 'Define a 10-minute opening step',
          detail: `Shrink today’s ${dimLabel.toLowerCase()} intention into one concrete action you can finish in ten quiet minutes.`,
          completed: false,
        },
        {
          id: `tip_${Date.now()}_2`,
          title: 'Remove one source of friction',
          detail: 'Set out what you need ahead of time and silence non-essential notifications during your focus block.',
          completed: false,
        },
        {
          id: `tip_${Date.now()}_3`,
          title: 'Pair with a soothing anchor',
          detail: 'Follow the effort with warm tea, a brief walk, or five unhurried breaths so progress feels rewarding.',
          completed: false,
        },
      ],
      mindfulness: curated,
      reflectionNote: `You checked in feeling ${mood.toLowerCase()} while tending to ${dimLabel}. Small, sustainable steps protect both momentum and calm.`,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiNotice(null);
    setIsGenerating(true);

    const linkedDim = WHEEL_DIMENSIONS.find((d) => d.id === linkedDimensionId);
    const wheelScoresLabeled: Record<string, number> = {};
    for (const d of WHEEL_DIMENSIONS) {
      wheelScoresLabeled[d.label] = scores[d.id];
    }

    const promptResponses: DailyPromptResponse[] = dailyPrompts.map((p) => ({
      questionId: p.id,
      category: String(p.category),
      prompt: p.prompt,
      response: (promptDrafts[p.id] || '').trim(),
      linkedDimensionId: p.linkedDimensionId,
    }));

    const recentSummary = checkIns
      .slice(0, 4)
      .map((c) => `${c.dateISO}: ${c.mood} (energy ${c.energy}/5, stress ${c.stress}/5)`)
      .join('; ');

    let goalTips: GoalTip[] = [];
    let mindfulness: MindfulnessPractice | undefined;
    let reflectionNote = '';

    try {
      const response = await fetch('/api/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          moodIntensity,
          energy,
          stress,
          focusType,
          feelingNote: feelingNote.trim(),
          ideaNote: ideaNote.trim(),
          goalText: goalText.trim(),
          linkedDimensionLabel: linkedDim?.label,
          activities: selectedActivities,
          promptResponses,
          wheelScores: wheelScoresLabeled,
          recentMoodSummary: recentSummary,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not reach guidance service.');
      }

      goalTips = Array.isArray(data.goalTips)
        ? data.goalTips.map((t: { title: string; detail: string }, idx: number) => ({
            id: `tip_${Date.now()}_${idx}`,
            title: t.title,
            detail: t.detail,
            completed: false,
          }))
        : [];
      mindfulness = data.mindfulness;
      reflectionNote = data.reflectionNote || '';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Guidance service unavailable.';
      setApiNotice(`${msg} Saved your check-in with curated local tips instead.`);
      const fallback = buildLocalFallbackGuidance(linkedDim?.label ?? 'Life Balance');
      goalTips = fallback.goalTips;
      mindfulness = fallback.mindfulness;
      reflectionNote = fallback.reflectionNote;
    }

    const baseValence = MOOD_META[mood].valence;
    const moodScore = Number(
      Math.min(5, Math.max(1, baseValence + (moodIntensity - 3) * 0.2)).toFixed(1)
    );

    const newEntry: DailyCheckIn = {
      id: `checkin_${Date.now()}`,
      dateISO: todayISO,
      createdAt: new Date().toISOString(),
      mood,
      moodScore,
      moodIntensity,
      energy,
      stress,
      focusType,
      feelingNote: feelingNote.trim(),
      ideaNote: ideaNote.trim(),
      goalText: goalText.trim(),
      linkedDimensionId,
      activities: selectedActivities,
      promptResponses: promptResponses.filter((pr) => pr.response.length > 0),
      wheelBalanceAtCheckIn: balanceSummary.average,
      goalTips,
      mindfulness,
      reflectionNote,
    };

    onAddCheckIn(newEntry);
    setSelectedEntryId(newEntry.id);
    setFeelingNote('');
    setIdeaNote('');
    setGoalText('');
    setPromptDrafts({});
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-[#1C2825] text-balance">
          Daily Check-In &amp; Reflection
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-[#556862]">
          Log how you feel, answer today’s randomized reflection prompts, and receive practical goal tips paired with mindfulness support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Check-In Form */}
        <section className="lg:col-span-6 bg-white border border-[#E1E7E4] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood Selection */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <label className="text-sm font-medium text-[#1C2825]">
                  How are you arriving today?
                </label>
                <span className="text-xs font-mono tabular-nums text-[#647771]">
                  {todayISO}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(Object.keys(MOOD_META) as MoodState[]).map((m) => {
                  const meta = MOOD_META[m];
                  const active = mood === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      style={
                        active
                          ? {
                              backgroundColor: meta.softBg,
                              borderColor: meta.color,
                              color: '#1C2825',
                            }
                          : undefined
                      }
                      className={`px-3 py-2.5 rounded-lg border text-left transition-colors ${
                        active
                          ? 'font-medium'
                          : 'bg-[#F8FAF9] border-[#E6ECE9] text-[#556862] hover:border-[#C7D3CE]'
                      }`}
                    >
                      <span className="block text-xs font-medium whitespace-nowrap">
                        {meta.label}
                      </span>
                      <span className="block text-[10px] text-[#647771] mt-0.5 line-clamp-1">
                        {meta.valence >= 4
                          ? 'High ease'
                          : meta.valence >= 3
                            ? 'Quiet'
                            : 'Needs care'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-[#596C66]">
                {MOOD_META[mood].label}: {MOOD_META[mood].description}
              </p>
            </div>

            {/* Intensity / Energy / Stress Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#EAEFED]">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#4E615B] font-medium">Mood Depth</span>
                  <span className="font-mono tabular-nums text-[#2D6A5E]">{moodIntensity}/5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={moodIntensity}
                  onChange={(e) => setMoodIntensity(Number(e.target.value))}
                  className="w-full calm-slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#4E615B] font-medium">Energy</span>
                  <span className="font-mono tabular-nums text-[#2D6A5E]">{energy}/5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={energy}
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  className="w-full calm-slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#4E615B] font-medium">Stress</span>
                  <span className="font-mono tabular-nums text-[#94625A]">{stress}/5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={stress}
                  onChange={(e) => setStress(Number(e.target.value))}
                  className="w-full calm-slider"
                />
              </div>
            </div>

            {/* Recent Activities Logged (Correlated in Analytics) */}
            <div className="pt-2 border-t border-[#EAEFED]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="text-sm font-medium text-[#1C2825]">
                  Recent activities
                </label>
                <span className="text-xs text-[#647771]">
                  Tracked against mood trends
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DAILY_ACTIVITIES.map((act) => {
                  const selected = selectedActivities.includes(act);
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => toggleActivity(act)}
                      className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                        selected
                          ? 'bg-[#DCEAE5] border-[#2D6A5E] text-[#1C2825] font-medium'
                          : 'bg-[#F8FAF9] border-[#E1E7E4] text-[#556862] hover:border-[#BFCBC6]'
                      }`}
                    >
                      {act}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4 Randomized Daily Reflection Questions */}
            <div className="pt-3 border-t border-[#EAEFED] space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-[#1C2825]">
                    Today’s Reflection Prompts (4)
                  </h2>
                  <p className="text-xs text-[#647771]">
                    Responses are stored to correlate with your Wheel of Life balance
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPromptSalt((s) => s + 1)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#2D6A5E] bg-[#EDF5F2] hover:bg-[#DCEAE5] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle</span>
                </button>
              </div>

              <div className="space-y-3">
                {dailyPrompts.map((q, i) => {
                  const linked = WHEEL_DIMENSIONS.find((d) => d.id === q.linkedDimensionId);
                  return (
                    <div key={q.id} className="space-y-1.5">
                      <label
                        htmlFor={`prompt-${q.id}`}
                        className="block text-xs font-medium text-[#2C3E38]"
                      >
                        <span className="font-mono text-[#647771] mr-1.5">0{i + 1}.</span>
                        {q.prompt}
                        <span className="font-normal text-[#73857F] ml-1.5">
                          · {q.category} · {linked?.shortLabel}
                        </span>
                      </label>
                      <input
                        id={`prompt-${q.id}`}
                        type="text"
                        value={promptDrafts[q.id] || ''}
                        onChange={(e) =>
                          setPromptDrafts((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        placeholder={q.placeholder}
                        className="w-full px-3 py-2 text-sm bg-[#F8FAF9] border border-[#DCE4E0] rounded-lg text-[#1C2825] placeholder:text-[#869791] focus:outline-none focus:border-[#2D6A5E] focus:bg-white transition-colors"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Focus Type + Linked Wheel Dimension + Open Notes/Goal */}
            <div className="pt-3 border-t border-[#EAEFED] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-[#4E615B] mb-1.5">
                    Primary Focus
                  </span>
                  <div className="flex items-center gap-1 p-1 bg-[#EFF3F1] rounded-lg">
                    {[CheckInFocus.GOAL, CheckInFocus.FEELING, CheckInFocus.IDEA].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFocusType(f)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                          focusType === f
                            ? 'bg-white text-[#1C2825] shadow-xs'
                            : 'text-[#596C66] hover:text-[#1C2825]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="linked-dimension"
                    className="block text-xs font-medium text-[#4E615B] mb-1.5"
                  >
                    Life Area
                  </label>
                  <select
                    id="linked-dimension"
                    value={linkedDimensionId}
                    onChange={(e) => setLinkedDimensionId(e.target.value as WheelDimensionId)}
                    className="w-full px-3 py-2 text-sm bg-[#F8FAF9] border border-[#DCE4E0] rounded-lg text-[#1C2825] focus:outline-none focus:border-[#2D6A5E] focus:bg-white"
                  >
                    {WHEEL_DIMENSIONS.map((dim) => (
                      <option key={dim.id} value={dim.id}>
                        {dim.label} ({scores[dim.id].toFixed(1)}/10)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="goal-input"
                  className="block text-xs font-medium text-[#4E615B] mb-1.5"
                >
                  Goal or Intention to Support
                </label>
                <input
                  id="goal-input"
                  type="text"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="e.g., Finish my draft calmly by 3 PM and step outside before dinner"
                  className="w-full px-3.5 py-2 text-sm bg-[#F8FAF9] border border-[#DCE4E0] rounded-lg text-[#1C2825] placeholder:text-[#869791] focus:outline-none focus:border-[#2D6A5E] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="feeling-input"
                    className="block text-xs font-medium text-[#4E615B] mb-1.5"
                  >
                    Feelings Note
                  </label>
                  <textarea
                    id="feeling-input"
                    rows={2}
                    value={feelingNote}
                    onChange={(e) => setFeelingNote(e.target.value)}
                    placeholder="What feels present right now?"
                    className="w-full px-3 py-2 text-sm bg-[#F8FAF9] border border-[#DCE4E0] rounded-lg text-[#1C2825] placeholder:text-[#869791] focus:outline-none focus:border-[#2D6A5E] focus:bg-white resize-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="idea-input"
                    className="block text-xs font-medium text-[#4E615B] mb-1.5"
                  >
                    Idea or Spark
                  </label>
                  <textarea
                    id="idea-input"
                    rows={2}
                    value={ideaNote}
                    onChange={(e) => setIdeaNote(e.target.value)}
                    placeholder="Any small shift or experiment?"
                    className="w-full px-3 py-2 text-sm bg-[#F8FAF9] border border-[#DCE4E0] rounded-lg text-[#1C2825] placeholder:text-[#869791] focus:outline-none focus:border-[#2D6A5E] focus:bg-white resize-none"
                  />
                </div>
              </div>
            </div>

            {apiNotice && (
              <p className="text-xs text-[#73514B] bg-[#F4EAE8] border border-[#DEC2BD] rounded-lg px-3 py-2">
                {apiNotice}
              </p>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#2D6A5E] hover:bg-[#23554B] disabled:opacity-60 rounded-lg transition-colors"
            >
              {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isGenerating
                  ? 'Creating tailored goal tips...'
                  : 'Save Check-In & Get Goal Tips'}
              </span>
            </button>
          </form>
        </section>

        {/* Right: Active Check-In Guidance + Journal Feed */}
        <section className="lg:col-span-6 space-y-6">
          {/* Active Selected Guidance Card */}
          {activeEntry ? (
            <div className="bg-white border border-[#E1E7E4] rounded-xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-[#EAEFED] pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#647771]">
                    <span className="font-mono tabular-nums text-[#1C2825] font-medium">
                      {activeEntry.dateISO}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className="font-medium"
                      style={{ color: MOOD_META[activeEntry.mood].color }}
                    >
                      {activeEntry.mood}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Energy <span className="font-mono tabular-nums">{activeEntry.energy}/5</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Stress <span className="font-mono tabular-nums">{activeEntry.stress}/5</span>
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-lg font-display font-medium text-[#1C2825]">
                    {activeEntry.goalText || activeEntry.feelingNote || 'Daily Reflection'}
                  </h2>
                  {activeEntry.linkedDimensionId && (
                    <p className="mt-1 text-xs text-[#596C66]">
                      Life Area:{' '}
                      {
                        WHEEL_DIMENSIONS.find((d) => d.id === activeEntry.linkedDimensionId)
                          ?.label
                      }
                      {activeEntry.activities.length > 0 &&
                        ` · ${activeEntry.activities.join(', ')}`}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteCheckIn(activeEntry.id)}
                  className="p-2 text-[#73857F] hover:text-[#94625A] rounded-lg hover:bg-[#F5F7F6] transition-colors shrink-0"
                  aria-label="Delete check-in entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {activeEntry.reflectionNote && (
                <p className="text-sm text-[#394B45] leading-relaxed bg-[#F4F8F6] rounded-lg p-3.5">
                  {activeEntry.reflectionNote}
                </p>
              )}

              {/* Actionable Goal Tips with Checkboxes */}
              <div>
                <h3 className="text-sm font-medium text-[#1C2825] mb-2.5">
                  Actionable Tips for This Goal
                </h3>
                <div className="divide-y divide-[#EAEFED]">
                  {activeEntry.goalTips.map((tip) => (
                    <button
                      key={tip.id}
                      type="button"
                      onClick={() => onToggleTip(activeEntry.id, tip.id)}
                      className="w-full py-2.5 flex items-start gap-3 text-left group"
                    >
                      {tip.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2D6A5E] mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#8EA09A] group-hover:text-[#2D6A5E] mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            tip.completed
                              ? 'line-through text-[#73857F]'
                              : 'text-[#1C2825]'
                          }`}
                        >
                          {tip.title}
                        </p>
                        <p className="text-xs text-[#596C66] mt-0.5 leading-relaxed">
                          {tip.detail}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tailored Mindfulness Recommendation */}
              {activeEntry.mindfulness && (
                <div className="pt-4 border-t border-[#EAEFED]">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-[#1C2825]">
                      Recommended Mindfulness: {activeEntry.mindfulness.title}
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-[#2D6A5E] whitespace-nowrap">
                      {activeEntry.mindfulness.durationMinutes} min ·{' '}
                      {activeEntry.mindfulness.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#596C66] mt-1">
                    {activeEntry.mindfulness.whyItFits}
                  </p>
                  <ol className="mt-2.5 space-y-1.5 text-xs text-[#394B45] list-decimal list-inside">
                    {activeEntry.mindfulness.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Stored Daily Prompt Responses */}
              {activeEntry.promptResponses.length > 0 && (
                <div className="pt-4 border-t border-[#EAEFED]">
                  <h3 className="text-sm font-medium text-[#1C2825] mb-2">
                    Daily Prompt Responses
                  </h3>
                  <div className="space-y-2">
                    {activeEntry.promptResponses.map((pr, idx) => (
                      <div key={idx} className="text-xs">
                        <p className="text-[#647771]">{pr.prompt}</p>
                        <p className="text-[#1C2825] mt-0.5">{pr.response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E1E7E4] rounded-xl p-8 text-center">
              <p className="text-sm font-medium text-[#1C2825]">No check-ins logged yet</p>
              <p className="text-xs text-[#647771] mt-1">
                Complete your first daily check-in on the left to unlock tailored goal steps and mindfulness prompts.
              </p>
            </div>
          )}

          {/* Check-In History List */}
          <div className="bg-white border border-[#E1E7E4] rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAEFED]">
              <div className="flex items-center gap-1 p-1 bg-[#EFF3F1] rounded-lg self-start">
                {(['ALL', CheckInFocus.GOAL, CheckInFocus.FEELING, CheckInFocus.IDEA] as const).map(
                  (f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilterFocus(f)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        filterFocus === f
                          ? 'bg-white text-[#1C2825] shadow-xs'
                          : 'text-[#596C66] hover:text-[#1C2825]'
                      }`}
                    >
                      {f === 'ALL' ? 'All' : f}
                    </button>
                  )
                )}
              </div>

              <div className="relative flex-1 sm:max-w-[210px]">
                <Search className="w-3.5 h-3.5 text-[#7D8F89] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter journal..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAF9] border border-[#DCE4E0] rounded-lg text-[#1C2825] placeholder:text-[#869791] focus:outline-none focus:border-[#2D6A5E]"
                />
              </div>
            </div>

            <div className="divide-y divide-[#EAEFED] max-h-[340px] overflow-y-auto">
              {filteredCheckIns.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#647771]">
                  No check-ins match your current filter.
                </p>
              ) : (
                filteredCheckIns.map((item) => {
                  const selected = activeEntry?.id === item.id;
                  const doneTips = item.goalTips.filter((t) => t.completed).length;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedEntryId(item.id)}
                      className={`w-full py-3 px-2 text-left transition-colors rounded-lg ${
                        selected ? 'bg-[#F0F6F3]' : 'hover:bg-[#F8FAF9]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs text-[#647771]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono tabular-nums text-[#1C2825]">
                            {item.dateISO}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className="font-medium"
                            style={{ color: MOOD_META[item.mood].color }}
                          >
                            {item.mood}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.focusType}</span>
                        </div>
                        <span className="font-mono tabular-nums shrink-0">
                          {doneTips}/{item.goalTips.length} tips
                        </span>
                      </div>
                      <p className="text-sm text-[#1C2825] font-medium mt-1 truncate">
                        {item.goalText || item.feelingNote || item.ideaNote || 'Daily reflection'}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
