-- ============================================================================
-- BankPrep - Complete Supabase PostgreSQL Database Schema
-- Multi-user ready with Row Level Security (RLS) and full relational integrity
-- ============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Aspirant',
    target_exam TEXT NOT NULL DEFAULT 'SBI PO & IBPS PO',
    target_year INTEGER NOT NULL DEFAULT 2026,
    preparation_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    exam_date DATE,
    duration_days INTEGER NOT NULL DEFAULT 120,
    daily_study_hours_target NUMERIC(4,2) NOT NULL DEFAULT 6.00,
    daily_questions_target INTEGER NOT NULL DEFAULT 50,
    daily_videos_target INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    order_index INTEGER NOT NULL
);

-- 3. TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_code TEXT REFERENCES public.subjects(code) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    default_target_questions INTEGER NOT NULL DEFAULT 200,
    CONSTRAINT uk_subject_topic_name UNIQUE (subject_code, name)
);

-- 4. USER TOPIC STATUS & CONFIDENCE
CREATE TABLE IF NOT EXISTS public.user_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Not Started', -- 'Not Started', 'Learning', 'Practicing', 'Revision Required', 'Completed'
    confidence_level INTEGER NOT NULL DEFAULT 1 CHECK (confidence_level BETWEEN 1 AND 5),
    target_questions INTEGER NOT NULL DEFAULT 200,
    learning_start_date DATE,
    completed_date DATE,
    weak_concepts TEXT,
    mistakes_to_avoid TEXT,
    personal_notes TEXT,
    time_spent_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uk_user_topic UNIQUE (user_id, topic_id)
);

-- 5. COURSE CONFIGURATIONS (From Bulk Course Setup)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    total_classes INTEGER NOT NULL DEFAULT 0 CHECK (total_classes >= 0),
    course_name TEXT,
    external_course_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uk_user_topic_course UNIQUE (user_id, topic_id)
);

-- 6. VIDEO CLASSES (Automatically numbered 1..N)
CREATE TABLE IF NOT EXISTS public.video_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    class_number INTEGER NOT NULL CHECK (class_number > 0),
    title TEXT NOT NULL DEFAULT '',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    external_video_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uk_user_topic_class UNIQUE (user_id, topic_id, class_number)
);

-- 7. PRACTICE RECORDS
CREATE TABLE IF NOT EXISTS public.practice_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    practice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    attempted_questions INTEGER NOT NULL CHECK (attempted_questions >= 0),
    correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
    incorrect_answers INTEGER NOT NULL DEFAULT 0 CHECK (incorrect_answers >= 0),
    skipped_questions INTEGER NOT NULL DEFAULT 0 CHECK (skipped_questions >= 0),
    time_spent_minutes INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_minutes >= 0),
    difficulty_level TEXT NOT NULL DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
    source TEXT NOT NULL DEFAULT 'Book', -- 'Book', 'Website', 'Mock', 'Other'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. REVISION RECORDS
CREATE TABLE IF NOT EXISTS public.revision_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL CHECK (revision_number >= 1),
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    questions_solved INTEGER NOT NULL DEFAULT 0,
    confidence_level INTEGER NOT NULL DEFAULT 3 CHECK (confidence_level BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. STUDY TASKS (Calendar & Planner)
CREATE TABLE IF NOT EXISTS public.study_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subject_code TEXT REFERENCES public.subjects(code) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    task_type TEXT NOT NULL, -- 'Watch Video', 'Practice Questions', 'Revision', 'Mock Test', 'Vocabulary', 'Formula Revision'
    title TEXT NOT NULL,
    target_duration_minutes INTEGER NOT NULL DEFAULT 45,
    priority TEXT NOT NULL DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. NOTES & FORMULA BOOK
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Quantitative formulas', 'Reasoning shortcuts', 'English grammar', 'Vocabulary', 'Important questions', 'Mistakes', 'General preparation notes'
    subject_code TEXT REFERENCES public.subjects(code) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_favourite BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. MOCK TESTS
CREATE TABLE IF NOT EXISTS public.mock_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    provider TEXT NOT NULL,
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    test_type TEXT NOT NULL DEFAULT 'Full Length', -- 'Full Length', 'Sectional'
    total_marks NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    marks_obtained NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    total_questions INTEGER NOT NULL DEFAULT 100,
    attempted_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    incorrect_answers INTEGER NOT NULL DEFAULT 0,
    skipped_questions INTEGER NOT NULL DEFAULT 0,
    time_taken_minutes INTEGER NOT NULL DEFAULT 60,
    quant_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    reasoning_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    english_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. DAILY GOALS
CREATE TABLE IF NOT EXISTS public.daily_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_hours NUMERIC(4,2) NOT NULL DEFAULT 6.00,
    target_videos INTEGER NOT NULL DEFAULT 3,
    target_questions INTEGER NOT NULL DEFAULT 50,
    target_revisions INTEGER NOT NULL DEFAULT 2,
    target_vocab INTEGER NOT NULL DEFAULT 10,
    completed_hours NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    completed_videos INTEGER NOT NULL DEFAULT 0,
    completed_questions INTEGER NOT NULL DEFAULT 0,
    completed_revisions INTEGER NOT NULL DEFAULT 0,
    completed_vocab INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uk_user_daily_goal UNIQUE (user_id, goal_date)
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

-- POLICIES (Users manage only their own records)
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own user_topics" ON public.user_topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own courses" ON public.courses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own video_classes" ON public.video_classes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own practice_records" ON public.practice_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own revision_records" ON public.revision_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own study_tasks" ON public.study_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notes" ON public.notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mock_tests" ON public.mock_tests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily_goals" ON public.daily_goals FOR ALL USING (auth.uid() = user_id);

