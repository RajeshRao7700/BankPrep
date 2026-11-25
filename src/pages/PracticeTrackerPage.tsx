import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  BarChart2,
  Flame,
  Search,
  Filter
} from 'lucide-react';
import { SUBJECTS } from '../lib/defaultData';
import { getPracticeRecords, addPracticeRecord, deletePracticeRecord, getAllSyllabusTopics } from '../lib/storage';
import { PracticeRecord, SubjectCode } from '../lib/types';

export const PracticeTrackerPage: React.FC = () => {
  const allTopics = getAllSyllabusTopics();
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectCode | 'all'>('all');
  const [searchTopic, setSearchTopic] = useState('');

  // Form State
  const [topicId, setTopicId] = useState(allTopics[0]?.id || 'quant-01');
  const [practiceDate, setPracticeDate] = useState(new Date().toISOString().split('T')[0]);
  const [attempted, setAttempted] = useState(40);
  const [correct, setCorrect] = useState(32);
  const [timeSpent, setTimeSpent] = useState(40);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [source, setSource] = useState<'Book' | 'Website' | 'Mock' | 'Other'>('Book');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setRecords(getPracticeRecords());
  }, []);

  const handleSave = () => {
    const inc = Math.max(0, attempted - correct);
    addPracticeRecord({
      topicId,
      practiceDate,
      attemptedQuestions: attempted,
      correctAnswers: correct,
      incorrectAnswers: inc,
      skippedQuestions: 0,
      timeSpentMinutes: timeSpent,
      difficultyLevel: difficulty,
      source,
      notes
    });
    setRecords(getPracticeRecords());
    setIsModalOpen(false);
    setNotes('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this practice log record?')) {
      deletePracticeRecord(id);
      setRecords(getPracticeRecords());
    }
  };

  // Calculations
  const totalAttempted = records.reduce((acc, r) => acc + r.attemptedQuestions, 0);
  const totalCorrect = records.reduce((acc, r) => acc + r.correctAnswers, 0);
  const totalTimeSpent = records.reduce((acc, r) => acc + (r.timeSpentMinutes || 0), 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const avgTimePerQuestion = totalAttempted > 0 ? (totalTimeSpent * 60 / totalAttempted).toFixed(0) : '0';

  // Filtered records
  const filteredRecords = records.filter(r => {
    const t = allTopics.find(x => x.id === r.topicId);
    if (!t) return false;
    if (selectedSubject !== 'all' && t.subjectCode !== selectedSubject) return false;
    if (searchTopic && !t.name.toLowerCase().includes(searchTopic.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-500" />
            Practice Questions Tracker & Accuracy Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log your daily problem-solving drills across arithmetic, reasoning puzzles and English grammar.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Log Practice Session
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Solved</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalAttempted}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">questions across all subjects</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 shadow-sm">
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Overall Accuracy</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{overallAccuracy}%</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">{totalCorrect} correct answers</p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 shadow-sm">
          <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold uppercase">Total Time Spent</p>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{(totalTimeSpent / 60).toFixed(1)} hrs</p>
          <p className="text-[10px] text-blue-600 mt-0.5">{totalTimeSpent} total practice minutes</p>
        </div>

        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/40 shadow-sm">
          <p className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold uppercase">Avg Speed</p>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">{avgTimePerQuestion}s</p>
          <p className="text-[10px] text-purple-600 mt-0.5">average time per question</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedSubject === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            All Subjects
          </button>
          {SUBJECTS.map(s => (
            <button
              key={s.code}
              onClick={() => setSelectedSubject(s.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedSubject === s.code ? `${s.bgLight} ${s.bgDark} font-bold` : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search topic in logs..."
            value={searchTopic}
            onChange={e => setSearchTopic(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Practice Records Table */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">Attempted</th>
                <th className="py-3 px-4">Correct</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Time Spent</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-slate-400">
                    No practice logs recorded yet. Click "Log Practice Session" above to add your first drill!
                  </td>
                </tr>
              ) : (
                filteredRecords.map(item => {
                  const t = allTopics.find(x => x.id === item.topicId);
                  const sub = t ? SUBJECTS.find(s => s.code === t.subjectCode) : null;
                  const acc = item.attemptedQuestions > 0 ? Math.round((item.correctAnswers / item.attemptedQuestions) * 100) : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {item.practiceDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {t?.name || 'Topic'}
                        </span>
                        {sub && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${sub.bgLight} ${sub.bgDark}`}>
                            {sub.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {item.attemptedQuestions}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {item.correctAnswers}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${acc >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          acc >= 60 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                            'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}>
                          {acc}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {item.timeSpentMinutes} mins
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.difficultyLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {item.source}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate italic">
                        {item.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete practice record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Practice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              Log Practice Session
            </h3>

            {/* Topic Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Syllabus Topic:
              </label>
              <select
                value={topicId}
                onChange={e => setTopicId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                {allTopics.map(t => (
                  <option key={t.id} value={t.id}>
                    [{t.subjectCode.toUpperCase()}] {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Practice Date
                </label>
                <input
                  type="date"
                  value={practiceDate}
                  onChange={e => setPracticeDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Beginner">Beginner (Pre Level)</option>
                  <option value="Intermediate">Intermediate (Moderate)</option>
                  <option value="Advanced">Advanced (Mains Level)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Practice Source
                </label>
                <select
                  value={source}
                  onChange={e => setSource(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Book">Standard Book / PDF</option>
                  <option value="Website">Test / Quiz Platform</option>
                  <option value="Mock">Sectional Mock Test</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Personal Notes & Learnings
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Mistakes made, tricks to remember..."
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
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Save Practice Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

