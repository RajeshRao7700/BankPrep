import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  PlayCircle, 
  Target, 
  Repeat, 
  Brain, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Save, 
  Plus, 
  AlertTriangle,
  Flame,
  Award
} from 'lucide-react';
import { SUBJECTS } from '../lib/defaultData';
import { 
  getInitialUserTopics, 
  saveUserTopicState, 
  getAllCourses, 
  getAllVideoClasses, 
  toggleVideoClass,
  getPracticeRecords, 
  addPracticeRecord,
  getRevisionRecords, 
  scheduleStandardRevisions, 
  completeRevision,
  getTopicById,
  formatDateDMY
} from '../lib/storage';
import { TopicStatus, UserTopicState } from '../lib/types';
import confetti from 'canvas-confetti';

export const TopicDetailPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();

  const topic = getTopicById(topicId || '');
  const subject = topic ? SUBJECTS.find(s => s.code === topic.subjectCode) : null;

  const [topicState, setTopicState] = useState<UserTopicState | null>(null);
  const [videoClasses, setVideoClasses] = useState(getAllVideoClasses());
  const [practiceRecords, setPracticeRecords] = useState(getPracticeRecords());
  const [revisionRecords, setRevisionRecords] = useState(getRevisionRecords());

  // Understanding form fields
  const [confidence, setConfidence] = useState(1);
  const [personalNotes, setPersonalNotes] = useState('');
  const [weakConcepts, setWeakConcepts] = useState('');
  const [mistakesToAvoid, setMistakesToAvoid] = useState('');
  const [isSavedMessage, setIsSavedMessage] = useState(false);

  // Quick Practice Modal
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [practiceDate, setPracticeDate] = useState(new Date().toISOString().split('T')[0]);
  const [attempted, setAttempted] = useState(30);
  const [correct, setCorrect] = useState(25);
  const [timeSpent, setTimeSpent] = useState(35);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [source, setSource] = useState<'Book' | 'Website' | 'Mock' | 'Other'>('Website');

  // Complete Topic Modal
  const [isConfirmCompleteOpen, setIsConfirmCompleteOpen] = useState(false);

  useEffect(() => {
    if (!topicId) return;
    const allTopics = getInitialUserTopics();
    const current = allTopics[topicId] || {
      topicId,
      status: 'Not Started',
      confidenceLevel: 1,
      targetQuestions: topic?.defaultTargetQuestions || 200,
      timeSpentMinutes: 0,
      updatedAt: new Date().toISOString()
    };
    setTopicState(current);
    setConfidence(current.confidenceLevel || 1);
    setPersonalNotes(current.personalNotes || '');
    setWeakConcepts(current.weakConcepts || '');
    setMistakesToAvoid(current.mistakesToAvoid || '');
    setVideoClasses(getAllVideoClasses());
    setPracticeRecords(getPracticeRecords());
    setRevisionRecords(getRevisionRecords());
  }, [topicId, topic]);

  if (!topic || !subject || !topicState) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-500">Topic not found.</p>
        <Link to="/syllabus" className="text-xs font-bold text-brand-600 hover:underline">
          Return to Syllabus
        </Link>
      </div>
    );
  }

  // Video calculations
  const classes = videoClasses[topic.id] || [];
  const completedVideos = classes.filter(c => c.isCompleted).length;
  const videoPercent = classes.length > 0 ? Math.round((completedVideos / classes.length) * 100) : 0;

  // Practice calculations
  const topicPractices = practiceRecords.filter(p => p.topicId === topic.id);
  const totalAttempted = topicPractices.reduce((acc, p) => acc + p.attemptedQuestions, 0);
  const totalCorrect = topicPractices.reduce((acc, p) => acc + p.correctAnswers, 0);
  const totalIncorrect = topicPractices.reduce((acc, p) => acc + p.incorrectAnswers, 0);
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const targetQuestions = topicState.targetQuestions || 200;
  const remainingQuestions = Math.max(0, targetQuestions - totalAttempted);
  const practicePercent = Math.min(100, Math.round((totalAttempted / targetQuestions) * 100));

  // Revision calculations
  const topicRevisions = revisionRecords.filter(r => r.topicId === topic.id);
  const completedRevisions = topicRevisions.filter(r => r.isCompleted).length;
  const upcomingRevision = topicRevisions.find(r => !r.isCompleted);

  const handleToggleClass = (classNum: number) => {
    toggleVideoClass(topic.id, classNum);
    setVideoClasses(getAllVideoClasses());
    setTopicState(getInitialUserTopics()[topic.id] || null);
  };

  const handleSaveUnderstanding = () => {
    const updated = saveUserTopicState(topic.id, {
      confidenceLevel: confidence,
      personalNotes,
      weakConcepts,
      mistakesToAvoid
    });
    setTopicState(updated);
    setIsSavedMessage(true);
    setTimeout(() => setIsSavedMessage(false), 3000);
  };

  const handleSavePractice = () => {
    const inc = Math.max(0, attempted - correct);
    addPracticeRecord({
      topicId: topic.id,
      practiceDate,
      attemptedQuestions: attempted,
      correctAnswers: correct,
      incorrectAnswers: inc,
      skippedQuestions: 0,
      timeSpentMinutes: timeSpent,
      difficultyLevel: difficulty,
      source
    });
    setPracticeRecords(getPracticeRecords());
    setTopicState(getInitialUserTopics()[topic.id]);
    setIsPracticeModalOpen(false);
  };

  const handleScheduleRevisions = () => {
    scheduleStandardRevisions(topic.id);
    setRevisionRecords(getRevisionRecords());
  };

  const handleMarkTopicCompleted = () => {
    const updated = saveUserTopicState(topic.id, {
      status: 'Completed',
      completedDate: formatDateDMY(new Date().toISOString())
    });
    setTopicState(updated);
    setIsConfirmCompleteOpen(false);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/syllabus"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Syllabus
        </Link>

        {/* Status Dropdown & Complete Action */}
        <div className="flex items-center gap-2">
          <select
            aria-label="Update topic learning status"
            value={topicState.status}
            onChange={(e) => {
              const newStatus = e.target.value as TopicStatus;
              const updated = saveUserTopicState(topic.id, { 
                status: newStatus,
                completedDate: newStatus === 'Completed' ? formatDateDMY(new Date().toISOString()) : undefined
              });
              setTopicState(updated);
            }}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100"
          >
            <option value="Not Started">Not Started</option>
            <option value="Learning">Learning</option>
            <option value="Practicing">Practicing</option>
            <option value="Revision Required">Revision Required</option>
            <option value="Completed">Completed</option>
          </select>

          {topicState.status !== 'Completed' && (
            <button
              onClick={() => setIsConfirmCompleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              <Award className="w-4 h-4" />
              Mark Topic Completed
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${subject.bgLight} ${subject.bgDark}`}>
                {subject.name}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                topicState.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {topicState.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {topic.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Time Spent: <strong className="text-slate-800 dark:text-slate-200">{topicState.timeSpentMinutes || 0} mins</strong>
              </span>
              {topicState.completedDate && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Topic Completed on {formatDateDMY(topicState.completedDate)}
                </span>
              )}
            </div>
          </div>

          {/* Confidence Stars Badge */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1a233a] border border-slate-200/60 dark:border-slate-800 text-center">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Topic Mastery Level
            </p>
            <div className="flex items-center justify-center gap-1 mt-1 text-amber-400 text-xl">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setConfidence(star)}
                  className={`transition-transform hover:scale-125 ${star <= confidence ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Confidence {confidence} of 5
            </p>
          </div>
        </div>
      </div>

      {/* Four Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pillar A: Video Lectures */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-brand-600" />
                A. Video Lectures Tracker
              </h3>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                {completedVideos}/{classes.length} ({videoPercent}%)
              </span>
            </div>

            <div className="mt-3">
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${videoPercent}%` }} />
              </div>
            </div>

            {/* Class Checkbox List */}
            <div className="mt-4 max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-50 dark:divide-slate-800/40">
              {classes.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  <p>No video classes setup for this topic.</p>
                  <Link to="/bulk-setup" className="font-semibold text-brand-600 mt-1 inline-block">
                    Add classes in Bulk Course Setup →
                  </Link>
                </div>
              ) : (
                classes.map(item => (
                  <div key={item.id} className="pt-1.5 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleClass(item.classNumber)}
                      className="flex items-center gap-2 text-left hover:text-brand-600 focus:outline-none"
                    >
                      {item.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                      )}
                      <span className={item.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                        {item.title || `Class ${item.classNumber}`}
                      </span>
                    </button>
                    {item.completedAt && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-300/60 dark:border-emerald-800">
                        ✓ Completed on {formatDateDMY(item.completedAt)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              {classes.length - completedVideos} classes remaining
            </span>
            <Link to="/videos" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Open Video Hub →
            </Link>
          </div>
        </div>

        {/* Pillar B: Practice Tracker */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                B. Practice & Accuracy
              </h3>
              <button
                onClick={() => setIsPracticeModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Practice
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Attempted</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalAttempted}</p>
                <p className="text-[10px] text-slate-500">Target: {targetQuestions}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold">Correct</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{totalCorrect}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">{accuracy}% Accuracy</p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30">
                <p className="text-[10px] text-rose-700 dark:text-rose-400 uppercase font-semibold">Incorrect</p>
                <p className="text-lg font-bold text-rose-700 dark:text-rose-300 mt-0.5">{totalIncorrect}</p>
                <p className="text-[10px] text-rose-600 font-semibold">{totalAttempted - totalCorrect} errors</p>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Target Completion</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{practicePercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${practicePercent}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {remainingQuestions > 0 ? `${remainingQuestions} questions remaining to reach goal.` : 'Target reached! Excellent discipline.'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">{topicPractices.length} logged sessions</span>
            <Link to="/practice" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Practice Hub →
            </Link>
          </div>
        </div>

        {/* Pillar C: Revision Center */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Repeat className="w-4 h-4 text-emerald-600" />
                C. Spaced Repetition (5 Intervals)
              </h3>
              {topicRevisions.length === 0 ? (
                <button
                  onClick={handleScheduleRevisions}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs"
                >
                  Schedule Revisions
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-600">
                  {completedRevisions}/5 Completed
                </span>
              )}
            </div>

            {/* Intervals List */}
            <div className="mt-3 space-y-2">
              {topicRevisions.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 space-y-2">
                  <p>No revision schedule active for this topic.</p>
                  <button
                    onClick={handleScheduleRevisions}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-semibold text-xs"
                  >
                    Schedule 1-3-7-15-30 Day Revisions
                  </button>
                </div>
              ) : (
                topicRevisions.map((rev) => (
                  <div key={rev.id} className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">Rev #{rev.revisionNumber}</span>
                      <span className="text-[10px] text-slate-400">Scheduled: {rev.scheduledDate}</span>
                    </div>

                    {rev.isCompleted ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        Done ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => completeRevision(rev.id, { durationMinutes: 25, questionsSolved: 15, confidenceLevel: 4 })}
                        className="text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full hover:bg-brand-100"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              {upcomingRevision ? `Next: Rev #${upcomingRevision.revisionNumber} on ${upcomingRevision.scheduledDate}` : 'All revisions completed!'}
            </span>
            <Link to="/revisions" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Revision Center →
            </Link>
          </div>
        </div>

        {/* Pillar D: Understanding & Weak Concepts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-500" />
                D. Concepts, Traps & Mistakes
              </h3>
              {isSavedMessage && (
                <span className="text-xs font-semibold text-emerald-600 animate-in fade-in">
                  Saved successfully!
                </span>
              )}
            </div>

            <div className="mt-3 space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                  Weak Concepts to Focus On:
                </label>
                <input
                  type="text"
                  value={weakConcepts}
                  onChange={e => setWeakConcepts(e.target.value)}
                  placeholder="e.g. Successive percentage in compound interest questions"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-0.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Common Exam Mistakes to Avoid:
                </label>
                <input
                  type="text"
                  value={mistakesToAvoid}
                  onChange={e => setMistakesToAvoid(e.target.value)}
                  placeholder="e.g. Forgetting to convert % to fraction, misreading 'increased to' vs 'increased by'"
                  className="w-full px-3 py-1.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                  Personal Formula Notes:
                </label>
                <textarea
                  rows={2}
                  value={personalNotes}
                  onChange={e => setPersonalNotes(e.target.value)}
                  placeholder="Short tricks, conversion table shortcuts..."
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleSaveUnderstanding}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              Save Concept Notes
            </button>
          </div>
        </div>
      </div>

      {/* Log Practice Modal */}
      {isPracticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              Log Practice Session: {topic.name}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Questions Attempted
                </label>
                <input
                  type="number"
                  min="1"
                  value={attempted}
                  onChange={e => setAttempted(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Correct Answers
                </label>
                <input
                  type="number"
                  min="0"
                  max={attempted}
                  value={correct}
                  onChange={e => setCorrect(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 font-bold text-sm text-emerald-800 dark:text-emerald-200 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Time Spent (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={timeSpent}
                  onChange={e => setTimeSpent(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced (Mains)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Source of Practice
              </label>
              <select
                value={source}
                onChange={e => setSource(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="Book">Standard Book / PDF</option>
                <option value="Website">Website / Quiz App</option>
                <option value="Mock">Sectional Mock Test</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsPracticeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePractice}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Save Practice Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Topic Completed Modal */}
      {isConfirmCompleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Mark "{topic.name}" Completed?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will mark this syllabus topic as fully completed and register today as your topic completion milestone date.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsConfirmCompleteOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkTopicCompleted}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Yes, Mark Completed!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

