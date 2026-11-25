import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Repeat,
  Target,
  Video,
  Flame,
  Clock,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { SUBJECTS } from '../lib/defaultData';
import { 
  getInitialUserTopics, 
  getAllVideoClasses, 
  getPracticeRecords, 
  getRevisionRecords, 
  getMockTests,
  getAllSyllabusTopics 
} from '../lib/storage';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const AnalyticsPage: React.FC = () => {
  const allTopics = getAllSyllabusTopics();
  const [topicsState, setTopicsState] = useState(getInitialUserTopics());
  const [videoClasses, setVideoClasses] = useState(getAllVideoClasses());
  const [practiceRecords, setPracticeRecords] = useState(getPracticeRecords());
  const [revisionRecords, setRevisionRecords] = useState(getRevisionRecords());
  const [mockTests, setMockTests] = useState(getMockTests());

  useEffect(() => {
    setTopicsState(getInitialUserTopics());
    setVideoClasses(getAllVideoClasses());
    setPracticeRecords(getPracticeRecords());
    setRevisionRecords(getRevisionRecords());
    setMockTests(getMockTests());
  }, []);

  // Total topics stats
  const totalTopics = allTopics.length;
  const completedTopics = Object.values(topicsState).filter(t => t.status === 'Completed').length;
  const syllabusPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Video stats
  let totalVideos = 0;
  let completedVideos = 0;
  Object.values(videoClasses).forEach(list => {
    totalVideos += list.length;
    completedVideos += list.filter(c => c.isCompleted).length;
  });
  const videoPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  // Practice stats
  const totalQuestions = practiceRecords.reduce((acc, p) => acc + p.attemptedQuestions, 0);
  const totalCorrect = practiceRecords.reduce((acc, p) => acc + p.correctAnswers, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Revision stats
  const completedRevisions = revisionRecords.filter(r => r.isCompleted).length;

  // Identify Strong Topics (confidence >= 4 or practice accuracy >= 80% with at least 20 questions)
  const strongTopics = allTopics.filter(t => {
    const state = topicsState[t.id];
    const recs = practiceRecords.filter(p => p.topicId === t.id);
    const attempted = recs.reduce((a, b) => a + b.attemptedQuestions, 0);
    const correct = recs.reduce((a, b) => a + b.correctAnswers, 0);
    const acc = attempted >= 20 ? (correct / attempted) : 0;
    return (state && state.confidenceLevel >= 4) || acc >= 0.8;
  });

  // Identify Weak Topics (confidence <= 2 or accuracy < 70% with at least 15 questions or marked in mistakes)
  const weakTopics = allTopics.filter(t => {
    const state = topicsState[t.id];
    const recs = practiceRecords.filter(p => p.topicId === t.id);
    const attempted = recs.reduce((a, b) => a + b.attemptedQuestions, 0);
    const correct = recs.reduce((a, b) => a + b.correctAnswers, 0);
    const acc = attempted >= 15 ? (correct / attempted) : 1;
    return (state && state.confidenceLevel <= 2 && state.status !== 'Not Started') || (attempted >= 15 && acc < 0.7);
  });

  // Topics with incomplete videos
  const incompleteVideoTopics = allTopics.filter(t => {
    const cls = videoClasses[t.id] || [];
    return cls.length > 0 && cls.some(c => !c.isCompleted);
  });

  // Chart data: Subject wise comparison
  const subjectChartData = SUBJECTS.map(sub => {
    const subTopics = allTopics.filter(t => t.subjectCode === sub.code);
    const done = subTopics.filter(t => topicsState[t.id]?.status === 'Completed').length;
    return {
      name: sub.name,
      Completed: done,
      Remaining: subTopics.length - done
    };
  });

  // Status Pie Chart
  const statusCounts = [
    { name: 'Completed', value: completedTopics },
    { name: 'Learning', value: Object.values(topicsState).filter(t => t.status === 'Learning').length },
    { name: 'Practicing', value: Object.values(topicsState).filter(t => t.status === 'Practicing').length },
    { name: 'Not Started', value: totalTopics - completedTopics - Object.values(topicsState).filter(t => t.status === 'Learning' || t.status === 'Practicing').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-600" />
          Preparation Performance Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Deep diagnostic metrics, topic-level mastery insights, accuracy trends, and weak area analysis.
        </p>
      </div>

      {/* Progress Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Syllabus Progress</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{syllabusPercent}%</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-brand-600 h-full rounded-full" style={{ width: `${syllabusPercent}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/40 shadow-sm">
          <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold uppercase">Video Progress</p>
          <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">{videoPercent}%</p>
          <p className="text-[10px] text-indigo-600 mt-0.5">{completedVideos}/{totalVideos} classes watched</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 shadow-sm">
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Practice Accuracy</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{overallAccuracy}%</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">{totalQuestions} questions attempted</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 shadow-sm">
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Revisions Finished</p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{completedRevisions}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">cycles completed</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Subject Wise Completion Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-600" />
            Subject-Wise Topic Completion Status
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Remaining" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Breakdown Pie Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Overall Syllabus Topic State Distribution
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Diagnostic Area: Strong vs Weak Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strong Topics */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              High-Confidence Strong Topics ({strongTopics.length})
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              Confidence ≥ 4 or Acc ≥ 80%
            </span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {strongTopics.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Log practice drills and rate topic confidence to identify your power topics.
              </p>
            ) : (
              strongTopics.map(t => {
                const sub = SUBJECTS.find(s => s.code === t.subjectCode)!;
                return (
                  <div key={t.id} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
                    <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full ${sub.bgLight} ${sub.bgDark}`}>
                      {sub.name}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Weak Topics Requiring Attention ({weakTopics.length})
            </h3>
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">
              Priority Review
            </span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {weakTopics.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No weak topics flagged! Maintain consistent daily practice.
              </p>
            ) : (
              weakTopics.map(t => {
                const sub = SUBJECTS.find(s => s.code === t.subjectCode)!;
                return (
                  <div key={t.id} className="p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-950 dark:text-rose-200">{t.name}</span>
                    <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full ${sub.bgLight} ${sub.bgDark}`}>
                      {sub.name}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

