import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Save, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { PREDEFINED_SYLLABUS, SUBJECTS } from '../lib/defaultData';
import { getAllCourses, saveTopicCourseConfig } from '../lib/storage';
import { SubjectCode, TopicCourseConfig } from '../lib/types';

interface TopicRowData {
  topicId: string;
  topicName: string;
  subjectCode: SubjectCode;
  totalClasses: number;
  courseName: string;
  externalCourseUrl: string;
  notes: string;
}

export const BulkSetupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubjectCode | 'all'>('quant');
  const [formData, setFormData] = useState<Record<string, TopicRowData>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvPreview, setCsvPreview] = useState<Array<{ name: string; classes: number; found: boolean }>>([]);

  useEffect(() => {
    const existing = getAllCourses();
    const initial: Record<string, TopicRowData> = {};

    PREDEFINED_SYLLABUS.forEach(topic => {
      const saved = existing[topic.id];
      initial[topic.id] = {
        topicId: topic.id,
        topicName: topic.name,
        subjectCode: topic.subjectCode,
        totalClasses: saved ? saved.totalClasses : 0,
        courseName: saved?.courseName || '',
        externalCourseUrl: saved?.externalCourseUrl || '',
        notes: saved?.notes || ''
      };
    });

    setFormData(initial);
  }, []);

  const handleChange = (topicId: string, field: keyof TopicRowData, val: any) => {
    setFormData(prev => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        [field]: val
      }
    }));
  };

  const handleSaveAll = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate
    let hasInvalid = false;
    Object.values(formData).forEach(row => {
      if (isNaN(row.totalClasses) || row.totalClasses < 0) {
        hasInvalid = true;
      }
    });

    if (hasInvalid) {
      setErrorMessage('Class counts must be zero or positive whole numbers.');
      return;
    }

    // Save configurations and automatically generate classes
    let totalGeneratedClasses = 0;
    Object.values(formData).forEach(row => {
      const { classes } = saveTopicCourseConfig(
        row.topicId,
        Number(row.totalClasses) || 0,
        row.courseName,
        row.externalCourseUrl,
        row.notes
      );
      totalGeneratedClasses += classes.length;
    });

    setSuccessMessage(`Course configuration saved successfully! Generated ${totalGeneratedClasses} individual video classes across all topics while preserving completion history.`);
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  // CSV Template download
  const handleDownloadCsvTemplate = () => {
    const header = 'Subject,Topic,Total Classes,Course Name,Course URL,Notes\n';
    const rows = PREDEFINED_SYLLABUS.map(t => {
      const current = formData[t.id];
      const count = current?.totalClasses || 0;
      return `"${t.subjectCode}","${t.name}",${count},"","",""`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'BankPrep_Course_Setup_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV text
  const handleParseCsv = (text: string) => {
    setCsvText(text);
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) {
      setCsvPreview([]);
      return;
    }

    const preview: Array<{ name: string; classes: number; found: boolean }> = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.replace(/(^"|"$)/g, '').trim());
      if (parts.length >= 2) {
        // Find if topic name matches (parts[0] or parts[1])
        const possibleName = parts[1] || parts[0];
        const match = PREDEFINED_SYLLABUS.find(t => 
          t.name.toLowerCase() === possibleName.toLowerCase() ||
          t.name.toLowerCase().includes(possibleName.toLowerCase())
        );
        const count = parseInt(parts[2] || parts[1], 10);
        preview.push({
          name: possibleName,
          classes: isNaN(count) ? 0 : Math.max(0, count),
          found: Boolean(match)
        });
      }
    }
    setCsvPreview(preview);
  };

  const handleApplyCsv = () => {
    const updated = { ...formData };
    csvPreview.forEach(item => {
      const match = PREDEFINED_SYLLABUS.find(t => 
        t.name.toLowerCase() === item.name.toLowerCase() ||
        t.name.toLowerCase().includes(item.name.toLowerCase())
      );
      if (match && updated[match.id]) {
        updated[match.id].totalClasses = item.classes;
      }
    });
    setFormData(updated);
    setIsCsvModalOpen(false);
    setSuccessMessage(`Imported ${csvPreview.filter(p => p.found).length} course counts from CSV. Click "Save Course Configuration" below to apply!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 text-xs font-semibold mb-2">
            <Settings2 className="w-3.5 h-3.5" />
            Core Video Course Setup
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bulk Course Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Enter the exact total number of video lecture classes for every banking topic according to your external coaching course. 
            Individual numbered classes with independent checkboxes will be automatically generated.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>

          <button
            onClick={handleDownloadCsvTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </button>

          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Course Configuration
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-start gap-3 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* Info Callout */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 text-blue-900 dark:text-blue-300 text-xs flex items-center gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <p>
          <strong>Zero Class Loss Guarantee:</strong> Changing a topic's class count preserves previously watched classes. Entering <strong>10 classes</strong> automatically creates <strong>Class 1 to Class 10</strong> on the Video Lectures page.
        </p>
      </div>

      {/* Subject Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('quant')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'quant'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Quantitative Aptitude (15)
        </button>
        <button
          onClick={() => setActiveTab('reasoning')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reasoning'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Reasoning (10)
        </button>
        <button
          onClick={() => setActiveTab('english')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'english'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          English Language (15)
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Show All 40 Topics
        </button>
      </div>

      {/* Editable Table */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[220px]">Topic Name</th>
                <th className="py-3 px-4 w-36">Total Video Classes</th>
                <th className="py-3 px-4 min-w-[180px]">Course / Batch Name (Optional)</th>
                <th className="py-3 px-4 min-w-[200px]">Course URL (Optional)</th>
                <th className="py-3 px-4 min-w-[180px]">Personal Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {PREDEFINED_SYLLABUS
                .filter(t => activeTab === 'all' || t.subjectCode === activeTab)
                .map((topic, index) => {
                  const row = formData[topic.id] || {
                    topicId: topic.id,
                    topicName: topic.name,
                    subjectCode: topic.subjectCode,
                    totalClasses: 0,
                    courseName: '',
                    externalCourseUrl: '',
                    notes: ''
                  };
                  const subject = SUBJECTS.find(s => s.code === topic.subjectCode)!;

                  return (
                    <tr key={topic.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Row Index */}
                      <td className="py-3 px-4 text-center font-medium text-slate-400">
                        {index + 1}
                      </td>

                      {/* Topic Name + Subject Badge */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {topic.name}
                        </div>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${subject.bgLight} ${subject.bgDark}`}>
                          {subject.name}
                        </span>
                      </td>

                      {/* Number of Video Classes Input */}
                      <td className="py-3 px-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="300"
                            value={row.totalClasses === 0 ? '' : row.totalClasses}
                            onChange={(e) => handleChange(topic.id, 'totalClasses', Math.max(0, parseInt(e.target.value, 10) || 0))}
                            placeholder="0"
                            className="w-28 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-center"
                          />
                          <span className="text-[10px] text-slate-400 ml-1.5 font-medium">classes</span>
                        </div>
                      </td>

                      {/* Course / Batch Name */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={row.courseName}
                          onChange={(e) => handleChange(topic.id, 'courseName', e.target.value)}
                          placeholder="e.g. Foundation Batch 2026"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </td>

                      {/* External Course URL */}
                      <td className="py-3 px-4">
                        <input
                          type="url"
                          value={row.externalCourseUrl}
                          onChange={(e) => handleChange(topic.id, 'externalCourseUrl', e.target.value)}
                          placeholder="https://..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={row.notes}
                          onChange={(e) => handleChange(topic.id, 'notes', e.target.value)}
                          placeholder="e.g. Focus on mains level types"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Bar inside Table */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total configured topics: {Object.values(formData).filter(r => r.totalClasses > 0).length} of 40
          </p>

          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Course Configuration
          </button>
        </div>
      </div>

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-600" />
                Import Course Lecture Counts (CSV)
              </h2>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste CSV contents below. You can also upload a CSV file directly.
            </p>

            {/* File Upload Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Upload CSV File:
              </label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const text = event.target?.result as string;
                      handleParseCsv(text || '');
                    };
                    reader.readAsText(file);
                  }
                }}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-950 dark:file:text-brand-300 hover:file:bg-brand-100 cursor-pointer"
              />
            </div>

            {/* Paste Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Or Paste CSV Content:
              </label>
              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => handleParseCsv(e.target.value)}
                placeholder={"Topic,Classes\nNumber Series,8\nSimplification & Approximation,12\nPercentage,15"}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Preview Section */}
            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Preview ({csvPreview.filter(p => p.found).length} matched / {csvPreview.length} total rows):
                </p>
                <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs border rounded-xl border-slate-200 dark:border-slate-800">
                  {csvPreview.map((item, i) => (
                    <div key={i} className="p-2 flex items-center justify-between text-xs">
                      <span className={item.found ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-400 line-through'}>
                        {item.name}
                      </span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {item.classes} classes {item.found ? '✓' : '(Not found)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCsv}
                disabled={csvPreview.filter(p => p.found).length === 0}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/20"
              >
                Apply Course Counts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

