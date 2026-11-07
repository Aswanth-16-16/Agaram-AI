import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Target,
  HelpCircle,
  RotateCcw,
  AlertTriangle,
  Award,
  Sparkles,
  BookOpen,
  Clock,
  Flame,
  Brain,
  Database,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { StudentProfile } from '../types.ts';

interface DashboardViewProps {
  activeProfile: StudentProfile;
  onTakeAssessment: () => void;
  onOpenTutor: () => void;
  onOpenProfileSettings: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeProfile,
  onTakeAssessment,
  onOpenTutor,
  onOpenProfileSettings,
}) => {
  const [showRawDb, setShowRawDb] = useState(false);
  const a = activeProfile.analytics;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white space-y-8 select-none">
      {/* Top Banner / Student Greeting */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F141D] via-[#121824] to-[#141A25] border border-[#20293B] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-950/40">
            {activeProfile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Welcome back, {activeProfile.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF681F]/20 border border-[#FF681F]/40 text-[#FF681F] text-[11px] font-bold">
                {activeProfile.voicePersona.toUpperCase()} VOICE
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#8291A5] mt-1">
              {activeProfile.course} • {activeProfile.academicLevel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onTakeAssessment}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF681F] to-[#FF5100] hover:from-[#FF7A38] hover:to-[#FF681F] text-white text-xs font-bold shadow-lg shadow-orange-950/40 transition-all cursor-pointer whitespace-nowrap"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Take Assessment</span>
          </button>
          <button
            onClick={onOpenTutor}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#171E2B] hover:bg-[#20293B] border border-[#273247] text-white text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Ask AI Tutor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. CORE DASHBOARD METRICS (Requirement 1 Table)          */}
      {/* ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-wider uppercase text-[#96A5BA]">
              Examination & Learning Analytics
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#161D29] border border-[#242E40] text-[10px] text-[#00E5A3] font-semibold">
              Live Database Values
            </span>
          </div>
          <button
            onClick={() => setShowRawDb(!showRawDb)}
            className="flex items-center gap-1.5 text-xs text-[#7E8D9F] hover:text-[#FF681F] transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{showRawDb ? 'Hide Database JSON' : 'Inspect Database JSON'}</span>
          </button>
        </div>

        {/* Database Raw JSON Inspection panel */}
        {showRawDb && (
          <div className="mb-4 p-4 rounded-xl bg-[#0B0E14] border border-[#232B3C] font-mono text-xs text-[#00E5A3] overflow-x-auto shadow-inner">
            <div className="flex items-center justify-between text-[#8E9CAE] pb-2 mb-2 border-b border-[#1C2330]">
              <span>Database Record: profiles[{activeProfile.id}].analytics</span>
              <span className="text-[10px] text-[#556377]">Stored in /data/agaram-db.json</span>
            </div>
            <pre>{JSON.stringify(activeProfile.analytics, null, 2)}</pre>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* Examinations In */}
          <div className="p-4 rounded-xl bg-[#0F141D] border border-[#1E2738] hover:border-[#2D394E] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#808F9F] font-medium">Examinations In</span>
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-[#FF681F]">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {a.examinationsIn}
            </div>
            <p className="text-[11px] text-[#5A687A] mt-1">Scheduled or active</p>
          </div>

          {/* Assessments Taken */}
          <div className="p-4 rounded-xl bg-[#0F141D] border border-[#1E2738] hover:border-[#2D394E] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#808F9F] font-medium">Assessments Taken</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-[#38BDF8]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {a.assessmentsTaken}
            </div>
            <p className="text-[11px] text-[#5A687A] mt-1">Verified evaluations</p>
          </div>

          {/* Average Accuracy */}
          <div className="p-4 rounded-xl bg-[#0F141D] border border-[#1E2738] hover:border-[#2D394E] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#808F9F] font-medium">Average Accuracy</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-[#00E5A3]">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {a.averageAccuracy}%
            </div>
            <p className="text-[11px] text-[#5A687A] mt-1">Calculated from attempts</p>
          </div>

          {/* Questions Solved */}
          <div className="p-4 rounded-xl bg-[#0F141D] border border-[#1E2738] hover:border-[#2D394E] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#808F9F] font-medium">Questions Solved</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-[#A78BFA]">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {a.questionsSolved}
            </div>
            <p className="text-[11px] text-[#5A687A] mt-1">Total items completed</p>
          </div>

          {/* Recovered Concepts */}
          <div className="p-4 rounded-xl bg-[#0F141D] border border-[#1E2738] hover:border-[#2D394E] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#808F9F] font-medium">Recovered Concepts</span>
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-[#2DD4BF]">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {a.recoveredConcepts}
            </div>
            <p className="text-[11px] text-[#5A687A] mt-1">Overcome knowledge gaps</p>
          </div>

          {/* Hidden Weaknesses */}
          <div className="p-4 rounded-xl bg-[#0F141D] border border-[#1E2738] hover:border-[#2D394E] transition-all col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#808F9F] font-medium">Hidden Weaknesses</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-[#FBBF24]">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`text-sm md:text-base font-bold font-mono truncate ${
                a.hiddenWeaknesses === 'NOT YET IDENTIFIED'
                  ? 'text-[#94A3B8]'
                  : 'text-[#FF681F]'
              }`}
            >
              {a.hiddenWeaknesses}
            </div>
            <p className="text-[11px] text-[#5A687A] mt-1">
              {a.hiddenWeaknesses === 'NOT YET IDENTIFIED'
                ? 'Awaiting assessment evidence'
                : `${a.hiddenWeaknessesList.length} flagged concept(s)`}
            </p>
          </div>

          {/* Recently Cleared */}
          <div className="p-4 rounded-xl bg-[#0F141D] border border-[#1E2738] hover:border-[#2D394E] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#808F9F] font-medium">Recently Cleared</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-[#34D399]">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {a.recentlyCleared}
            </div>
            <p className="text-[11px] text-[#5A687A] mt-1">Cleared in last session</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SECONDARY PROGRESS & EVIDENCE METRICS                 */}
      {/* ======================================================== */}
      <div>
        <h2 className="text-sm font-bold tracking-wider uppercase text-[#96A5BA] mb-3">
          Knowledge Progression & Behavioral Habits
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Knowledge Mastery Card */}
          <div className="p-5 rounded-2xl bg-[#0F141D] border border-[#1E2738] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#8292A3]">Knowledge Mastery</span>
                <Brain className="w-4 h-4 text-[#FF681F]" />
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {a.knowledgeMastery}
              </div>
              <p className="text-xs text-[#6B798C]">
                {a.knowledgeMastery === 'NOT YET IDENTIFIED'
                  ? 'Initial empty state. Requires completed assessments before mastery synthesis.'
                  : 'Synthesized from cognitive assessment outcomes.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1A2230] flex items-center justify-between text-xs text-[#8695AA]">
              <span>Learning Progress</span>
              <span className="font-mono font-bold text-white">{a.learningProgress}%</span>
            </div>
          </div>

          {/* Learning Insights Card */}
          <div className="p-5 rounded-2xl bg-[#0F141D] border border-[#1E2738] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#8292A3]">Learning Insights</span>
                <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <div className="text-sm font-medium text-[#CAD5E2] leading-relaxed mb-2">
                {a.learningInsights === 'NOT YET IDENTIFIED' ? (
                  <span className="text-[#8190A5] italic">
                    NOT YET IDENTIFIED — No fabricated assumptions. Insights unlock as you solve questions.
                  </span>
                ) : (
                  a.learningInsights
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1A2230] flex items-center justify-between text-xs text-[#8695AA]">
              <span>Revision Progress</span>
              <span className="font-mono font-bold text-white">{a.revisionProgress}%</span>
            </div>
          </div>

          {/* Study Habits Card */}
          <div className="p-5 rounded-2xl bg-[#0F141D] border border-[#1E2738] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#8292A3]">Cognitive Habits</span>
                <Clock className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#728194]">Strongest Subject:</span>
                  <span className="font-semibold text-white">{a.strongestSubject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#728194]">Learning Pace:</span>
                  <span className="font-semibold text-[#FF9248]">{a.learningPace}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#728194]">Best Study Window:</span>
                  <span className="font-semibold text-white">{a.bestStudyWindow}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1A2230] flex items-center justify-between text-xs text-[#8695AA]">
              <span>Study Streak</span>
              <span className="font-mono font-bold text-[#FF9248] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#FF681F]" />
                {a.studyStreak} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#0C1017] border border-[#1A2230] text-xs">
        <div>
          <span className="text-[#687688]">Completed Lessons:</span>
          <div className="text-base font-bold text-white font-mono mt-0.5">
            {a.completedLessons}
          </div>
        </div>
        <div>
          <span className="text-[#687688]">Total Study Time:</span>
          <div className="text-base font-bold text-white font-mono mt-0.5">
            {a.totalStudyTime} mins
          </div>
        </div>
        <div>
          <span className="text-[#687688]">Community Points:</span>
          <div className="text-base font-bold text-white font-mono mt-0.5">
            {a.communityPoints} XP
          </div>
        </div>
        <div>
          <span className="text-[#687688]">Achievements:</span>
          <div className="text-base font-bold text-white font-mono mt-0.5">
            {a.achievements} unlocked
          </div>
        </div>
      </div>
    </div>
  );
};
