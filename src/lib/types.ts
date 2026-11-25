export type SubjectCode = 'quant' | 'reasoning' | 'english';

export type TopicStatus = 'Not Started' | 'Learning' | 'Practicing' | 'Revision Required' | 'Completed';

export interface Subject {
  id: string;
  name: string;
  code: SubjectCode;
  color: string;
  bgLight: string;
  bgDark: string;
  border: string;
  icon: string;
  description: string;
}

export interface SyllabusTopic {
  id: string;
  subjectCode: SubjectCode;
  name: string;
  orderIndex: number;
  defaultTargetQuestions: number;
}

export interface UserTopicState {
  topicId: string;
  status: TopicStatus;
  confidenceLevel: number; // 1 to 5
  targetQuestions: number;
  learningStartDate?: string;
  completedDate?: string;
  weakConcepts?: string;
  mistakesToAvoid?: string;
  personalNotes?: string;
  timeSpentMinutes: number;
  updatedAt: string;
}

export interface TopicCourseConfig {
  topicId: string;
  totalClasses: number;
  courseName?: string;
  externalCourseUrl?: string;
  notes?: string;
  updatedAt: string;
}

export interface VideoClassItem {
  id: string;
  topicId: string;
  classNumber: number;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  externalVideoUrl?: string;
}

export interface PracticeRecord {
  id: string;
  topicId: string;
  practiceDate: string;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  timeSpentMinutes: number;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  source: 'Book' | 'Website' | 'Mock' | 'Other';
  notes?: string;
  createdAt: string;
}

export interface RevisionRecord {
  id: string;
  topicId: string;
  revisionNumber: number; // 1, 2, 3, 4, 5
  scheduledDate: string;
  completedDate?: string;
  isCompleted: boolean;
  durationMinutes: number;
  questionsSolved: number;
  confidenceLevel: number; // 1 to 5
  notes?: string;
  createdAt: string;
}

export type TaskType = 'Watch Video' | 'Practice Questions' | 'Revision' | 'Mock Test' | 'Vocabulary' | 'Formula Revision';

export interface StudyTask {
  id: string;
  taskDate: string;
  subjectCode: SubjectCode;
  topicId?: string;
  taskType: TaskType;
  title: string;
  targetDurationMinutes: number;
  priority: 'High' | 'Medium' | 'Low';
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'Quantitative formulas' | 'Reasoning shortcuts' | 'English grammar' | 'Vocabulary' | 'Important questions' | 'Mistakes' | 'General preparation notes';
  subjectCode?: SubjectCode;
  topicId?: string;
  tags: string[];
  isFavourite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockTestRecord {
  id: string;
  testName: string;
  provider: string; // e.g. Testbook, Oliveboard, PracticeMock, Guidely, Adda247
  testDate: string;
  testType: 'Full Length' | 'Sectional';
  totalMarks: number;
  marksObtained: number;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  timeTakenMinutes: number;
  quantScore: number;
  reasoningScore: number;
  englishScore: number;
  notes?: string;
  createdAt: string;
}

export interface DailyGoal {
  goalDate: string;
  targetHours: number;
  targetVideos: number;
  targetQuestions: number;
  targetRevisions: number;
  targetVocab: number;
  completedHours: number;
  completedVideos: number;
  completedQuestions: number;
  completedRevisions: number;
  completedVocab: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  targetExam: string;
  targetYear: number;
  preparationStartDate: string;
  examDate?: string;
  durationDays: number;
  dailyStudyHoursTarget: number;
  dailyQuestionsTarget: number;
  dailyVideosTarget: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  weeklyStructure: {
    [day: string]: string; // Monday to Sunday custom descriptions
  };
}

