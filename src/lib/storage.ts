import { 
  UserProfile, 
  UserTopicState, 
  TopicCourseConfig, 
  VideoClassItem, 
  PracticeRecord, 
  RevisionRecord, 
  StudyTask, 
  NoteItem, 
  MockTestRecord, 
  DailyGoal, 
  AppSettings,
  TopicStatus,
  SyllabusTopic,
  SubjectCode
} from './types';
import { PREDEFINED_SYLLABUS } from './defaultData';

const STORAGE_KEYS = {
  PROFILE: 'bankprep_profile',
  USER_TOPICS: 'bankprep_user_topics',
  CUSTOM_TOPICS: 'bankprep_custom_topics',
  COURSES: 'bankprep_courses',
  VIDEO_CLASSES: 'bankprep_video_classes',
  PRACTICE: 'bankprep_practice_records',
  REVISIONS: 'bankprep_revisions',
  TASKS: 'bankprep_study_tasks',
  NOTES: 'bankprep_notes',
  MOCK_TESTS: 'bankprep_mock_tests',
  DAILY_GOALS: 'bankprep_daily_goals',
  SETTINGS: 'bankprep_settings',
};

// Default profile
export const DEFAULT_PROFILE: UserProfile = {
  id: 'usr-default-01',
  email: 'aspirant@bankprep.internal',
  fullName: 'Banking Aspirant',
  targetExam: 'SBI PO & IBPS PO',
  targetYear: 2026,
  preparationStartDate: new Date().toISOString().split('T')[0],
  durationDays: 120,
  dailyStudyHoursTarget: 6,
  dailyQuestionsTarget: 50,
  dailyVideosTarget: 3,
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  weeklyStructure: {
    'Monday': 'Concept Video Lectures + Basic Practice',
    'Tuesday': 'Concept Video Lectures + Intermediate Practice',
    'Wednesday': 'High-Yield Arithmetic & Puzzles Drilling',
    'Thursday': 'English Reading & Grammar Rules Mastery',
    'Friday': 'Speed Drills & Time-Bound Practice',
    'Saturday': 'Backlog Clearance & Mixed Topic Practice',
    'Sunday': 'Full-Length / Sectional Mock Test & In-Depth Analysis'
  }
};

// Helper to safely get from localStorage
function getLocal<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Helper to safely set in localStorage
function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Custom topics management
export function getCustomTopics(): SyllabusTopic[] {
  return getLocal<SyllabusTopic[]>(STORAGE_KEYS.CUSTOM_TOPICS, []);
}

export function getAllSyllabusTopics(): SyllabusTopic[] {
  const custom = getCustomTopics();
  return [...PREDEFINED_SYLLABUS, ...custom];
}

export function getTopicById(topicId: string): SyllabusTopic | undefined {
  return getAllSyllabusTopics().find(t => t.id === topicId);
}

export function addCustomTopic(params: {
  name: string;
  subjectCode: SubjectCode;
  totalClasses?: number;
  defaultTargetQuestions?: number;
  courseName?: string;
  externalCourseUrl?: string;
  notes?: string;
}): SyllabusTopic {
  const custom = getCustomTopics();
  const all = getAllSyllabusTopics();

  const id = `cust-${params.subjectCode}-${Date.now()}`;
  const orderIndex = all.filter(t => t.subjectCode === params.subjectCode).length + 1;

  const newTopic: SyllabusTopic = {
    id,
    subjectCode: params.subjectCode,
    name: params.name.trim(),
    orderIndex,
    defaultTargetQuestions: Math.max(10, params.defaultTargetQuestions || 150),
    isCustom: true
  };

  custom.push(newTopic);
  setLocal(STORAGE_KEYS.CUSTOM_TOPICS, custom);

  // Initialize topic user state
  const allStates = getInitialUserTopics();
  allStates[id] = {
    topicId: id,
    status: 'Not Started',
    confidenceLevel: 1,
    targetQuestions: newTopic.defaultTargetQuestions,
    timeSpentMinutes: 0,
    updatedAt: new Date().toISOString()
  };
  setLocal(STORAGE_KEYS.USER_TOPICS, allStates);

  // Auto-generate video classes if configured
  const totalClasses = Math.max(0, params.totalClasses || 0);
  saveTopicCourseConfig(
    id,
    totalClasses,
    params.courseName || '',
    params.externalCourseUrl || '',
    params.notes || ''
  );

  return newTopic;
}

