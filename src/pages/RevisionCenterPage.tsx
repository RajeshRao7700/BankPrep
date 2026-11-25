import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { PREDEFINED_SYLLABUS, SUBJECTS } from '../lib/defaultData';
import { 
  getRevisionRecords, 
  scheduleStandardRevisions, 
  completeRevision 
} from '../lib/storage';
import { RevisionRecord } from '../lib/types';
import confetti from 'canvas-confetti';

export const RevisionCenterPage: React.FC = () => {
  const [revisions, setRevisions] = useState<RevisionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  
  // Schedule New Revisions Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(PREDEFINED_SYLLABUS[0].id);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Complete Revision Modal
  const [completingRev, setCompletingRev] = useState<RevisionRecord | null>(null);
  const [revDuration, setRevDuration] = useState(30);
  const [revQuestions, setRevQuestions] = useState(20);
  const [revConfidence, setRevConfidence] = useState(4);
  const [revNotes, setRevNotes] = useState('');

  useEffect(() => {
    setRevisions(getRevisionRecords());
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Group revisions
  const todayRevisions = revisions.filter(r => !r.isCompleted && r.scheduledDate === todayStr);
  const overdueRevisions = revisions.filter(r => !r.isCompleted && r.scheduledDate < todayStr);
  const upcomingRevisions = revisions.filter(r => !r.isCompleted && r.scheduledDate > todayStr);
  const completedRevisions = revisions.filter(r => r.isCompleted);

  const handleSchedule = () => {
    scheduleStandardRevisions(selectedTopicId, startDate);
    setRevisions(getRevisionRecords());
    setIsScheduleModalOpen(false);
  };

  const handleFinishRevision = () => {
    if (!completingRev) return;
    completeRevision(completingRev.id, {
      durationMinutes: revDuration,
      questionsSolved: revQuestions,
      confidenceLevel: revConfidence,
      notes: revNotes
    });
    setRevisions(getRevisionRecords());
    setCompletingRev(null);
    setRevNotes('');
    confetti({ particleCount: 70, spread: 60 });
  };

  const getDisplayedList = () => {
    switch (activeTab) {
      case 'today': return todayRevisions;
      case 'overdue': return overdueRevisions;
      case 'upcoming': return upcomingRevisions;
      case 'completed': return completedRevisions;
    }
  };

  const displayedList = getDisplayedList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Repeat className="w-6 h-6 text-emerald-600" />
            Spaced Repetition Revision Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prevent memory decay with scientific 1, 3, 7, 15 and 30-day spaced revision cycles.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule 5-Step Revision
        </button>
      </div>

      {/* Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('today')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'today'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-md'
              : 'bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Today's Tasks</p>
          <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">{todayRevisions.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">scheduled for today</p>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'overdue'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 shadow-md'
              : 'bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase">Overdue</p>
          <p className="text-2xl font-black text-rose-800 dark:text-rose-300 mt-1">{overdueRevisions.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">needs urgent recall</p>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'upcoming'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-md'
              : 'bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase">Upcoming</p>
          <p className="text-2xl font-black text-blue-800 dark:text-blue-300 mt-1">{upcomingRevisions.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">scheduled in future days</p>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'completed'
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-700 shadow-md'
              : 'bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 uppercase">Mastered</p>
          <p className="text-2xl font-black text-purple-800 dark:text-purple-300 mt-1">{completedRevisions.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">revisions completed</p>
        </button>
      </div>

      {/* Revision List */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
            {activeTab} Revisions ({displayedList.length})
          </h2>
          <span className="text-xs text-slate-400">
            Current Date: {todayStr}
          </span>
        </div>

        {displayedList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No {activeTab} revisions found!
            </p>
            <p>
              {activeTab === 'today' 
                ? 'Great job! You have cleared all of today’s scheduled revisions.' 
                : 'Click "Schedule 5-Step Revision" above to start revision cycles for any topic.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {displayedList.map((rev) => {
              const topic = PREDEFINED_SYLLABUS.find(t => t.id === rev.topicId);
              const subject = topic ? SUBJECTS.find(s => s.code === topic.subjectCode) : null;

              return (
                <div key={rev.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      R{rev.revisionNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {topic?.name || 'Topic'}
                        </span>
                        {subject && (
                          <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full ${subject.bgLight} ${subject.bgDark}`}>
                            {subject.name}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Target: {rev.scheduledDate}
                        </span>
                        {rev.isCompleted && (
                          <span className="text-emerald-600 font-medium">
                            Completed: {rev.completedDate} ({rev.durationMinutes}m, {rev.questionsSolved} questions)
                          </span>
                        )}
                        {rev.notes && <span className="italic text-slate-400">"{rev.notes}"</span>}
                      </div>
                    </div>
                  </div>

                  {/* Complete Action Button */}
                  <div className="sm:text-right shrink-0">
                    {rev.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => setCompletingRev(rev)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete Revision
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Revisions Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Schedule 5-Interval Revision Cycle
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generates 5 spaced review tasks on Days 1, 3, 7, 15 and 30 following your initial learning date.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Topic:
              </label>
              <select
                value={selectedTopicId}
                onChange={e => setSelectedTopicId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                {PREDEFINED_SYLLABUS.map(t => (
                  <option key={t.id} value={t.id}>
                    [{t.subjectCode.toUpperCase()}] {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Base Learning Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                Schedule All 5 Revisions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Revision Modal */}
      {completingRev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Complete Revision #{completingRev.revisionNumber}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Revision Duration (Mins)
                </label>
                <input
                  type="number"
                  min="5"
                  value={revDuration}
                  onChange={e => setRevDuration(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Questions Solved
                </label>
                <input
                  type="number"
                  min="0"
                  value={revQuestions}
                  onChange={e => setRevQuestions(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Post-Revision Confidence (1 to 5)
              </label>
              <div className="flex items-center gap-2 text-xl text-amber-400">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRevConfidence(star)}
                    className={star <= revConfidence ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Revision Notes & Reflections
              </label>
              <textarea
                rows={2}
                value={revNotes}
                onChange={e => setRevNotes(e.target.value)}
                placeholder="Key formulas reviewed, retention status..."
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setCompletingRev(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleFinishRevision}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                Log Revision Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

