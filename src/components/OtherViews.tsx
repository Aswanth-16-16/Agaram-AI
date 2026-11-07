import React from 'react';
import {
  AlertCircle,
  Brain,
  BookOpen,
  RotateCcw,
  Users,
  Trophy,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { StudentProfile } from '../types.ts';

interface ViewProps {
  activeProfile: StudentProfile;
  onNavigateToAssessments: () => void;
  onNavigateToTutor: () => void;
}

export const HiddenWeaknessesView: React.FC<ViewProps> = ({
  activeProfile,
  onNavigateToAssessments,
  onNavigateToTutor,
}) => {
  const isNotIdentified = activeProfile.analytics.hiddenWeaknesses === 'NOT YET IDENTIFIED';
  const list = activeProfile.analytics.hiddenWeaknessesList;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white space-y-6 select-none">
      <div className="pb-4 border-b border-[#1B2230]">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#FF681F]" />
          <h1 className="text-xl md:text-2xl font-black text-white">
            Hidden Weaknesses & Diagnostic Evidence
          </h1>
        </div>
        <p className="text-xs md:text-sm text-[#7F8F9F] mt-1">
          Concept vulnerabilities identified strictly through verified assessment and question performance.
        </p>
      </div>

      {isNotIdentified ? (
        <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-[#0F141D] border border-[#20293B] text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#18202E] border border-[#263145] text-[#8695AA] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-[#1A2230] text-xs font-mono font-bold text-[#FF9248] uppercase">
            STATUS: NOT YET IDENTIFIED
          </div>
          <h2 className="text-xl font-bold text-white">No Fabricated Assumptions</h2>
          <p className="text-xs md:text-sm text-[#8190A4] leading-relaxed max-w-lg mx-auto">
            In compliance with AGARAM requirements, unassessed concepts are never assumed to be weaknesses. 
            Once {activeProfile.name} takes assessments or solves questions, verified knowledge gaps will appear here automatically with targeted recovery pathways.
          </p>
          <div className="pt-4">
            <button
              onClick={onNavigateToAssessments}
              className="px-6 py-2.5 rounded-xl bg-[#FF681F] hover:bg-[#FF7A38] text-white text-xs font-bold shadow-lg shadow-orange-950/40 cursor-pointer"
            >
              Take First Assessment to Build Evidence
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          <div className="p-4 rounded-xl bg-[#141A25] border border-[#232D3F] flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              Identified Concepts Requiring Reinforcement ({list.length})
            </span>
            <span className="text-xs text-[#00E5A3] font-mono">
              Recovered so far: {activeProfile.analytics.recoveredConcepts}
            </span>
          </div>
          <div className="space-y-3">
            {list.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0F141D] border border-[#1E2738] flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{item}</h4>
                  <p className="text-xs text-[#707E91] mt-0.5">
                    Flagged during assessment evaluation • Priority consolidation
                  </p>
                </div>
                <button
                  onClick={onNavigateToTutor}
                  className="px-3 py-1.5 rounded-lg bg-[#FF681F]/20 hover:bg-[#FF681F] text-[#FF681F] hover:text-white border border-[#FF681F]/40 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                >
                  Recover with AI Tutor
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const KnowledgeMasteryView: React.FC<ViewProps> = ({
  activeProfile,
  onNavigateToAssessments,
}) => {
  const isNotIdentified = activeProfile.analytics.knowledgeMastery === 'NOT YET IDENTIFIED';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white space-y-6 select-none">
      <div className="pb-4 border-b border-[#1B2230]">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#FF681F]" />
          <h1 className="text-xl md:text-2xl font-black text-white">
            Knowledge Mastery & Hindsight Cloud Memory
          </h1>
        </div>
        <p className="text-xs md:text-sm text-[#7F8F9F] mt-1">
          Adaptive cognitive topology and long-term memory graph for {activeProfile.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-[#0F141D] border border-[#20293B]">
          <span className="text-xs font-bold text-[#718096] uppercase">Mastery State</span>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {activeProfile.analytics.knowledgeMastery}
          </div>
          <p className="text-xs text-[#7A889A] mt-2">
            {isNotIdentified
              ? 'Stored as NOT YET IDENTIFIED until real assessments are completed.'
              : `Overall evaluated score: ${activeProfile.analytics.knowledgeMasteryScore}%`}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0F141D] border border-[#20293B]">
          <span className="text-xs font-bold text-[#718096] uppercase">Learning Progress</span>
          <div className="text-2xl font-black text-[#00E5A3] font-mono mt-2">
            {activeProfile.analytics.learningProgress}%
          </div>
          <p className="text-xs text-[#7A889A] mt-2">
            Dynamic milestone progression based on verified questions.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0F141D] border border-[#20293B]">
          <span className="text-xs font-bold text-[#718096] uppercase">Hindsight Memory Bank</span>
          <div className="text-base font-bold text-[#38BDF8] font-mono mt-2 truncate">
            agaram-{activeProfile.id}
          </div>
          <p className="text-xs text-[#7A889A] mt-2">
            Isolated profile vector memory partition.
          </p>
        </div>
      </div>
    </div>
  );
};

export const SyllabusView: React.FC<ViewProps> = ({ onNavigateToTutor }) => (
  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white space-y-6 select-none">
    <div className="pb-4 border-b border-[#1B2230]">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-[#FF681F]" />
        <h1 className="text-xl md:text-2xl font-black text-white">Curriculum & Syllabus</h1>
      </div>
      <p className="text-xs md:text-sm text-[#7F8F9F] mt-1">
        Comprehensive academic modules with structured first-principles learning tracks.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { title: 'Core Foundations & Epistemology', topics: 8, subject: 'General' },
        { title: 'Photosynthesis & Bioenergetics', topics: 12, subject: 'Biology' },
        { title: 'Quadratic Equations & Polynomials', topics: 10, subject: 'Mathematics' },
        { title: "Newton's Laws of Motion & Dynamics", topics: 14, subject: 'Physics' },
        { title: 'Memory Architecture: RAM vs ROM', topics: 9, subject: 'Computer Science' },
        { title: 'Python Loop Structures & Iterators', topics: 11, subject: 'Programming' },
      ].map((mod, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-[#0F141D] border border-[#1E2738] hover:border-[#2D394E] flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-[#FF681F] uppercase tracking-wider">
              {mod.subject}
            </span>
            <h3 className="text-base font-bold text-white mt-1 mb-2">{mod.title}</h3>
            <p className="text-xs text-[#728194]">{mod.topics} core topic concept nodes</p>
          </div>
          <div className="pt-4 mt-4 border-t border-[#18202D] flex items-center justify-between">
            <span className="text-xs text-[#00E5A3]">Ready for study</span>
            <button
              onClick={onNavigateToTutor}
              className="text-xs text-[#FF681F] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const RevisionView: React.FC<ViewProps> = ({ activeProfile, onNavigateToTutor }) => (
  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white space-y-6 select-none">
    <div className="pb-4 border-b border-[#1B2230]">
      <div className="flex items-center gap-2">
        <RotateCcw className="w-5 h-5 text-[#FF681F]" />
        <h1 className="text-xl md:text-2xl font-black text-white">
          Spaced Repetition & Revision
        </h1>
      </div>
      <p className="text-xs md:text-sm text-[#7F8F9F] mt-1">
        Consolidate memories right at the forgetting threshold for long-term retention.
      </p>
    </div>

    <div className="p-6 rounded-2xl bg-[#0F141D] border border-[#20293B] max-w-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-[#718096] uppercase">Revision Progress</span>
        <span className="text-sm font-bold text-[#00E5A3] font-mono">
          {activeProfile.analytics.revisionProgress}%
        </span>
      </div>
      <div className="w-full h-2 bg-[#171E2B] rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-[#FF681F] to-[#00E5A3]"
          style={{ width: `${Math.max(5, activeProfile.analytics.revisionProgress)}%` }}
        />
      </div>
      <p className="text-xs text-[#8090A4] leading-relaxed mb-4">
        {activeProfile.analytics.assessmentsTaken === 0
          ? 'No revision cards queued yet. Complete an assessment or ask the AI Tutor to schedule spaced review items.'
          : `${activeProfile.analytics.recoveredConcepts} concept(s) successfully recovered into long-term retention memory.`}
      </p>
      <button
        onClick={onNavigateToTutor}
        className="px-5 py-2.5 rounded-xl bg-[#FF681F] hover:bg-[#FF7A38] text-xs font-bold text-white shadow-md cursor-pointer"
      >
        Start Active Recall Session
      </button>
    </div>
  </div>
);

export const CollaborativeGroupsView: React.FC<ViewProps> = () => (
  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white space-y-6 select-none">
    <div className="pb-4 border-b border-[#1B2230]">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-[#818CF8]" />
        <h1 className="text-xl md:text-2xl font-black text-white">Collaborative Study Groups</h1>
      </div>
      <p className="text-xs md:text-sm text-[#7F8F9F] mt-1">
        Peer learning circles, collective problem solving, and group assessments.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { name: 'Quantum & Classical Mechanics Lab', members: 18, topic: 'Newtonian Systems' },
        { name: 'Biochemical Pathways Study Hub', members: 24, topic: 'Cellular Bioenergetics' },
        { name: 'Algorithmic Problem Solvers', members: 42, topic: 'Data Structures' },
      ].map((g, idx) => (
        <div key={idx} className="p-5 rounded-2xl bg-[#0F141D] border border-[#1E2738]">
          <h3 className="text-base font-bold text-white mb-1">{g.name}</h3>
          <p className="text-xs text-[#6F7E91] mb-3">Topic: {g.topic} • {g.members} peers</p>
          <button className="px-3 py-1.5 rounded-lg bg-[#182130] text-xs font-semibold text-white hover:bg-[#202B3D] border border-[#273347] cursor-pointer">
            Join Study Room
          </button>
        </div>
      ))}
    </div>
  </div>
);

export const AchievementsView: React.FC<ViewProps> = ({ activeProfile }) => (
  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white space-y-6 select-none">
    <div className="pb-4 border-b border-[#1B2230]">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-[#FBBF24]" />
        <h1 className="text-xl md:text-2xl font-black text-white">
          Achievements & Gamified Mastery
        </h1>
      </div>
      <p className="text-xs md:text-sm text-[#7F8F9F] mt-1">
        Earn XP, level up tiers, and unlock badges through verified academic effort.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-5 rounded-2xl bg-[#0F141D] border border-[#20293B]">
        <span className="text-xs text-[#718096] uppercase font-bold">Community Points</span>
        <div className="text-2xl font-black text-[#FBBF24] font-mono mt-1">
          {activeProfile.analytics.communityPoints} XP
        </div>
      </div>
      <div className="p-5 rounded-2xl bg-[#0F141D] border border-[#20293B]">
        <span className="text-xs text-[#718096] uppercase font-bold">Badges Unlocked</span>
        <div className="text-2xl font-black text-white font-mono mt-1">
          {activeProfile.analytics.achievements} / 12
        </div>
      </div>
      <div className="p-5 rounded-2xl bg-[#0F141D] border border-[#20293B]">
        <span className="text-xs text-[#718096] uppercase font-bold">Study Streak</span>
        <div className="text-2xl font-black text-[#FF681F] font-mono mt-1">
          {activeProfile.analytics.studyStreak} Days
        </div>
      </div>
    </div>
  </div>
);

export const DocumentsView: React.FC<ViewProps> = () => (
  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white space-y-6 select-none">
    <div className="pb-4 border-b border-[#1B2230]">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#38BDF8]" />
        <h1 className="text-xl md:text-2xl font-black text-white">
          Document & Lecture Notes Analyzer
        </h1>
      </div>
      <p className="text-xs md:text-sm text-[#7F8F9F] mt-1">
        Upload textbook PDFs and slides for instant multimodal concept extraction.
      </p>
    </div>

    <div className="p-8 rounded-2xl bg-[#0F141D] border border-dashed border-[#29354A] text-center max-w-xl mx-auto space-y-3">
      <FileText className="w-10 h-10 text-[#6C7B8E] mx-auto" />
      <h3 className="text-base font-bold text-white">Drag & drop course documents or lecture slides</h3>
      <p className="text-xs text-[#6C7B8E]">Supports PDF, PNG, JPG up to 25MB with Gemini AI document vision parsing.</p>
      <button className="px-4 py-2 rounded-xl bg-[#182130] hover:bg-[#202B3D] text-xs font-semibold text-white border border-[#273448] cursor-pointer">
        Browse Files
      </button>
    </div>
  </div>
);
