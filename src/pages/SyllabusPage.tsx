import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Flame,
  PlayCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';
import { SUBJECTS } from '../lib/defaultData';
import {
  getInitialUserTopics,
  saveUserTopicState,
  getAllCourses,
  getAllVideoClasses,
  getPracticeRecords,
  getRevisionRecords,
  getAllSyllabusTopics,
  formatDateDMY
} from '../lib/storage';
import { SubjectCode, TopicStatus, UserTopicState } from '../lib/types';

export const SyllabusPage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectCode | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [topicsState, setTopicsState] = useState<Record<string, UserTopicState>>({});
  const [courses, setCourses] = useState(getAllCourses());
  const [videoClasses, setVideoClasses] = useState(getAllVideoClasses());
  const [practiceRecords, setPracticeRecords] = useState(getPracticeRecords());
  const [revisionRecords, setRevisionRecords] = useState(getRevisionRecords());

  useEffect(() => {
    setTopicsState(getInitialUserTopics());
    setCourses(getAllCourses());
    setVideoClasses(getAllVideoClasses());
    setPracticeRecords(getPracticeRecords());
    setRevisionRecords(getRevisionRecords());
  }, []);

  const handleStatusChange = (topicId: string, newStatus: TopicStatus) => {
    const updated = saveUserTopicState(topicId, {
      status: newStatus,
      completedDate: newStatus === 'Completed' ? formatDateDMY(new Date().toISOString()) : undefined
    });
    setTopicsState(prev => ({ ...prev, [topicId]: updated }));
  };

  const allTopics = getAllSyllabusTopics();

  // Filtered Topics
  const filteredTopics = allTopics.filter(t => {
    if (selectedSubject !== 'all' && t.subjectCode !== selectedSubject) return false;
    const state = topicsState[t.id];
    const status = state?.status || 'Not Started';
    if (selectedStatus !== 'all' && status !== selectedStatus) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calculate subject counts
  const totalCount = allTopics.length;
  const completedCount = Object.values(topicsState).filter(s => s.status === 'Completed').length;
  const learningCount = Object.values(topicsState).filter(s => s.status === 'Learning' || s.status === 'Practicing').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-600" />
            Banking Syllabus Master Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete predefined syllabus for SBI PO, IBPS PO & Clerk with individual video & practice metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/bulk-setup"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Custom Topic
          </Link>
          <Link
            to="/bulk-setup"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-brand-500/20 hover:opacity-95 transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            Bulk Course Setup
          </Link>
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Topics</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalCount}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 shadow-sm">
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Completed</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{completedCount}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 shadow-sm">
          <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">In Progress</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">{learningCount}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 shadow-sm">
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Overall Progress</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">
            {Math.round((completedCount / totalCount) * 100)}%
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        {/* Subject Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedSubject === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
              }`}
          >
            All Subjects ({totalCount})
          </button>
          {SUBJECTS.map(sub => {
            const count = allTopics.filter(t => t.subjectCode === sub.code).length;
            const isSelected = selectedSubject === sub.code;
            return (
              <button
                key={sub.code}
                onClick={() => setSelectedSubject(sub.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${isSelected
                  ? `${sub.bgLight} ${sub.bgDark} font-bold shadow-sm`
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                  }`}
              >
                <span>{sub.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Status Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search topic name (e.g. Percentage, Puzzles, Reading Comprehension)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              aria-label="Filter topics by status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Learning">Learning</option>
              <option value="Practicing">Practicing</option>
              <option value="Revision Required">Revision Required</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => {
          const state = topicsState[topic.id] || {
            topicId: topic.id,
            status: 'Not Started',
            confidenceLevel: 1,
            targetQuestions: topic.defaultTargetQuestions,
            timeSpentMinutes: 0
          };
          const subject = SUBJECTS.find(s => s.code === topic.subjectCode)!;

          // Video class stats
          const topicClasses = videoClasses[topic.id] || [];
          const totalVideoCount = courses[topic.id]?.totalClasses || topicClasses.length || 0;
          const completedVideoCount = topicClasses.filter(c => c.isCompleted).length;
          const videoPercent = totalVideoCount > 0 ? Math.round((completedVideoCount / totalVideoCount) * 100) : 0;

          // Practice stats
          const topicPractices = practiceRecords.filter(p => p.topicId === topic.id);
          const attemptedQuestions = topicPractices.reduce((acc, p) => acc + p.attemptedQuestions, 0);
          const practicePercent = Math.min(100, Math.round((attemptedQuestions / (state.targetQuestions || 200)) * 100));

          // Revisions count
          const topicRevisions = revisionRecords.filter(r => r.topicId === topic.id && r.isCompleted).length;

          return (
            <div
              key={topic.id}
              className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Subject pill & Status Dropdown */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${subject.bgLight} ${subject.bgDark}`}>
                      {subject.name}
                    </span>
                    {topic.isCustom && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Manual Status Selector */}
                  <select
                    aria-label={`Update status for ${topic.name}`}
                    value={state.status}
                    onChange={(e) => handleStatusChange(topic.id, e.target.value as TopicStatus)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer ${state.status === 'Completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : state.status === 'Learning'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                        : state.status === 'Practicing'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                          : state.status === 'Revision Required'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Learning">Learning</option>
                    <option value="Practicing">Practicing</option>
                    <option value="Revision Required">Revision Required</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Topic Name */}
                <Link to={`/syllabus/${topic.id}`} className="block group">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                    {topic.name}
                  </h3>
                </Link>

                {/* Topic Completed on Date Badge */}
                {state.status === 'Completed' && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Completed on {formatDateDMY(state.completedDate) || formatDateDMY(new Date().toISOString())}</span>
                  </div>
                )}

                {/* Progress Mini Bars */}
                <div className="mt-3.5 space-y-2.5">
                  {/* Video Progress */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="flex items-center gap-1 font-medium">
                        <PlayCircle className="w-3 h-3 text-brand-500" />
                        Videos
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {completedVideoCount}/{totalVideoCount} ({videoPercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-300"
                        style={{ width: `${videoPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Practice Questions */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Flame className="w-3 h-3 text-amber-500" />
                        Practice
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {attemptedQuestions}/{state.targetQuestions || 200} ({practicePercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${practicePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Revisions & Confidence Info */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Revisions: <strong className="text-slate-700 dark:text-slate-200">{topicRevisions}</strong></span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`text-xs ${star <= (state.confidenceLevel || 1) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="mt-3.5 pt-2 flex items-center justify-between">
                <Link
                  to={`/syllabus/${topic.id}`}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1"
                >
                  Topic Deep Dive
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to="/videos"
                  className="p-1 rounded-md text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Open video tracker"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

