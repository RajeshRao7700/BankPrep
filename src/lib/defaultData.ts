import { Subject, SyllabusTopic } from './types';

export const SUBJECTS: Subject[] = [
  {
    id: 'sub-quant',
    name: 'Quantitative Aptitude',
    code: 'quant',
    color: '#3b82f6',
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
    bgDark: 'dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    border: 'border-blue-500',
    icon: 'Calculator',
    description: 'High-scoring section covering arithmetic, DI, calculations and numerical ability.'
  },
  {
    id: 'sub-reasoning',
    name: 'Reasoning',
    code: 'reasoning',
    color: '#10b981',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bgDark: 'dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    border: 'border-emerald-500',
    icon: 'Brain',
    description: 'Puzzles, arrangements, logical deductions, input-output and analytical reasoning.'
  },
  {
    id: 'sub-english',
    name: 'English Language',
    code: 'english',
    color: '#f59e0b',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    bgDark: 'dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    border: 'border-amber-500',
    icon: 'BookOpen',
    description: 'Comprehension, grammar rules, vocabulary, cloze tests and sentence rearrangement.'
  }
];

export const PREDEFINED_SYLLABUS: SyllabusTopic[] = [
  // A. Quantitative Aptitude (15 topics)
  { id: 'quant-01', subjectCode: 'quant', name: 'Number Series', orderIndex: 1, defaultTargetQuestions: 200 },
  { id: 'quant-02', subjectCode: 'quant', name: 'Simplification & Approximation', orderIndex: 2, defaultTargetQuestions: 250 },
  { id: 'quant-03', subjectCode: 'quant', name: 'Ratio & Proportion, Partnership', orderIndex: 3, defaultTargetQuestions: 180 },
  { id: 'quant-04', subjectCode: 'quant', name: 'Percentage', orderIndex: 4, defaultTargetQuestions: 200 },
  { id: 'quant-05', subjectCode: 'quant', name: 'Mixture & Allegation', orderIndex: 5, defaultTargetQuestions: 150 },
  { id: 'quant-06', subjectCode: 'quant', name: 'Average & Ages', orderIndex: 6, defaultTargetQuestions: 150 },
  { id: 'quant-07', subjectCode: 'quant', name: 'Profit & Loss', orderIndex: 7, defaultTargetQuestions: 200 },
  { id: 'quant-08', subjectCode: 'quant', name: 'Time and Work & Pipe and Cistern', orderIndex: 8, defaultTargetQuestions: 180 },
  { id: 'quant-09', subjectCode: 'quant', name: 'Simple Interest & Compound Interest', orderIndex: 9, defaultTargetQuestions: 180 },
  { id: 'quant-10', subjectCode: 'quant', name: 'Time & Distance, Boat & Stream', orderIndex: 10, defaultTargetQuestions: 180 },
  { id: 'quant-11', subjectCode: 'quant', name: 'Permutation, Combination & Probability', orderIndex: 11, defaultTargetQuestions: 120 },
  { id: 'quant-12', subjectCode: 'quant', name: 'Mensuration (2D & 3D)', orderIndex: 12, defaultTargetQuestions: 150 },
  { id: 'quant-13', subjectCode: 'quant', name: 'Data Interpretation (Bar, Line, Pie, Mixed, Missing, Arithmetic, Radar)', orderIndex: 13, defaultTargetQuestions: 300 },
  { id: 'quant-14', subjectCode: 'quant', name: 'Coded DI', orderIndex: 14, defaultTargetQuestions: 100 },
  { id: 'quant-15', subjectCode: 'quant', name: 'Quadratic Equations', orderIndex: 15, defaultTargetQuestions: 150 },

  // B. Reasoning (10 topics)
  { id: 'reas-01', subjectCode: 'reasoning', name: 'Puzzles', orderIndex: 1, defaultTargetQuestions: 250 },
  { id: 'reas-02', subjectCode: 'reasoning', name: 'Syllogism', orderIndex: 2, defaultTargetQuestions: 200 },
  { id: 'reas-03', subjectCode: 'reasoning', name: 'Seating Arrangement', orderIndex: 3, defaultTargetQuestions: 250 },
  { id: 'reas-04', subjectCode: 'reasoning', name: 'Input-Output', orderIndex: 4, defaultTargetQuestions: 150 },
  { id: 'reas-05', subjectCode: 'reasoning', name: 'Blood Relation', orderIndex: 5, defaultTargetQuestions: 150 },
  { id: 'reas-06', subjectCode: 'reasoning', name: 'Direction Sense', orderIndex: 6, defaultTargetQuestions: 120 },
  { id: 'reas-07', subjectCode: 'reasoning', name: 'Coding-Decoding', orderIndex: 7, defaultTargetQuestions: 150 },
  { id: 'reas-08', subjectCode: 'reasoning', name: 'Inequalities', orderIndex: 8, defaultTargetQuestions: 150 },
  { id: 'reas-09', subjectCode: 'reasoning', name: 'Data Sufficiency', orderIndex: 9, defaultTargetQuestions: 120 },
  { id: 'reas-10', subjectCode: 'reasoning', name: 'Logical Reasoning', orderIndex: 10, defaultTargetQuestions: 120 },

  // C. English Language (15 topics)
  { id: 'eng-01', subjectCode: 'english', name: 'Reading Comprehension', orderIndex: 1, defaultTargetQuestions: 200 },
  { id: 'eng-02', subjectCode: 'english', name: 'Error Detection', orderIndex: 2, defaultTargetQuestions: 250 },
  { id: 'eng-03', subjectCode: 'english', name: 'Vocabulary', orderIndex: 3, defaultTargetQuestions: 300 },
  { id: 'eng-04', subjectCode: 'english', name: 'Phrase Replacement', orderIndex: 4, defaultTargetQuestions: 150 },
  { id: 'eng-05', subjectCode: 'english', name: 'Sentence Improvement', orderIndex: 5, defaultTargetQuestions: 150 },
  { id: 'eng-06', subjectCode: 'english', name: 'Para Jumbles', orderIndex: 6, defaultTargetQuestions: 150 },
  { id: 'eng-07', subjectCode: 'english', name: 'Cloze Test', orderIndex: 7, defaultTargetQuestions: 150 },
  { id: 'eng-08', subjectCode: 'english', name: 'Spelling Errors', orderIndex: 8, defaultTargetQuestions: 120 },
  { id: 'eng-09', subjectCode: 'english', name: 'Fill in the Blanks', orderIndex: 9, defaultTargetQuestions: 150 },
  { id: 'eng-10', subjectCode: 'english', name: 'Column-Based Fillers', orderIndex: 10, defaultTargetQuestions: 120 },
  { id: 'eng-11', subjectCode: 'english', name: 'Sentence Connectors', orderIndex: 11, defaultTargetQuestions: 120 },
  { id: 'eng-12', subjectCode: 'english', name: 'Word Replacement', orderIndex: 12, defaultTargetQuestions: 120 },
  { id: 'eng-13', subjectCode: 'english', name: 'Word Usage', orderIndex: 13, defaultTargetQuestions: 120 },
  { id: 'eng-14', subjectCode: 'english', name: 'Sentence Rearrangement', orderIndex: 14, defaultTargetQuestions: 120 },
  { id: 'eng-15', subjectCode: 'english', name: 'Sentence Completion', orderIndex: 15, defaultTargetQuestions: 120 },
];

