import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { SUBJECTS } from '../lib/defaultData';
import { 
  getStudyTasks, 
  addStudyTask, 
  toggleStudyTask, 
  deleteStudyTask, 
  getUserProfile, 
  getAppSettings,
  getAllSyllabusTopics 
} from '../lib/storage';
import { StudyTask, SubjectCode, TaskType } from '../lib/types';

export const StudyPlannerPage: React.FC = () => {
  const allTopics = getAllSyllabusTopics();
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [profile, setProfile] = useState(getUserProfile());
  const [settings, setSettings] = useState(getAppSettings());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'upcoming'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [subjectCode, setSubjectCode] = useState<SubjectCode>('quant');
  const [topicId, setTopicId] = useState(allTopics[0]?.id || 'quant-01');
  const [taskType, setTaskType] = useState<TaskType>('Watch Video');
  const [duration, setDuration] = useState(45);
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [taskNotes, setTaskNotes] = useState('');

  useEffect(() => {
    setTasks(getStudyTasks());
    setProfile(getUserProfile());
    setSettings(getAppSettings());
  }, []);

  const handleToggle = (id: string) => {
    toggleStudyTask(id);
    setTasks(getStudyTasks());
  };

  const handleDelete = (id: string) => {
    deleteStudyTask(id);
    setTasks(getStudyTasks());
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    addStudyTask({
      taskDate,
      subjectCode,
      topicId,
      taskType,
      title: taskTitle.trim(),
      targetDurationMinutes: duration,
      priority,
      isCompleted: false,
      notes: taskNotes
    });
    setTasks(getStudyTasks());
    setIsModalOpen(false);
    setTaskTitle('');
    setTaskNotes('');
  };

  // Day calculation in 120-day plan
  const startDate = new Date(profile.preparationStartDate || new Date());
  const currentDate = new Date(selectedDate);
  const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
  const currentDayNumber = Math.min(profile.durationDays || 120, Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));

  // Filter tasks based on view mode
  const dayTasks = tasks.filter(t => t.taskDate === selectedDate);
  const upcomingTasks = tasks.filter(t => !t.isCompleted && t.taskDate >= selectedDate);
  const overdueTasks = tasks.filter(t => !t.isCompleted && t.taskDate < selectedDate);

  // Navigate dates
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-600" />
            120-Day Study Planner & Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Structured study schedule with weekly concept drilling, revision milestones and mock test sessions.
          </p>
        </div>

        <button
          onClick={() => {
            setTaskDate(selectedDate);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Study Task
        </button>
      </div>

      {/* 120-Day Plan Milestone Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              {profile.targetExam} Preparation Timeline
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              Day {currentDayNumber} of {profile.durationDays || 120}
            </span>
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mt-1">
            {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Weekly Focus: {settings.weeklyStructure[new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long' })] || 'Target Study'}
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
          />
          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekly Structure Quick Cheat Sheet */}
      <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
        <p className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-brand-500" />
          Standard Weekly Banking Exam Rhythm
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-2 text-[11px]">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <div key={day} className="p-2 rounded-lg bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">{day.slice(0, 3)}</span>
              <span className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{settings.weeklyStructure[day]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day Tasks List */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Tasks for Selected Date ({dayTasks.length})
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {dayTasks.filter(t => t.isCompleted).length} of {dayTasks.length} Completed
          </span>
        </div>

        {dayTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <p>No study tasks scheduled for this day.</p>
            <button
              onClick={() => {
                setTaskDate(selectedDate);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add task for today
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {dayTasks.map(task => {
              const sub = SUBJECTS.find(s => s.code === task.subjectCode);
              return (
                <div key={task.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(task.id)}
                      className="shrink-0 focus:outline-none"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${
                          task.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                        }`}>
                          {task.title}
                        </span>
                        {sub && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${sub.bgLight} ${sub.bgDark}`}>
                            {sub.name}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {task.taskType}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {task.targetDurationMinutes} mins
                        </span>
                        <span className={`font-semibold ${
                          task.priority === 'High' ? 'text-rose-600' : task.priority === 'Medium' ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {task.priority} Priority
                        </span>
                        {task.notes && <span className="italic text-slate-400">"{task.notes}"</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-brand-600" />
              Add Study Plan Task
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task Title / Description:
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="e.g. Watch Percentage Class 4 & Solve 30 Level 2 Qs"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={e => setTaskDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  min="15"
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={subjectCode}
                  onChange={e => setSubjectCode(e.target.value as SubjectCode)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="quant">Quantitative Aptitude</option>
                  <option value="reasoning">Reasoning</option>
                  <option value="english">English Language</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Type
                </label>
                <select
                  value={taskType}
                  onChange={e => setTaskType(e.target.value as TaskType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Watch Video">Watch Video</option>
                  <option value="Practice Questions">Practice Questions</option>
                  <option value="Revision">Revision</option>
                  <option value="Mock Test">Mock Test</option>
                  <option value="Vocabulary">Vocabulary</option>
                  <option value="Formula Revision">Formula Revision</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority:
              </label>
              <div className="flex items-center gap-2">
                {(['High', 'Medium', 'Low'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                      priority === p ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes (Optional):
              </label>
              <textarea
                rows={2}
                value={taskNotes}
                onChange={e => setTaskNotes(e.target.value)}
                placeholder="Specific focus or chapter targets..."
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