export function deleteCustomTopic(topicId: string): boolean {
  let custom = getCustomTopics();
  const exists = custom.some(t => t.id === topicId);
  if (!exists) return false;

  custom = custom.filter(t => t.id !== topicId);
  setLocal(STORAGE_KEYS.CUSTOM_TOPICS, custom);

  // Remove associated courses
  const allCourses = getAllCourses();
  delete allCourses[topicId];
  setLocal(STORAGE_KEYS.COURSES, allCourses);

  // Remove video classes
  const allVideoClasses = getAllVideoClasses();
  delete allVideoClasses[topicId];
  setLocal(STORAGE_KEYS.VIDEO_CLASSES, allVideoClasses);

  // Remove topic state
  const allStates = getInitialUserTopics();
  delete allStates[topicId];
  setLocal(STORAGE_KEYS.USER_TOPICS, allStates);

  return true;
}

// Initialize topics state
export function getInitialUserTopics(): Record<string, UserTopicState> {
  const saved = getLocal<Record<string, UserTopicState>>(STORAGE_KEYS.USER_TOPICS, {});
  let hasNew = false;
  const current: Record<string, UserTopicState> = { ...saved };

  getAllSyllabusTopics().forEach(topic => {
    if (!current[topic.id]) {
      hasNew = true;
      current[topic.id] = {
        topicId: topic.id,
        status: 'Not Started',
        confidenceLevel: 1,
        targetQuestions: topic.defaultTargetQuestions,
        timeSpentMinutes: 0,
        updatedAt: new Date().toISOString()
      };
    }
  });

  if (hasNew) {
    setLocal(STORAGE_KEYS.USER_TOPICS, current);
  }
  return current;
}

export function saveUserTopicState(topicId: string, updates: Partial<UserTopicState>): UserTopicState {
  const all = getInitialUserTopics();
  const existing = all[topicId] || {
    topicId,
    status: 'Not Started',
    confidenceLevel: 1,
    targetQuestions: 200,
    timeSpentMinutes: 0,
    updatedAt: new Date().toISOString()
  };

  const updated: UserTopicState = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  all[topicId] = updated;
  setLocal(STORAGE_KEYS.USER_TOPICS, all);
  return updated;
}

// Courses and Video Classes Setup
export function getAllCourses(): Record<string, TopicCourseConfig> {
  return getLocal<Record<string, TopicCourseConfig>>(STORAGE_KEYS.COURSES, {});
}

export function getAllVideoClasses(): Record<string, VideoClassItem[]> {
  return getLocal<Record<string, VideoClassItem[]>>(STORAGE_KEYS.VIDEO_CLASSES, {});
}

/**
 * Saves a course configuration and automatically generates or adjusts 
 * the numbered video class list (Class 1 .. Class N) while PRESERVING completion status!
 */
export function saveTopicCourseConfig(
  topicId: string, 
  totalClasses: number, 
  courseName?: string, 
  externalCourseUrl?: string, 
  notes?: string
): { config: TopicCourseConfig; classes: VideoClassItem[] } {
  const allCourses = getAllCourses();
  const allVideoClasses = getAllVideoClasses();

  const config: TopicCourseConfig = {
    topicId,
    totalClasses: Math.max(0, totalClasses),
    courseName: courseName || '',
    externalCourseUrl: externalCourseUrl || '',
    notes: notes || '',
    updatedAt: new Date().toISOString()
  };
  allCourses[topicId] = config;
  setLocal(STORAGE_KEYS.COURSES, allCourses);

  // Preserve existing classes, create new ones if needed
  const existingClasses = allVideoClasses[topicId] || [];
  const existingMap = new Map<number, VideoClassItem>();
  existingClasses.forEach(c => existingMap.set(c.classNumber, c));

  const newClasses: VideoClassItem[] = [];
  for (let i = 1; i <= config.totalClasses; i++) {
    if (existingMap.has(i)) {
      newClasses.push(existingMap.get(i)!);
    } else {
      newClasses.push({
        id: `vc-${topicId}-${i}-${Date.now()}`,
        topicId,
        classNumber: i,
        title: `Class ${i}`,
        isCompleted: false
      });
    }
  }

  allVideoClasses[topicId] = newClasses;
  setLocal(STORAGE_KEYS.VIDEO_CLASSES, allVideoClasses);

  return { config, classes: newClasses };
}

export function toggleVideoClass(topicId: string, classNumber: number): VideoClassItem | null {
  const allVideoClasses = getAllVideoClasses();
  const classes = allVideoClasses[topicId] || [];
  const target = classes.find(c => c.classNumber === classNumber);
  if (!target) return null;

  target.isCompleted = !target.isCompleted;
  target.completedAt = target.isCompleted ? new Date().toISOString() : undefined;

  setLocal(STORAGE_KEYS.VIDEO_CLASSES, allVideoClasses);

  // If completing, update today's daily goal video count
  if (target.isCompleted) {
    incrementTodayGoal('completedVideos', 1);
  }

  return target;
}

