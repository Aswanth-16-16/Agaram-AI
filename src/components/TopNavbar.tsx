import React, { useState } from 'react';
import {
  Plus,
  History,
  SlidersHorizontal,
  ChevronDown,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { StudentProfile } from '../types.ts';

interface TopNavbarProps {
  title: string;
  subject: string;
  onSubjectChange: (subj: string) => void;
  onNewChat: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  onOpenSettings: () => void;
  activeProfile: StudentProfile;
  onSwitchProfile: () => void;
  onRenameActiveChat?: (newTitle: string) => void;
  canRenameChat?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  title,
  subject,
  onSubjectChange,
  onNewChat,
  onToggleHistory,
  historyCount,
  onOpenSettings,
  activeProfile,
  onSwitchProfile,
  onRenameActiveChat,
  canRenameChat,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);

  const subjects = [
    'Core Foundations',
    'Biology & Bioenergetics',
    'Mathematics & Algebra',
    'Physics & Mechanics',
    'Computer Science',
    'General Studies',
  ];

  const handleSaveTitle = () => {
    if (titleInput.trim() && onRenameActiveChat) {
      onRenameActiveChat(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-16 bg-[#0D1117] border-b border-[#1B2230] px-4 md:px-6 flex items-center justify-between gap-4 select-none shrink-0 z-10">
      {/* Left: Chat Title & Subject Picker */}
      <div className="flex items-center gap-3 min-w-0">
        {isEditingTitle ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="px-2 py-1 rounded bg-[#161D29] border border-[#FF681F] text-white text-xs font-bold focus:outline-none"
            />
            <button
              onClick={handleSaveTitle}
              className="p-1 rounded bg-[#FF681F] text-white cursor-pointer"
              title="Save Title"
              aria-label="Save Title"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsEditingTitle(false)}
              className="p-1 rounded bg-[#202838] text-[#8694A8] cursor-pointer"
              title="Cancel"
              aria-label="Cancel Rename"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base md:text-lg font-black tracking-wider uppercase text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {title || 'CORE FOUNDATIONS'}
            </h2>
            {canRenameChat && onRenameActiveChat && (
              <button
                onClick={() => {
                  setTitleInput(title);
                  setIsEditingTitle(true);
                }}
                className="p-1 rounded text-[#718096] hover:text-white hover:bg-[#1A2230] cursor-pointer"
                title="Rename this conversation"
                aria-label="Rename active chat"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Subject dropdown */}
        <div className="relative hidden sm:block">
          <select
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-[#141A24] border border-[#232B3B] text-xs font-semibold text-[#8B98AD] hover:text-white hover:border-[#FF681F]/40 focus:outline-none focus:border-[#FF681F] cursor-pointer"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#6E7B8E] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right: Actions & Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* + New Chat */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF681F] to-[#FF5100] hover:from-[#FF7A38] hover:to-[#FF681F] text-white text-xs font-bold shadow-md shadow-orange-950/30 transition-all cursor-pointer"
          title="Start new conversation"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* History Button */}
        <button
          onClick={onToggleHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141A24] hover:bg-[#1A2230] border border-[#232B3B] text-xs font-medium text-[#93A1B5] hover:text-white transition-all cursor-pointer"
          title="View profile chat history"
        >
          <History className="w-4 h-4 text-[#FF681F]" />
          <span>History</span>
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#1F2737] text-[10px] font-bold text-white">
            {historyCount}
          </span>
        </button>

        {/* Tutor Settings */}
        <button
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141A24] hover:bg-[#1A2230] border border-[#232B3B] text-xs font-medium text-[#93A1B5] hover:text-white transition-all cursor-pointer"
          title="Tutor settings & voice"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Tutor Settings</span>
        </button>

        {/* Active Profile Pill */}
        <button
          onClick={onSwitchProfile}
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-[#141A25] hover:bg-[#1B2332] border border-[#232C3E] text-xs transition-all cursor-pointer"
          title="Switch active student profile"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white text-[11px] font-bold">
            {activeProfile.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-white truncate max-w-[90px] hidden lg:inline">
            {activeProfile.name}
          </span>
        </button>

        {/* Top Right Logo */}
        <div className="hidden lg:flex items-center gap-1 pl-2">
          <span className="font-brand font-bold text-base text-white">
            agaram <span className="text-[#FF681F]">Ai</span>
          </span>
        </div>
      </div>
    </header>
  );
};
