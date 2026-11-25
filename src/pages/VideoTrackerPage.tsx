import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Video, 
  Search, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Settings2,
  Calendar,
  Filter,
  ArrowUpDown,
  FileEdit
} from 'lucide-react';
import { SUBJECTS } from '../lib/defaultData';
import { 
  getAllCourses, 
  getAllVideoClasses, 
  toggleVideoClass, 
  updateVideoClassMeta,
  getAllSyllabusTopics,
  getInitialUserTopics,
  formatDateDMY
} from '../lib/storage';
import { SubjectCode, VideoClassItem, UserTopicState } from '../lib/types';

export const VideoTrackerPage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectCode | 'all'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'progress-asc' | 'progress-desc' | 'name'>('default');
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [videoClasses, setVideoClasses] = useState<Record<string, VideoClassItem[]>>({});
  const [topicsState, setTopicsState] = useState<Record<string, UserTopicState>>({});
  const [courses, setCourses] = useState(getAllCourses());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit class modal state
  const [editingClass, setEditingClass] = useState<{ 
    topicId: string; 
    classNumber: number; 
    title: string; 
    notes: string; 
    url: string;
    completedAt?: string;
    isCompleted?: boolean;
  } | null>(null);

  const allTopics = getAllSyllabusTopics();

  useEffect(() => {
    setVideoClasses(getAllVideoClasses());
    setCourses(getAllCourses());
    setTopicsState(getInitialUserTopics());

    // Initially expand first 2 topics
    const initialExpanded: Record<string, boolean> = {};
    allTopics.slice(0, 3).forEach(t => initialExpanded[t.id] = true);
    setExpandedTopics(initialExpanded);
  }, []);

  const handleToggle = (topicId: string, classNum: number) => {
    const res = toggleVideoClass(topicId, classNum);
    setVideoClasses(getAllVideoClasses());
    setTopicsState(getInitialUserTopics());

    if (res) {
      const dateStr = formatDateDMY(res.completedAt);
      const msg = res.isCompleted 
        ? `Marked Class ${classNum} as completed on ${dateStr}!` 
        : `Marked Class ${classNum} as pending.`;
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSaveClassEdit = () => {
    if (!editingClass) return;
    updateVideoClassMeta(editingClass.topicId, editingClass.classNumber, {
      title: editingClass.title,
      notes: editingClass.notes,
      externalVideoUrl: editingClass.url,
      completedAt: editingClass.completedAt,
      isCompleted: editingClass.isCompleted
    });
    setVideoClasses(getAllVideoClasses());
    setTopicsState(getInitialUserTopics());
    setEditingClass(null);
    setToastMessage(`Saved details for Class ${editingClass.classNumber}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleExpand = (topicId: string) => {
    setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  // Expand all or collapse all
  const handleExpandAll = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    allTopics.forEach(t => updated[t.id] = expand);
    setExpandedTopics(updated);
  };

  // Filter topics
  let filteredTopics = allTopics.filter(t => {
    if (selectedSubject !== 'all' && t.subjectCode !== selectedSubject) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Sort topics
  if (sortBy === 'progress-desc') {
    filteredTopics.sort((a, b) => {
      const classesA = videoClasses[a.id] || [];
      const pctA = classesA.length > 0 ? classesA.filter(c => c.isCompleted).length / classesA.length : 0;
      const classesB = videoClasses[b.id] || [];
      const pctB = classesB.length > 0 ? classesB.filter(c => c.isCompleted).length / classesB.length : 0;
      return pctB - pctA;
    });
  } else if (sortBy === 'progress-asc') {
    filteredTopics.sort((a, b) => {
      const classesA = videoClasses[a.id] || [];
      const pctA = classesA.length > 0 ? classesA.filter(c => c.isCompleted).length / classesA.length : 0;
      const classesB = videoClasses[b.id] || [];
      const pctB = classesB.length > 0 ? classesB.filter(c => c.isCompleted).length / classesB.length : 0;
      return pctA - pctB;
    });
  } else if (sortBy === 'name') {
    filteredTopics.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Global Video Metrics
  let totalAllClasses = 0;
  let completedAllClasses = 0;
  Object.values(videoClasses).forEach(list => {
    totalAllClasses += list.length;
    completedAllClasses += list.filter(c => c.isCompleted).length;
  });
  const overallPercent = totalAllClasses > 0 ? Math.round((completedAllClasses / totalAllClasses) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-brand-600" />
            Video Lectures & Class Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track completion of every numbered video lecture class independently. Watch progress sync dynamically.
          </p>
        </div>

        <Link
          to="/bulk-setup"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors"
        >
          <Settings2 className="w-4 h-4 text-brand-500" />
          Configure Lecture Counts
        </Link>
      </div>

      {/* Overall Video Metric Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 text-white shadow-lg shadow-brand-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-brand-100 uppercase tracking-wider">Overall Video Completion</p>
            <h2 className="text-3xl font-extrabold mt-1">
              {completedAllClasses} <span className="text-lg font-normal text-brand-200">/ {totalAllClasses} classes watched</span>
            </h2>
            <p className="text-xs text-brand-100 mt-1">
              {totalAllClasses - completedAllClasses} pending lectures across all banking subjects.
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-4xl font-black">{overallPercent}%</span>
            <div className="w-48 sm:w-56 bg-white/20 h-2.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500" 
                style={{ width: `${overallPercent}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        {/* Subject Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSubject === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Subjects
          </button>
          {SUBJECTS.map(sub => {
            const isSelected = selectedSubject === sub.code;
            return (
              <button
                key={sub.code}
                onClick={() => setSelectedSubject(sub.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? `${sub.bgLight} ${sub.bgDark} font-bold shadow-sm`
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search topic or video class..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Status View Filter */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter video classes by completion status"
              value={filterMode}
              onChange={e => setFilterMode(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">Show All Classes</option>
              <option value="completed">Completed Only</option>
              <option value="pending">Pending Only</option>
            </select>

            {/* Sort Dropdown */}
            <select
              aria-label="Sort topics by progress or name"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="default">Default Order</option>
              <option value="progress-desc">Highest Progress First</option>
              <option value="progress-asc">Lowest Progress First</option>
              <option value="name">Alphabetical</option>
            </select>

            <button
              onClick={() => handleExpandAll(true)}
              className="px-2.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Expand All
            </button>
            <button
              onClick={() => handleExpandAll(false)}
              className="px-2.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* Topics Accordion List */}
      <div className="space-y-3">
        {filteredTopics.map((topic) => {
          const subject = SUBJECTS.find(s => s.code === topic.subjectCode)!;
          const topicClasses = videoClasses[topic.id] || [];
          const totalCount = topicClasses.length;
          const completedCount = topicClasses.filter(c => c.isCompleted).length;
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const isExpanded = Boolean(expandedTopics[topic.id]);

          // Filter visible classes inside topic
          const visibleClasses = topicClasses.filter(c => {
            if (filterMode === 'completed') return c.isCompleted;
            if (filterMode === 'pending') return !c.isCompleted;
            return true;
          });

          return (
            <div
              key={topic.id}
              className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {/* Accordion Header */}
              <div 
                onClick={() => toggleExpand(topic.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-10 rounded-full shrink-0 ${
                    percent === 100 ? 'bg-emerald-500' : percent > 0 ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${subject.bgLight} ${subject.bgDark}`}>
                        {subject.name}
                      </span>
                      {courses[topic.id]?.courseName && (
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-xs">
                          {courses[topic.id]?.courseName}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {topic.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  {/* Topic Fully Completed Badge with Date */}
                  {percent === 100 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] sm:text-xs font-bold shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        Topic Completed on {formatDateDMY(topicsState[topic.id]?.completedDate || visibleClasses[visibleClasses.length - 1]?.completedAt)}
                      </span>
                    </div>
                  )}

                  {/* Progress Pill */}
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {completedCount} / {totalCount} classes
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 sm:w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            percent === 100 ? 'bg-emerald-500' : 'bg-brand-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 w-8 text-right">
                        {percent}%
                      </span>
                    </div>
                  </div>

                  <div className="p-1 rounded-lg text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Accordion Body: Classes Grid */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20">
                  {totalCount === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                      <p>No video classes generated for this topic yet.</p>
                      <Link
                        to="/bulk-setup"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-semibold"
                      >
                        Set class count in Bulk Course Setup
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-3">
                      {visibleClasses.map((item) => (
                        <div
                          key={item.id}
                          className={`
                            p-3 rounded-xl border transition-all flex items-start gap-3
                            ${item.isCompleted 
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40' 
                              : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800'}
                          `}
                        >
                          {/* Complete Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggle(topic.id, item.classNumber)}
                            className="mt-0.5 shrink-0 focus:outline-none"
                            aria-label={`Toggle Class ${item.classNumber}`}
                          >
                            {item.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-slate-400" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-xs font-bold ${
                                item.isCompleted ? 'text-emerald-900 dark:text-emerald-200 line-through opacity-80' : 'text-slate-900 dark:text-white'
                              }`}>
                                {item.title || `Class ${item.classNumber}`}
                              </span>

                              <button
                                onClick={() => setEditingClass({
                                  topicId: topic.id,
                                  classNumber: item.classNumber,
                                  title: item.title,
                                  notes: item.notes || '',
                                  url: item.externalVideoUrl || '',
                                  completedAt: item.completedAt,
                                  isCompleted: item.isCompleted
                                })}
                                className="text-slate-400 hover:text-brand-600 p-0.5"
                                title="Edit class date, notes or link"
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {item.isCompleted ? (
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-300/80 dark:border-emerald-800">
                                  <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  Completed on {formatDateDMY(item.completedAt)}
                                </span>
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 mt-1">Pending</p>
                            )}

                            {item.notes && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
                                "{item.notes}"
                              </p>
                            )}

                            {item.externalVideoUrl && (
                              <a
                                href={item.externalVideoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 dark:text-brand-400 mt-1 hover:underline"
                              >
                                Watch Lecture <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs pt-2">
                    <Link
                      to={`/syllabus/${topic.id}`}
                      className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      View Full Topic Analytics →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Edit Class {editingClass.classNumber} Details
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                value={editingClass.title}
                onChange={e => setEditingClass({ ...editingClass, title: e.target.value })}
                placeholder={`Class ${editingClass.classNumber}`}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Completed Date (DD-MM-YYYY)
                </label>
                {editingClass.completedAt && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {formatDateDMY(editingClass.completedAt)}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={editingClass.completedAt ? editingClass.completedAt.split('T')[0] : ''}
                onChange={e => {
                  const val = e.target.value;
                  setEditingClass({ 
                    ...editingClass, 
                    completedAt: val ? new Date(val).toISOString() : undefined,
                    isCompleted: Boolean(val)
                  });
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Set or adjust the exact date you watched this lecture.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                External Video Link (Optional)
              </label>
              <input
                type="url"
                value={editingClass.url}
                onChange={e => setEditingClass({ ...editingClass, url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Class Notes & Key Formulas
              </label>
              <textarea
                rows={3}
                value={editingClass.notes}
                onChange={e => setEditingClass({ ...editingClass, notes: e.target.value })}
                placeholder="Key concepts, trick discussed, timestamp..."
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingClass(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClassEdit}
                className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

