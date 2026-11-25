import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  TrendingUp,
  Award,
  Target,
  Clock,
  CheckCircle2,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { getMockTests, addMockTest, deleteMockTest } from '../lib/storage';
import { MockTestRecord } from '../lib/types';
import confetti from 'canvas-confetti';

const PROVIDERS = ['Oliveboard', 'Testbook', 'PracticeMock', 'Guidely', 'Adda247', 'Smartkeeda', 'Other'];

export const MockTestsPage: React.FC = () => {
  const [mockTests, setMockTests] = useState<MockTestRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [testName, setTestName] = useState('');
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [testType, setTestType] = useState<'Full Length' | 'Sectional'>('Full Length');
  const [totalMarks, setTotalMarks] = useState(100);
  const [marksObtained, setMarksObtained] = useState(65.5);
  const [totalQuestions, setTotalQuestions] = useState(100);
  const [attempted, setAttempted] = useState(78);
  const [correct, setCorrect] = useState(68);
  const [timeTaken, setTimeTaken] = useState(60);
  const [quantScore, setQuantScore] = useState(25);
  const [reasoningScore, setReasoningScore] = useState(24.5);
  const [englishScore, setEnglishScore] = useState(16);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setMockTests(getMockTests());
  }, []);

  const handleSave = () => {
    if (!testName.trim()) return;

    const inc = Math.max(0, attempted - correct);
    const skipped = Math.max(0, totalQuestions - attempted);

    addMockTest({
      testName: testName.trim(),
      provider,
      testDate,
      testType,
      totalMarks,
      marksObtained,
      totalQuestions,
      attemptedQuestions: attempted,
      correctAnswers: correct,
      incorrectAnswers: inc,
      skippedQuestions: skipped,
      timeTakenMinutes: timeTaken,
      quantScore,
      reasoningScore,
      englishScore,
      notes
    });

    setMockTests(getMockTests());
    setIsModalOpen(false);
    setTestName('');
    setNotes('');

    if (marksObtained >= 60) {
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this mock test record?')) {
      deleteMockTest(id);
      setMockTests(getMockTests());
    }
  };

  // Calculations
  const testCount = mockTests.length;
  const bestScore = testCount > 0 ? Math.max(...mockTests.map(m => m.marksObtained)) : 0;
  const avgScore = testCount > 0 ? (mockTests.reduce((a, b) => a + b.marksObtained, 0) / testCount).toFixed(1) : '0';

  // Average Subject Scores
  const avgQuant = testCount > 0 ? (mockTests.reduce((a, b) => a + b.quantScore, 0) / testCount).toFixed(1) : '0';
  const avgReasoning = testCount > 0 ? (mockTests.reduce((a, b) => a + b.reasoningScore, 0) / testCount).toFixed(1) : '0';
  const avgEnglish = testCount > 0 ? (mockTests.reduce((a, b) => a + b.englishScore, 0) / testCount).toFixed(1) : '0';

  // Weakest Subject
  let weakest = 'N/A';
  if (testCount > 0) {
    const q = Number(avgQuant);
    const r = Number(avgReasoning);
    const e = Number(avgEnglish);
    if (e <= q && e <= r) weakest = 'English Language';
    else if (q <= r) weakest = 'Quantitative Aptitude';
    else weakest = 'Reasoning Ability';
  }

  // Chart data (sorted by date)
  const chartData = [...mockTests].reverse().map(m => ({
    name: m.testName.length > 12 ? m.testName.slice(0, 10) + '..' : m.testName,
    date: m.testDate,
    Score: m.marksObtained,
    Quant: m.quantScore,
    Reasoning: m.reasoningScore,
    English: m.englishScore,
    Accuracy: m.attemptedQuestions > 0 ? Math.round((m.correctAnswers / m.attemptedQuestions) * 100) : 0
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            Mock Test Performance Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track full-length prelims and sectional mock tests with sectional split, accuracy and score progress trends.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Mock Test Score
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Mocks</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{testCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">tests analyzed</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 shadow-sm">
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Best Score</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{bestScore}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">highest mark obtained</p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 shadow-sm">
          <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold uppercase">Average Score</p>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{avgScore}</p>
          <p className="text-[10px] text-blue-600 mt-0.5">overall average</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 shadow-sm">
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Attention Needed</p>
          <p className="text-base font-extrabold text-amber-800 dark:text-amber-300 mt-1 truncate">{weakest}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">lowest average section</p>
        </div>
      </div>

      {/* Analytics Charts */}
      {testCount > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1: Total Score & Accuracy Trend */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              Score Progress Trend (Marks)
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="Score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Sectional Performance Split */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Sectional Score Breakdown (Quant, Reasoning, English)
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Quant" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Reasoning" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="English" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Mock Tests History Table */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Mock Test Logs ({testCount})
          </h2>
          <span className="text-xs text-slate-400">
            Real logged scores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Test Name & Provider</th>
                <th className="py-3 px-4 font-bold">Total Marks</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4 text-blue-600">Quant</th>
                <th className="py-3 px-4 text-emerald-600">Reasoning</th>
                <th className="py-3 px-4 text-amber-600">English</th>
                <th className="py-3 px-4">Attempted</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {mockTests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-slate-400">
                    No mock test records saved yet. Add your latest sectional or full mock score!
                  </td>
                </tr>
              ) : (
                mockTests.map(m => {
                  const acc = m.attemptedQuestions > 0 ? Math.round((m.correctAnswers / m.attemptedQuestions) * 100) : 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        {m.testDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {m.testName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {m.provider} • {m.testType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-brand-600 dark:text-brand-400 text-sm">
                          {m.marksObtained}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">/ {m.totalMarks}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${acc >= 85 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          acc >= 70 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                            'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}>
                          {acc}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                        {m.quantScore}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {m.reasoningScore}
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">
                        {m.englishScore}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {m.attemptedQuestions}/{m.totalQuestions}
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                        {m.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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

      {/* Add Mock Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              Add Mock Test Score Record
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Test Title / Series:
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={e => setTestName(e.target.value)}
                  placeholder="e.g. SBI PO Prelims Mock #03"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Provider:
                </label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {PROVIDERS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Test Date
                </label>
                <input
                  type="date"
                  value={testDate}
                  onChange={e => setTestDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Test Format
                </label>
                <select
                  value={testType}
                  onChange={e => setTestType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Full Length">Full Length Prelims (100 Marks)</option>
                  <option value="Sectional">Sectional Mock Test</option>
                </select>
              </div>
            </div>

            {/* Total Marks & Marks Obtained */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-brand-50/50 dark:bg-brand-950/20 rounded-xl border border-brand-100 dark:border-brand-900/30">
              <div>
                <label className="block text-xs font-bold text-brand-900 dark:text-brand-200 mb-1">
                  Marks Obtained
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={marksObtained}
                  onChange={e => setMarksObtained(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-brand-300 dark:border-brand-700 font-black text-base text-brand-700 dark:text-brand-300 text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Maximum Marks
                </label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={e => setTotalMarks(parseInt(e.target.value, 10) || 100)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-800 dark:text-slate-200 text-center"
                />
              </div>
            </div>

            {/* Sectional Split */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Sectional Marks Split:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-blue-600 block">Quant Score</span>
                  <input
                    type="number"
                    step="0.25"
                    value={quantScore}
                    onChange={e => setQuantScore(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-blue-200 dark:border-blue-900 font-bold text-xs text-center text-blue-700 dark:text-blue-300"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-emerald-600 block">Reasoning Score</span>
                  <input
                    type="number"
                    step="0.25"
                    value={reasoningScore}
                    onChange={e => setReasoningScore(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900 font-bold text-xs text-center text-emerald-700 dark:text-emerald-300"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-amber-600 block">English Score</span>
                  <input
                    type="number"
                    step="0.25"
                    value={englishScore}
                    onChange={e => setEnglishScore(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-amber-200 dark:border-amber-900 font-bold text-xs text-center text-amber-700 dark:text-amber-300"
                  />
                </div>
              </div>
            </div>

            {/* Questions Attempted / Correct */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Total Questions
                </label>
                <input
                  type="number"
                  value={totalQuestions}
                  onChange={e => setTotalQuestions(parseInt(e.target.value, 10) || 100)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Attempted
                </label>
                <input
                  type="number"
                  value={attempted}
                  onChange={e => setAttempted(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-emerald-600 mb-1">
                  Correct
                </label>
                <input
                  type="number"
                  value={correct}
                  onChange={e => setCorrect(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-xs text-center font-bold text-emerald-700 dark:text-emerald-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mock Test Analysis & Weak Areas:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Wasted 4 minutes on floor puzzle, silly error in quadratic signs..."
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
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20"
              >
                Save Mock Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

