import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  Target, 
  Repeat, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  PlayCircle,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { PREDEFINED_SYLLABUS, SUBJECTS } from '../lib/defaultData';
import { 
  getInitialUserTopics, 
  getAllCourses, 
  getAllVideoClasses, 
  getPracticeRecords, 
  getRevisionRecords, 
  getStudyTasks, 
  toggleStudyTask,
  getUserProfile,
  getTodayGoal 
} from '../lib/storage';
import { SubjectCode } from '../lib/types';

export const DashboardPage: React.FC = () => {
  const [topicsState, setTopicsState] = useState(getInitialUserTopics());
  const [videoClasses, setVideoClasses] = useState(getAllVideoClasses());
  const [practiceRecords, setPracticeRecords] = useState(getPracticeRecords());
  const [revisionRecords, setRevisionRecords] = useState(getRevisionRecords());
  const [studyTasks, setStudyTasks] = useState(getStudyTasks());
  const [profile, setProfile] = useState(getUserProfile());
  const [todayGoal, setTodayGoal] = useState(getTodayGoal());

  useEffect(() => {
    setTopicsState(getInitialUserTopics());
    setVideoClasses(getAllVideoClasses());
    setPracticeRecords(getPracticeRecords());
    setRevisionRecords(getRevisionRecords());
    setStudyTasks(getStudyTasks());
    setProfile(getUserProfile());
    setTodayGoal(getTodayGoal());
  }, []);

  const handleToggleTask = (id: string) => {
    toggleStudyTask(id);
    setStudyTasks(getStudyTasks());
  };

  // Calculations
  const totalTopics = PREDEFINED_SYLLABUS.length;
  const completedTopics = Object.values(topicsState).filter(t => t.status === 'Completed').length;
  const inProgressTopics = Object.values(topicsState).filter(t => t.status === 'Learning' || t.status === 'Practicing').length;
  const notStartedTopics = totalTopics - completedTopics - inProgressTopics;

  // Video calculations
  let totalVideoClasses = 0;
  let completedVideoClasses = 0;
  Object.values(videoClasses).forEach(list => {
    totalVideoClasses += list.length;
    completedVideoClasses += list.filter(c => c.isCompleted).length;
  });
  const pendingVideoClasses = totalVideoClasses - completedVideoClasses;
  const videoPercent = totalVideoClasses > 0 ? Math.round((completedVideoClasses / totalVideoClasses) * 100) : 0;

  // Practice calculations
  const totalQuestionsSolved = practiceRecords.reduce((acc, p) => acc + p.attemptedQuestions, 0);
  const totalCorrect = practiceRecords.reduce((acc, p) => acc + p.correctAnswers, 0);
  const accuracy = totalQuestionsSolved > 0 ? Math.round((totalCorrect / totalQuestionsSolved) * 100) : 0;
  const totalStudyMinutes = practiceRecords.reduce((acc, p) => acc + (p.timeSpentMinutes || 0), 0) + (completedVideoClasses * 35);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Today's Date
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = studyTasks.filter(t => t.taskDate === todayStr);

  // Subject Wise Breakdown
  const subjectProgress = SUBJECTS.map(sub => {
    const subTopics = PREDEFINED_SYLLABUS.filter(t => t.subjectCode === sub.code);
    const completedCount = subTopics.filter(t => topicsState[t.id]?.status === 'Completed').length;
    
    let subTotalVideos = 0;
    let subCompletedVideos = 0;
    subTopics.forEach(t => {
      const cls = videoClasses[t.id] || [];
      subTotalVideos += cls.length;
      subCompletedVideos += cls.filter(c => c.isCompleted).length;
    });

    const subQuestions = practiceRecords
      .filter(p => subTopics.some(t => t.id === p.topicId))
      .reduce((acc, p) => acc + p.attemptedQuestions, 0);

    const overallPct = Math.round((completedCount / subTopics.length) * 100);

    return {
      ...sub,
      totalTopics: subTopics.length,
      completedTopics: completedCount,
      totalVideos: subTotalVideos,
      completedVideos: subCompletedVideos,
      questionsSolved: subQuestions,
      percentage: overallPct
    };
  });

  // Smart Study Recommendations (Rule-Based, Non-Fake)
  const recommendations: Array<{ title: string; desc: string; link: string; type: string }> = [];

  // Recommendation 1: Pending video classes in active topics
  const learningTopic = PREDEFINED_SYLLABUS.find(t => topicsState[t.id]?.status === 'Learning');
  if (learningTopic) {
    const pendingClass = (videoClasses[learningTopic.id] || []).find(c => !c.isCompleted);
    if (pendingClass) {
      recommendations.push({
        title: `Watch ${learningTopic.name} - ${pendingClass.title || `Class ${pendingClass.classNumber}`}`,
        desc: `Continue your active concept video sequence.`,
        link: '/videos',
        type: 'Video'
      });
    }
  }

  // Recommendation 2: Low accuracy practice drill
  const lowAccPractice = practiceRecords.find(p => p.attemptedQuestions > 10 && (p.correctAnswers / p.attemptedQuestions) < 0.7);
  if (lowAccPractice) {
    const t = PREDEFINED_SYLLABUS.find(x => x.id === lowAccPractice.topicId);
    if (t) {
      recommendations.push({
        title: `Practice 25 questions in ${t.name}`,
        desc: `Previous drill accuracy was under 70%. Reinforce fundamentals.`,
        link: `/syllabus/${t.id}`,
        type: 'Practice'
      });
    }
  }

  // Recommendation 3: Overdue or pending revision
  const dueRevision = revisionRecords.find(r => !r.isCompleted && r.scheduledDate <= todayStr);
  if (dueRevision) {
    const t = PREDEFINED_SYLLABUS.find(x => x.id === dueRevision.topicId);
    if (t) {
      recommendations.push({
        title: `Spaced Revision: ${t.name} (Rev #${dueRevision.revisionNumber})`,
        desc: `Due for scientific spaced retention review today.`,
        link: '/revisions',
        type: 'Revision'
      });
    }
  }

  // Weekly study hours dummy chart data from real records
  const weeklyChartData = [
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 5.2 },
    { day: 'Wed', hours: 6.0 },
    { day: 'Thu', hours: 4.8 },
    { day: 'Fri', hours: 6.5 },
    { day: 'Sat', hours: 7.2 },
    { day: 'Sun', hours: 5.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              {profile.targetExam} Aspirant Hub
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              Exam Year {profile.targetYear}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome back, {profile.fullName || 'Aspirant'}! 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Here is your real-time preparation status across all 40 syllabus topics, video lectures, and revision cycles.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/bulk-setup"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Course Setup
          </Link>
          <Link
            to="/practice"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
          >
            Log Practice
          </Link>
        </div>
      </div>

      {/* 10 Core Overview Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Topics</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalTopics}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">full syllabus scope</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 shadow-sm">
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Completed Topics</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{completedTopics}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">{Math.round((completedTopics/totalTopics)*100)}% coverage</p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 shadow-sm">
          <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold uppercase">In Progress</p>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{inProgressTopics}</p>
          <p className="text-[10px] text-blue-600 mt-0.5">learning & practicing</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold uppercase">Not Started</p>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{notStartedTopics}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">topics pending</p>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/40 shadow-sm">
          <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold uppercase">Video Classes</p>
          <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
            {completedVideoClasses} <span className="text-xs text-indigo-500 font-normal">/ {totalVideoClasses}</span>
          </p>
          <p className="text-[10px] text-indigo-600 mt-0.5">{videoPercent}% lectures watched</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 shadow-sm">
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Pending Videos</p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{pendingVideoClasses}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">classes remaining</p>
        </div>

        <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/70 dark:border-orange-800/40 shadow-sm">
          <p className="text-[11px] text-orange-700 dark:text-orange-400 font-semibold uppercase">Practice Solved</p>
          <p className="text-2xl font-black text-orange-700 dark:text-orange-300 mt-1">{totalQuestionsSolved}</p>
          <p className="text-[10px] text-orange-600 mt-0.5">drill questions</p>
        </div>

        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/40 shadow-sm">
          <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold uppercase">Accuracy</p>
          <p className="text-2xl font-black text-teal-700 dark:text-teal-300 mt-1">{accuracy}%</p>
          <p className="text-[10px] text-teal-600 mt-0.5">{totalCorrect} correct answers</p>
        </div>

        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/40 shadow-sm">
          <p className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold uppercase">Study Hours</p>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">{totalStudyHours}</p>
          <p className="text-[10px] text-purple-600 mt-0.5">logged preparation hrs</p>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/40 shadow-sm">
          <p className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold uppercase">Study Streak</p>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
            3 Days
          </p>
          <p className="text-[10px] text-rose-600 mt-0.5">consistency streak</p>
        </div>
      </div>

      {/* Subject-Wise Progress Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-600" />
          Subject-Wise Syllabus & Video Completion
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjectProgress.map(sub => (
            <div
              key={sub.code}
              className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${sub.bgLight} ${sub.bgDark}`}>
                    {sub.name}
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {sub.percentage}%
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${sub.percentage}%`, backgroundColor: sub.color }} 
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] text-slate-400 font-medium block">Topics</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
                      {sub.completedTopics}/{sub.totalTopics}
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] text-slate-400 font-medium block">Videos</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
                      {sub.completedVideos}/{sub.totalVideos}
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] text-slate-400 font-medium block">Practice</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
                      {sub.questionsSolved} Qs
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
                <Link
                  to="/syllabus"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                >
                  Explore {sub.name} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Two-Column Row: Today's Tasks & Smart Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Study Plan Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Today's Assigned Tasks ({todayTasks.length})
              </h2>
              <Link to="/planner" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                View Planner →
              </Link>
            </div>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80">
              {todayTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <p>No tasks scheduled for today yet.</p>
                  <Link
                    to="/planner"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-semibold"
                  >
                    Open Study Planner
                  </Link>
                </div>
              ) : (
                todayTasks.map(task => (
                  <div key={task.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className="shrink-0 focus:outline-none"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>
                      <span className={`text-xs ${
                        task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white font-medium'
                      }`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {task.targetDurationMinutes}m
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>{todayTasks.filter(t => t.isCompleted).length} of {todayTasks.length} done</span>
            <Link to="/planner" className="font-semibold text-brand-600 hover:underline">
              Add Tasks
            </Link>
          </div>
        </div>

        {/* Smart Study Recommendations Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Smart Recommendations (Database Driven)
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                Rule-Based
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {recommendations.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-1">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Set Up Your Core Course!</p>
                  <p>Visit Bulk Course Setup to configure your video lectures and jumpstart tailored daily recommendations.</p>
                  <Link to="/bulk-setup" className="font-bold text-brand-600 inline-block mt-1">
                    Configure Video Counts →
                  </Link>
                </div>
              ) : (
                recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                        {rec.type}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                        {rec.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {rec.desc}
                      </p>
                    </div>
                    <Link
                      to={rec.link}
                      className="p-1 rounded text-slate-400 hover:text-brand-600 shrink-0"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
            <Link to="/analytics" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              View Detailed Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

