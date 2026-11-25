import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Settings2,
  Calendar,
  Target,
  Repeat,
  FileText,
  BookMarked,
  BarChart3,
  Flame,
  Settings,
  Menu,
  X,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { getTodayGoal } from '../../lib/storage';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'My Syllabus', path: '/syllabus', icon: BookOpen },
  { label: 'Video Lectures', path: '/videos', icon: Video },
  { label: 'Bulk Course Setup', path: '/bulk-setup', icon: Settings2, badge: 'Crucial' },
  { label: 'Study Planner', path: '/planner', icon: Calendar },
  { label: 'Practice Tracker', path: '/practice', icon: Target },
  { label: 'Revision Center', path: '/revisions', icon: Repeat },
  { label: 'Mock Tests', path: '/mock-tests', icon: FileText },
  { label: 'Notes & Formula Book', path: '/notes', icon: BookMarked },
  { label: 'Performance Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Daily Goals', path: '/daily-goals', icon: Flame },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const todayGoal = getTodayGoal();

  // Calculate quick goal percentage
  const goalTarget = (todayGoal.targetHours || 6) + (todayGoal.targetVideos || 3) + (todayGoal.targetQuestions || 50);
  const goalDone = (todayGoal.completedHours || 0) + (todayGoal.completedVideos || 0) + (todayGoal.completedQuestions || 0);
  const goalPercent = Math.min(100, Math.round((goalDone / Math.max(1, goalTarget)) * 100));

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800
        flex flex-col transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 dark:text-white">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-brand-600 to-indigo-400 bg-clip-text text-transparent font-black tracking-tight">
                BankPrep
              </span>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium tracking-wider uppercase leading-none">
                Exam Tracker
              </p>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tagline Badge */}
        <div className="px-4 py-2.5 bg-brand-50/70 dark:bg-brand-950/30 border-b border-brand-100/60 dark:border-brand-900/30">
          <p className="text-[11px] font-medium text-brand-700 dark:text-brand-300 text-center">
            Plan Smart. Practice Hard. Get Selected.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all
                  ${isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 dark:bg-brand-600 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'}
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                    }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </Link>
            );
          })}
        </div>

        {/* Bottom User / Quick Target Card */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a233a] border border-slate-200/70 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Today's Goals</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{goalPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 dark:bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>{user?.targetExam || 'Banking Exam'}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Day 1 / 120</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'BankPrep Portal'}
              </h1>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Target: {user?.targetExam || 'SBI PO / IBPS PO'} {user?.targetYear || 2026}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Streak Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 text-xs font-semibold">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>3 Days Streak</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Avatar Pill */}
            <Link to="/settings" className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <span className="text-xs font-medium hidden md:inline text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                {user?.fullName || 'Aspirant'}
              </span>
            </Link>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

