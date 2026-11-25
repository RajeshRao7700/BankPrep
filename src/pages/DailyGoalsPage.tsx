import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Clock, 
  Video, 
  Target, 
  Repeat, 
  BookOpen, 
  Award,
  Save
} from 'lucide-react';
import { getTodayGoal, updateTodayGoal, getUserProfile } from '../lib/storage';
import { DailyGoal } from '../lib/types';
import confetti from 'canvas-confetti';

export const DailyGoalsPage: React.FC = () => {
  const [goal, setGoal] = useState<DailyGoal>(getTodayGoal());
  const [profile, setProfile] = useState(getUserProfile());
  const [isEditingTargets, setIsEditingTargets] = useState(false);

  // Editable Targets
  const [targetHours, setTargetHours] = useState(goal.targetHours || 6);
  const [targetVideos, setTargetVideos] = useState(goal.targetVideos || 3);
  const [targetQuestions, setTargetQuestions] = useState(goal.targetQuestions || 50);
  const [targetRevisions, setTargetRevisions] = useState(goal.targetRevisions || 2);
  const [targetVocab, setTargetVocab] = useState(goal.targetVocab || 10);

  useEffect(() => {
    const current = getTodayGoal();
    setGoal(current);
    setProfile(getUserProfile());
    setTargetHours(current.targetHours || 6);
    setTargetVideos(current.targetVideos || 3);
    setTargetQuestions(current.targetQuestions || 50);
    setTargetRevisions(current.targetRevisions || 2);
    setTargetVocab(current.targetVocab || 10);
  }, []);

  const handleSaveTargets = () => {
    const updated = updateTodayGoal({
      targetHours,
      targetVideos,
      targetQuestions,
      targetRevisions,
      targetVocab
    });
    setGoal(updated);
    setIsEditingTargets(false);
  };

  const handleIncrement = (field: keyof DailyGoal, amount: number) => {
    const currentVal = (goal[field] as number) || 0;
    const updated = updateTodayGoal({
      [field]: Math.max(0, Number((currentVal + amount).toFixed(1)))
    });
    setGoal(updated);

    // Trigger celebration if reached goal
    if (updated.completedHours >= updated.targetHours && updated.completedQuestions >= updated.targetQuestions) {
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  // Completion percentages
  const pctHours = Math.min(100, Math.round(((goal.completedHours || 0) / Math.max(1, goal.targetHours)) * 100));
  const pctVideos = Math.min(100, Math.round(((goal.completedVideos || 0) / Math.max(1, goal.targetVideos)) * 100));
  const pctQuestions = Math.min(100, Math.round(((goal.completedQuestions || 0) / Math.max(1, goal.targetQuestions)) * 100));
  const pctRevisions = Math.min(100, Math.round(((goal.completedRevisions || 0) / Math.max(1, goal.targetRevisions)) * 100));
  const pctVocab = Math.min(100, Math.round(((goal.completedVocab || 0) / Math.max(1, goal.targetVocab)) * 100));

  const totalWeighted = (pctHours + pctVideos + pctQuestions + pctRevisions + pctVocab) / 5;
  const overallDayPercent = Math.round(totalWeighted);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500 fill-rose-500" />
            Daily Study Goals & Consistency Streak
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build unshakeable banking exam discipline with daily targets for study hours, lectures, questions and vocabulary.
          </p>
        </div>

        <button
          onClick={() => setIsEditingTargets(!isEditingTargets)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
        >
          {isEditingTargets ? 'Cancel Target Edit' : 'Edit Daily Targets'}
        </button>
      </div>

      {/* Target Edit Drawer */}
      {isEditingTargets && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Customise Today's Study Targets
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Study Hours</label>
              <input
                type="number"
                min="1"
                max="18"
                value={targetHours}
                onChange={e => setTargetHours(parseFloat(e.target.value) || 6)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Video Classes</label>
              <input
                type="number"
                min="0"
                value={targetVideos}
                onChange={e => setTargetVideos(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Practice Qs</label>
              <input
                type="number"
                min="10"
                value={targetQuestions}
                onChange={e => setTargetQuestions(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Revisions</label>
              <input
                type="number"
                min="0"
                value={targetRevisions}
                onChange={e => setTargetRevisions(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Vocab Words</label>
              <input
                type="number"
                min="0"
                value={targetVocab}
                onChange={e => setTargetVocab(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-center font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveTargets}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20"
            >
              Update Targets
            </button>
          </div>
        </div>
      )}

      {/* Main Goal Achievement Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
              Active Streak: 3 Days
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
              Longest Streak: 12 Days
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Today's Target Completion: {overallDayPercent}%
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {overallDayPercent >= 100 
              ? 'Outstanding performance! You have exceeded all of today’s targets.' 
              : 'Keep pushing! Steady daily completion is the secret to clearing banking examinations in 120 days.'}
          </p>
        </div>

        <div className="text-center sm:text-right shrink-0">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-indigo-500/40 bg-white/5 font-black text-2xl text-white">
            {overallDayPercent}%
          </div>
        </div>
      </div>

      {/* Interactive Goal Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Study Hours */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Study Hours</h4>
                <p className="text-[10px] text-slate-400">Target: {goal.targetHours} hours</p>
              </div>
            </div>
            <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
              {goal.completedHours}h
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pctHours}%` }} />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-400 text-[11px]">{pctHours}% accomplished</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleIncrement('completedHours', 0.5)}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                +0.5h
              </button>
              <button
                onClick={() => handleIncrement('completedHours', 1.0)}
                className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950 text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100"
              >
                +1h
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Video Classes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Video Classes</h4>
                <p className="text-[10px] text-slate-400">Target: {goal.targetVideos} classes</p>
              </div>
            </div>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
              {goal.completedVideos} / {goal.targetVideos}
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pctVideos}%` }} />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-400 text-[11px]">{pctVideos}% accomplished</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleIncrement('completedVideos', 1)}
                className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
              >
                +1 Class
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Practice Questions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Practice Questions</h4>
                <p className="text-[10px] text-slate-400">Target: {goal.targetQuestions} questions</p>
              </div>
            </div>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
              {goal.completedQuestions} / {goal.targetQuestions}
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pctQuestions}%` }} />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-400 text-[11px]">{pctQuestions}% accomplished</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleIncrement('completedQuestions', 10)}
                className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100"
              >
                +10 Qs
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Revisions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Revisions</h4>
                <p className="text-[10px] text-slate-400">Target: {goal.targetRevisions} topics</p>
              </div>
            </div>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {goal.completedRevisions} / {goal.targetRevisions}
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pctRevisions}%` }} />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-400 text-[11px]">{pctRevisions}% accomplished</span>
            <button
              onClick={() => handleIncrement('completedRevisions', 1)}
              className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
            >
              +1 Rev
            </button>
          </div>
        </div>

        {/* Card 5: Vocabulary Words */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Vocabulary Words</h4>
                <p className="text-[10px] text-slate-400">Target: {goal.targetVocab} words</p>
              </div>
            </div>
            <span className="text-base font-extrabold text-purple-600 dark:text-purple-400">
              {goal.completedVocab} / {goal.targetVocab}
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pctVocab}%` }} />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-400 text-[11px]">{pctVocab}% accomplished</span>
            <button
              onClick={() => handleIncrement('completedVocab', 5)}
              className="px-2.5 py-1 rounded bg-purple-50 dark:bg-purple-950 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100"
            >
              +5 Words
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

