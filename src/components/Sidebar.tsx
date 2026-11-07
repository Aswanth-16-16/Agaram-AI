import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquareText,
  CheckSquare,
  Users,
  Trophy,
  Brain,
  RotateCcw,
  AlertCircle,
  FileText,
  User,
  Volume2,
  VolumeX,
  Flame,
  LogOut,
} from 'lucide-react';
import { StudentProfile } from '../types.ts';

export type NavTab =
  | 'dashboard'
  | 'syllabus'
  | 'tutor'
  | 'assessments'
  | 'groups'
  | 'achievements'
  | 'mastery'
  | 'revision'
  | 'weaknesses'
  | 'documents'
  | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeProfile: StudentProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSwitchProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeProfile,
  soundEnabled,
  onToggleSound,
  onSwitchProfile,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquareText },
    { id: 'assessments', label: 'Assessments & Exams', icon: CheckSquare },
    { id: 'groups', label: 'Study Groups', icon: Users },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'mastery', label: 'Knowledge Mastery', icon: Brain },
    { id: 'revision', label: 'Revision', icon: RotateCcw },
    { id: 'weaknesses', label: 'Hidden Weaknesses', icon: AlertCircle },
    { id: 'documents', label: 'Document Notes', icon: FileText },
    { id: 'profile', label: 'Student Profile', icon: User },
  ];

  return (
    <aside className="w-16 md:w-20 bg-[#0D1117] border-r border-[#1B2230] flex flex-col items-center py-4 justify-between select-none z-20 shrink-0">
      {/* Brand logo top */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => onTabChange('dashboard')}
          className="group relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#141A24] border border-[#232B3C] hover:border-[#FF681F]/50 transition-all cursor-pointer"
          title="AGARAM Learning Platform"
        >
          <span className="font-brand font-bold text-xl tracking-tight text-white">
            a<span className="text-[#FF681F]">AI</span>
          </span>
        </button>

        {/* Navigation list */}
        <nav className="flex flex-col items-center gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF681F]/15 text-[#FF681F]'
                    : 'text-[#8A94A6] hover:text-white hover:bg-[#161D29]'
                }`}
                title={item.label}
                aria-label={item.label}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute -left-2 top-2 bottom-2 w-1 bg-[#FF681F] rounded-r" />
                )}
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                {/* Tooltip on hover */}
                <span className="pointer-events-none absolute left-16 px-2.5 py-1 rounded bg-[#161D29] text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-[#232B3C] z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom utility controls */}
      <div className="flex flex-col items-center gap-3 pt-3 border-t border-[#1B2230]/80 w-full">
        {/* Audio speaker toggle */}
        <button
          onClick={onToggleSound}
          className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-[#FF681F]/10 border-[#FF681F]/40 text-[#FF681F]'
              : 'bg-[#141A24] border-[#202736] text-[#717B8C] hover:text-white'
          }`}
          title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Study streak */}
        <div
          className="flex items-center justify-center gap-1 px-1.5 py-1 rounded-md bg-[#141A24] border border-[#202736] text-xs font-semibold text-[#FF9248]"
          title={`Study Streak: ${activeProfile.analytics.studyStreak} days`}
        >
          <Flame className="w-3.5 h-3.5 text-[#FF681F] animate-pulse" />
          <span>{activeProfile.analytics.studyStreak}d</span>
        </div>

        {/* Level badge */}
        <div
          className="flex items-center justify-center w-8 h-6 rounded bg-[#1A2230] border border-[#252F42] text-[10px] font-bold text-[#A4B1CD]"
          title="Student Mastery Tier"
        >
          {activeProfile.analytics.assessmentsTaken > 0 ? 'L2' : 'L1'}
        </div>

        {/* Profile Avatar / Switcher */}
        <button
          onClick={onSwitchProfile}
          className="group relative flex items-center justify-center w-10 h-10 rounded-full ring-2 ring-[#FF681F]/40 hover:ring-[#FF681F] transition-all overflow-hidden cursor-pointer bg-gradient-to-tr from-orange-500 to-amber-600"
          title={`Active Profile: ${activeProfile.name} (Click to switch)`}
          aria-label="Switch Student Profile"
        >
          <span className="font-bold text-sm text-white">
            {activeProfile.name.charAt(0).toUpperCase()}
          </span>
          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <LogOut className="w-4 h-4 text-white" />
          </span>
        </button>
      </div>
    </aside>
  );
};
