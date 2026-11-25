import React, { useState, useEffect } from 'react';
import { 
  BookMarked, 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  Edit3, 
  Tag, 
  FileText,
  Calculator,
  Brain,
  BookOpen
} from 'lucide-react';
import { PREDEFINED_SYLLABUS, SUBJECTS } from '../lib/defaultData';
import { getNotes, saveNote, deleteNote } from '../lib/storage';
import { NoteItem, SubjectCode } from '../lib/types';

const CATEGORIES = [
  'Quantitative formulas',
  'Reasoning shortcuts',
  'English grammar',
  'Vocabulary',
  'Important questions',
  'Mistakes',
  'General preparation notes'
] as const;

export const NotesFormulaPage: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteItem['category']>('Quantitative formulas');
  const [subjectCode, setSubjectCode] = useState<SubjectCode>('quant');
  const [tagInput, setTagInput] = useState('');
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const handleOpenNew = () => {
    setEditingId(undefined);
    setTitle('');
    setContent('');
    setCategory('Quantitative formulas');
    setSubjectCode('quant');
    setTagInput('');
    setIsFavourite(false);
    setIsModalOpen(true);
  };

  const handleEdit = (n: NoteItem) => {
    setEditingId(n.id);
    setTitle(n.title);
    setContent(n.content);
    setCategory(n.category);
    setSubjectCode(n.subjectCode || 'quant');
    setTagInput(n.tags.join(', '));
    setIsFavourite(n.isFavourite);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    saveNote({
      title: title.trim(),
      content: content.trim(),
      category,
      subjectCode,
      tags,
      isFavourite
    }, editingId);

    setNotes(getNotes());
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this formula/note?')) {
      deleteNote(id);
      setNotes(getNotes());
    }
  };

  const handleToggleFav = (n: NoteItem) => {
    saveNote({
      ...n,
      isFavourite: !n.isFavourite
    }, n.id);
    setNotes(getNotes());
  };

  // Filtered Notes
  const filteredNotes = notes.filter(n => {
    if (onlyFavourites && !n.isFavourite) return false;
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inTitle = n.title.toLowerCase().includes(q);
      const inContent = n.content.toLowerCase().includes(q);
      const inTags = n.tags.some(t => t.toLowerCase().includes(q));
      if (!inTitle && !inContent && !inTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-brand-600" />
            Notes & Formula Pocketbook
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quick-reference formulas, reasoning shortcuts, English grammar rules and vocabulary cards.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Note / Formula
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Categories ({notes.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = notes.filter(n => n.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Bar & Favourites Toggle */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search in notes, formulas, or tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            onClick={() => setOnlyFavourites(!onlyFavourites)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              onlyFavourites
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavourites ? 'fill-amber-400 text-amber-500' : ''}`} />
            Starred Only
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 space-y-2">
            <BookMarked className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No notes found</p>
            <p>Click "Create Note / Formula" to store essential shortcuts and grammar notes.</p>
          </div>
        ) : (
          filteredNotes.map(n => {
            const sub = SUBJECTS.find(s => s.code === n.subjectCode);
            return (
              <div
                key={n.id}
                className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {n.category}
                    </span>

                    <button
                      onClick={() => handleToggleFav(n)}
                      className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                      title="Star this note"
                    >
                      <Star className={`w-4 h-4 ${n.isFavourite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {n.title}
                  </h3>

                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans bg-slate-50/60 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 line-clamp-6">
                    {n.content}
                  </div>

                  {n.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-2.5">
                      {n.tags.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.2 rounded-md bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[10px]">{new Date(n.updatedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(n)}
                      className="p-1 rounded text-slate-400 hover:text-brand-600"
                      title="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-brand-600" />
              {editingId ? 'Edit Note / Formula' : 'Create New Note / Formula'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Title / Heading:
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Successive Percentage Change Shortcut Formula"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category:
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject:
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Formula & Note Content:
              </label>
              <textarea
                rows={6}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={"Write formula, logic or grammar rules here...\nExample: Effective Rate = a + b + (a*b)/100"}
                className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma separated):
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="percentage, ci, shortcut, speed"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="favCheck"
                checked={isFavourite}
                onChange={e => setIsFavourite(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
              <label htmlFor="favCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Mark as Starred / Priority Formula
              </label>
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
                Save Formula Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

