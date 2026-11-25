import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Download, 
  Upload, 
  Database, 
  Sun, 
  Moon, 
  Laptop, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { 
  getUserProfile, 
  saveUserProfile, 
  getAppSettings, 
  saveAppSettings, 
  getInitialUserTopics,
  getAllCourses,
  getAllVideoClasses,
  getPracticeRecords,
  getRevisionRecords,
  getMockTests,
  getNotes,
  getStudyTasks,
  getAllSyllabusTopics
} from '../lib/storage';
import { isSupabaseConfigured } from '../lib/supabase';

export const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState(getUserProfile());
  const [settings, setSettings] = useState(getAppSettings());

  // Form State
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [targetExam, setTargetExam] = useState(profile.targetExam || 'SBI PO & IBPS PO');
  const [targetYear, setTargetYear] = useState(profile.targetYear || 2026);
  const [startDate, setStartDate] = useState(profile.preparationStartDate || new Date().toISOString().split('T')[0]);
  const [durationDays, setDurationDays] = useState(profile.durationDays || 120);
  const [studyHoursTarget, setStudyHoursTarget] = useState(profile.dailyStudyHoursTarget || 6);
  const [questionsTarget, setQuestionsTarget] = useState(profile.dailyQuestionsTarget || 50);
  const [videosTarget, setVideosTarget] = useState(profile.dailyVideosTarget || 3);

  // Supabase keys
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setProfile(getUserProfile());
    setSettings(getAppSettings());
  }, []);

  const handleSaveProfile = () => {
    const updatedProfile = saveUserProfile({
      fullName,
      targetExam,
      targetYear,
      preparationStartDate: startDate,
      durationDays,
      dailyStudyHoursTarget: studyHoursTarget,
      dailyQuestionsTarget: questionsTarget,
      dailyVideosTarget: videosTarget
    });
    setProfile(updatedProfile);
    setToastMessage('Profile and study targets saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSupabase = () => {
    const updated = saveAppSettings({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim()
    });
    setSettings(updated);
    setToastMessage('Supabase credentials saved. Reloading client...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    const updated = saveAppSettings({ theme });
    setSettings(updated);
  };

  // CSV Exporters
  const downloadCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSyllabusCsv = () => {
    const allTopics = getAllSyllabusTopics();
    const topics = getInitialUserTopics();
    const header = 'Subject,Topic Name,Status,Confidence,Target Questions\n';
    const rows = allTopics.map(t => {
      const state = topics[t.id];
      return `"${t.subjectCode}","${t.name}","${state?.status || 'Not Started'}",${state?.confidenceLevel || 1},${state?.targetQuestions || 200}`;
    }).join('\n');
    downloadCsv('BankPrep_Syllabus_Progress.csv', header + rows);
  };

  const exportVideosCsv = () => {
    const allTopics = getAllSyllabusTopics();
    const classes = getAllVideoClasses();
    const header = 'Topic,Class Number,Class Title,Completed,Completed Date,Link\n';
    const lines: string[] = [];
    Object.entries(classes).forEach(([topicId, list]) => {
      const t = allTopics.find(x => x.id === topicId);
      list.forEach(c => {
        lines.push(`"${t?.name || topicId}",${c.classNumber},"${c.title}",${c.isCompleted},"${c.completedAt || ''}","${c.externalVideoUrl || ''}"`);
      });
    });
    downloadCsv('BankPrep_Video_Classes.csv', header + lines.join('\n'));
  };

  const exportPracticeCsv = () => {
    const allTopics = getAllSyllabusTopics();
    const records = getPracticeRecords();
    const header = 'Date,Topic,Attempted,Correct,Incorrect,Accuracy,Time Mins,Level,Source,Notes\n';
    const rows = records.map(r => {
      const t = allTopics.find(x => x.id === r.topicId);
      const acc = r.attemptedQuestions > 0 ? ((r.correctAnswers / r.attemptedQuestions) * 100).toFixed(1) : '0';
      return `"${r.practiceDate}","${t?.name || r.topicId}",${r.attemptedQuestions},${r.correctAnswers},${r.incorrectAnswers},${acc}%,${r.timeSpentMinutes},"${r.difficultyLevel}","${r.source}","${r.notes || ''}"`;
    }).join('\n');
    downloadCsv('BankPrep_Practice_Logs.csv', header + rows);
  };

  const exportMockTestsCsv = () => {
    const mocks = getMockTests();
    const header = 'Date,Test Name,Provider,Type,Total Marks,Marks Obtained,Quant,Reasoning,English,Attempted,Correct\n';
    const rows = mocks.map(m => {
      return `"${m.testDate}","${m.testName}","${m.provider}","${m.testType}",${m.totalMarks},${m.marksObtained},${m.quantScore},${m.reasoningScore},${m.englishScore},${m.attemptedQuestions},${m.correctAnswers}`;
    }).join('\n');
    downloadCsv('BankPrep_Mock_Tests.csv', header + rows);
  };

  // JSON Full Backup
  const handleExportFullBackup = () => {
    const backup = {
      profile: getUserProfile(),
      settings: getAppSettings(),
      topics: getInitialUserTopics(),
      courses: getAllCourses(),
      videoClasses: getAllVideoClasses(),
      practice: getPracticeRecords(),
      revisions: getRevisionRecords(),
      tasks: getStudyTasks(),
      notes: getNotes(),
      mocks: getMockTests(),
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BankPrep_Complete_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.profile) localStorage.setItem('bankprep_profile', JSON.stringify(data.profile));
        if (data.topics) localStorage.setItem('bankprep_user_topics', JSON.stringify(data.topics));
        if (data.courses) localStorage.setItem('bankprep_courses', JSON.stringify(data.courses));
        if (data.videoClasses) localStorage.setItem('bankprep_video_classes', JSON.stringify(data.videoClasses));
        if (data.practice) localStorage.setItem('bankprep_practice_records', JSON.stringify(data.practice));
        if (data.revisions) localStorage.setItem('bankprep_revisions', JSON.stringify(data.revisions));
        if (data.tasks) localStorage.setItem('bankprep_study_tasks', JSON.stringify(data.tasks));
        if (data.notes) localStorage.setItem('bankprep_notes', JSON.stringify(data.notes));
        if (data.mocks) localStorage.setItem('bankprep_mock_tests', JSON.stringify(data.mocks));

        setToastMessage('Data restored successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        alert('Invalid JSON backup file');
      }
    };
    reader.readAsText(file);
  };

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-600" />
          Settings, Database Sync & Data Export
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure exam duration, daily study targets, Supabase live database sync, and CSV data exports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Section 1: Preparation Profile & Target Settings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Aspirant Target & Plan Settings
            </h2>
            {(profile.email || profile.phone) && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {profile.phone ? `📱 ${profile.phone}` : `✉️ ${profile.email}`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Exam
              </label>
              <input
                type="text"
                value={targetExam}
                onChange={e => setTargetExam(e.target.value)}
                placeholder="SBI PO & IBPS PO"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Year
              </label>
              <input
                type="number"
                value={targetYear}
                onChange={e => setTargetYear(parseInt(e.target.value, 10) || 2026)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plan Days
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={e => setDurationDays(parseInt(e.target.value, 10) || 120)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-center font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Daily Study Hrs
              </label>
              <input
                type="number"
                value={studyHoursTarget}
                onChange={e => setStudyHoursTarget(parseFloat(e.target.value) || 6)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Daily Practice Qs
              </label>
              <input
                type="number"
                value={questionsTarget}
                onChange={e => setQuestionsTarget(parseInt(e.target.value, 10) || 50)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Daily Videos
              </label>
              <input
                type="number"
                value={videosTarget}
                onChange={e => setVideosTarget(parseInt(e.target.value, 10) || 3)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-center font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveProfile}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20"
            >
              <Save className="w-4 h-4" />
              Save Study Profile
            </button>
          </div>
        </div>

        {/* Section 2: Theme & Supabase Live Sync */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Interface Theme & Supabase Connection
          </h2>

          {/* Theme Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Theme Mode:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border ${
                  settings.theme === 'light' ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" /> Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border ${
                  settings.theme === 'dark' ? 'bg-brand-950 border-brand-500 text-brand-300 font-bold' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" /> Dark
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border ${
                  settings.theme === 'system' ? 'bg-slate-200 dark:bg-slate-700 font-bold' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Laptop className="w-4 h-4 text-slate-400" /> System
              </button>
            </div>
          </div>

          {/* Supabase Config */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Supabase Live Connection
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isSupabaseConfigured() 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isSupabaseConfigured() ? 'Connected' : 'Local Storage Mode'}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Supabase Project URL:
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Supabase Anon Public API Key:
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={e => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveSupabase}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Connect Supabase
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: CSV Data Exports (4 Official Formats) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            CSV Data Export Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export any module to spreadsheet format for offline analysis, archiving, or tutor review.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={exportSyllabusCsv}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-xs text-slate-900 dark:text-white block">Syllabus Progress</strong>
                <span className="text-[10px] text-slate-400">40 topics status</span>
              </div>
              <Download className="w-4 h-4 text-brand-600" />
            </button>

            <button
              onClick={exportVideosCsv}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-xs text-slate-900 dark:text-white block">Video Lectures</strong>
                <span className="text-[10px] text-slate-400">Class completion log</span>
              </div>
              <Download className="w-4 h-4 text-brand-600" />
            </button>

            <button
              onClick={exportPracticeCsv}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-xs text-slate-900 dark:text-white block">Practice Records</strong>
                <span className="text-[10px] text-slate-400">Questions & accuracy</span>
              </div>
              <Download className="w-4 h-4 text-brand-600" />
            </button>

            <button
              onClick={exportMockTestsCsv}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-xs text-slate-900 dark:text-white block">Mock Tests</strong>
                <span className="text-[10px] text-slate-400">Sectional scores</span>
              </div>
              <Download className="w-4 h-4 text-brand-600" />
            </button>
          </div>
        </div>

        {/* Section 4: Complete Backup & Restore (JSON) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Full Database Snapshot Backup & Restore
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Download a complete JSON snapshot containing all your video progress, practice logs, mock test scores and formula notes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleExportFullBackup}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Full JSON Backup
            </button>

            <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Restore From JSON Backup
              <input
                type="file"
                accept=".json,application/json"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleRestoreJson(f);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