export function updateVideoClassMeta(
  topicId: string, 
  classNumber: number, 
  updates: { title?: string; notes?: string; externalVideoUrl?: string }
): VideoClassItem | null {
  const allVideoClasses = getAllVideoClasses();
  const classes = allVideoClasses[topicId] || [];
  const target = classes.find(c => c.classNumber === classNumber);
  if (!target) return null;

  if (updates.title !== undefined) target.title = updates.title;
  if (updates.notes !== undefined) target.notes = updates.notes;
  if (updates.externalVideoUrl !== undefined) target.externalVideoUrl = updates.externalVideoUrl;

  setLocal(STORAGE_KEYS.VIDEO_CLASSES, allVideoClasses);
  return target;
}

// Practice Records
export function getPracticeRecords(): PracticeRecord[] {
  return getLocal<PracticeRecord[]>(STORAGE_KEYS.PRACTICE, []);
}

export function addPracticeRecord(record: Omit<PracticeRecord, 'id' | 'createdAt'>): PracticeRecord {
  const records = getPracticeRecords();
  const newRecord: PracticeRecord = {
    ...record,
    id: `prac-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString()
  };
  records.unshift(newRecord);
  setLocal(STORAGE_KEYS.PRACTICE, records);

  // Update topic time spent and today's daily goal
  const topics = getInitialUserTopics();
  if (topics[record.topicId]) {
    topics[record.topicId].timeSpentMinutes += (record.timeSpentMinutes || 0);
    setLocal(STORAGE_KEYS.USER_TOPICS, topics);
  }

  incrementTodayGoal('completedQuestions', record.attemptedQuestions);
  incrementTodayGoal('completedHours', (record.timeSpentMinutes || 0) / 60);

  return newRecord;
}

export function deletePracticeRecord(id: string): void {
  const records = getPracticeRecords().filter(r => r.id !== id);
  setLocal(STORAGE_KEYS.PRACTICE, records);
}

// Revision Records (Spaced Repetition)
export function getRevisionRecords(): RevisionRecord[] {
  return getLocal<RevisionRecord[]>(STORAGE_KEYS.REVISIONS, []);
}

export function scheduleStandardRevisions(topicId: string, baseDateStr?: string): RevisionRecord[] {
  const base = baseDateStr ? new Date(baseDateStr) : new Date();
  const intervals = [1, 3, 7, 15, 30]; // 1 day, 3 days, 7 days, 15 days, 30 days
  const existing = getRevisionRecords();

  const newRevisions: RevisionRecord[] = intervals.map((days, idx) => {
    const scheduled = new Date(base);
    scheduled.setDate(scheduled.getDate() + days);

    return {
      id: `rev-${topicId}-${idx + 1}-${Date.now()}`,
      topicId,
      revisionNumber: idx + 1,
      scheduledDate: scheduled.toISOString().split('T')[0],
      isCompleted: false,
      durationMinutes: 30,
      questionsSolved: 0,
      confidenceLevel: 3,
      createdAt: new Date().toISOString()
    };
  });

  const updated = [...newRevisions, ...existing];
  setLocal(STORAGE_KEYS.REVISIONS, updated);
  return newRevisions;
}

export function completeRevision(
  revisionId: string, 
  data: { durationMinutes: number; questionsSolved: number; confidenceLevel: number; notes?: string }
): void {
  const revisions = getRevisionRecords();
  const rev = revisions.find(r => r.id === revisionId);
  if (rev) {
    rev.isCompleted = true;
    rev.completedDate = new Date().toISOString().split('T')[0];
    rev.durationMinutes = data.durationMinutes;
    rev.questionsSolved = data.questionsSolved;
    rev.confidenceLevel = data.confidenceLevel;
    if (data.notes) rev.notes = data.notes;
    setLocal(STORAGE_KEYS.REVISIONS, revisions);

    incrementTodayGoal('completedRevisions', 1);
    incrementTodayGoal('completedHours', (data.durationMinutes || 0) / 60);
    if (data.questionsSolved) {
      incrementTodayGoal('completedQuestions', data.questionsSolved);
    }
  }
}

// Study Tasks (Study Planner)
export function getStudyTasks(): StudyTask[] {
  return getLocal<StudyTask[]>(STORAGE_KEYS.TASKS, []);
}

export function addStudyTask(task: Omit<StudyTask, 'id' | 'createdAt'>): StudyTask {
  const tasks = getStudyTasks();
  const newTask: StudyTask = {
    ...task,
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(newTask);
  setLocal(STORAGE_KEYS.TASKS, tasks);
  return newTask;
}

export function toggleStudyTask(id: string): void {
  const tasks = getStudyTasks();
  const t = tasks.find(x => x.id === id);
  if (t) {
    t.isCompleted = !t.isCompleted;
    t.completedAt = t.isCompleted ? new Date().toISOString() : undefined;
    setLocal(STORAGE_KEYS.TASKS, tasks);
  }
}

export function deleteStudyTask(id: string): void {
  const tasks = getStudyTasks().filter(x => x.id !== id);
  setLocal(STORAGE_KEYS.TASKS, tasks);
}

// Notes & Formula Book
export function getNotes(): NoteItem[] {
  return getLocal<NoteItem[]>(STORAGE_KEYS.NOTES, []);
}

export function saveNote(note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>, id?: string): NoteItem {
  const notes = getNotes();
  const now = new Date().toISOString();

  if (id) {
    const idx = notes.findIndex(n => n.id === id);
    if (idx !== -1) {
      notes[idx] = { ...notes[idx], ...note, updatedAt: now };
      setLocal(STORAGE_KEYS.NOTES, notes);
      return notes[idx];
    }
  }

  const newNote: NoteItem = {
    ...note,
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: now,
    updatedAt: now
  };
  notes.unshift(newNote);
  setLocal(STORAGE_KEYS.NOTES, notes);
  return newNote;
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter(n => n.id !== id);
  setLocal(STORAGE_KEYS.NOTES, notes);
}

// Mock Tests
export function getMockTests(): MockTestRecord[] {
  return getLocal<MockTestRecord[]>(STORAGE_KEYS.MOCK_TESTS, []);
}

export function addMockTest(record: Omit<MockTestRecord, 'id' | 'createdAt'>): MockTestRecord {
  const tests = getMockTests();
  const newTest: MockTestRecord = {
    ...record,
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString()
  };
  tests.unshift(newTest);
  setLocal(STORAGE_KEYS.MOCK_TESTS, tests);

  incrementTodayGoal('completedHours', (record.timeTakenMinutes || 60) / 60);
  return newTest;
}

export function deleteMockTest(id: string): void {
  const tests = getMockTests().filter(t => t.id !== id);
  setLocal(STORAGE_KEYS.MOCK_TESTS, tests);
}

// Daily Goals
export function getTodayGoal(dateStr?: string): DailyGoal {
  const today = dateStr || new Date().toISOString().split('T')[0];
  const all = getLocal<Record<string, DailyGoal>>(STORAGE_KEYS.DAILY_GOALS, {});
  const profile = getLocal<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);

  if (!all[today]) {
    all[today] = {
      goalDate: today,
      targetHours: profile.dailyStudyHoursTarget || 6,
      targetVideos: profile.dailyVideosTarget || 3,
      targetQuestions: profile.dailyQuestionsTarget || 50,
      targetRevisions: 2,
      targetVocab: 10,
      completedHours: 0,
      completedVideos: 0,
      completedQuestions: 0,
      completedRevisions: 0,
      completedVocab: 0
    };
    setLocal(STORAGE_KEYS.DAILY_GOALS, all);
  }

  return all[today];
}

export function updateTodayGoal(updates: Partial<DailyGoal>, dateStr?: string): DailyGoal {
  const today = dateStr || new Date().toISOString().split('T')[0];
  const all = getLocal<Record<string, DailyGoal>>(STORAGE_KEYS.DAILY_GOALS, {});
  const current = getTodayGoal(today);

  all[today] = { ...current, ...updates };
  setLocal(STORAGE_KEYS.DAILY_GOALS, all);
  return all[today];
}

function incrementTodayGoal(field: keyof DailyGoal, amount: number) {
  const goal = getTodayGoal();
  const currentVal = (goal[field] as number) || 0;
  updateTodayGoal({ [field]: Number((currentVal + amount).toFixed(2)) });
}

// Profile & Settings
export function getUserProfile(): UserProfile {
  return getLocal<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
}

export function saveUserProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getUserProfile();
  const updated = { ...current, ...profile };
  setLocal(STORAGE_KEYS.PROFILE, updated);
  return updated;
}

export function getAppSettings(): AppSettings {
  return getLocal<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveAppSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const updated = { ...current, ...settings };
  setLocal(STORAGE_KEYS.SETTINGS, updated);

  // Apply dark mode class to html document
  if (updated.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (updated.theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // system
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return updated;
}

