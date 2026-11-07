import React, { useState } from 'react';
import {
  Mic,
  Headphones,
  Volume2,
  Calendar,
  CheckCircle2,
  Sliders,
  Edit3,
  X,
  Check,
} from 'lucide-react';
import { StudentProfile, VoicePersona } from '../types.ts';

interface ProfileSettingsViewProps {
  activeProfile: StudentProfile;
  onUpdateVoicePersona: (voice: VoicePersona) => Promise<void>;
  onUpdateProfileDetails: (name: string, course: string) => Promise<void>;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  activeProfile,
  onUpdateVoicePersona,
  onUpdateProfileDetails,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(activeProfile.name);
  const [editCourse, setEditCourse] = useState(activeProfile.course);
  const [previewingVoice, setPreviewingVoice] = useState<VoicePersona | null>(null);

  const handlePreviewVoice = (voice: VoicePersona) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const text =
      voice === 'female'
        ? "Hello! I am your AGARAM AI tutor. Let's explore science, mathematics, and computing from first principles."
        : 'Greetings. I am your AGARAM academic tutor, optimized for structured logic, derivations, and code dry-runs.';

    const utterance = new SpeechSynthesisUtterance(text);
    if (voice === 'female') {
      utterance.pitch = 1.15;
      utterance.rate = 1.0;
    } else {
      utterance.pitch = 0.95;
      utterance.rate = 1.0;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find((v) =>
        voice === 'female'
          ? /female|samantha|zira|karen|victoria/i.test(v.name)
          : /male|david|daniel|alex|george/i.test(v.name)
      );
      if (match) utterance.voice = match;
    }

    setPreviewingVoice(voice);
    utterance.onend = () => setPreviewingVoice(null);
    utterance.onerror = () => setPreviewingVoice(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    await onUpdateProfileDetails(editName.trim(), editCourse.trim());
    setIsEditing(false);
  };

  const masteryPercent =
    activeProfile.analytics.knowledgeMasteryScore !== null
      ? `${activeProfile.analytics.knowledgeMasteryScore}%`
      : '0%';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white space-y-8 select-none">
      {/* Top Header matching screenshot learning-profile-voice_31410d71.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] md:text-xs font-bold text-[#FF681F] tracking-widest uppercase font-mono">
            EVOLVING STUDENT PROFILE
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-0.5">
            Learning Profile & Habits
          </h1>
          <p className="text-xs md:text-sm text-[#7D8C9F] mt-1">
            Cognitive attributes and study behaviors learned from verified learning evidence.
          </p>
        </div>

        <button
          onClick={() => {
            if (isEditing) {
              handleSaveProfile();
            } else {
              setEditName(activeProfile.name);
              setEditCourse(activeProfile.course);
              setIsEditing(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141A25] hover:bg-[#1C2433] border border-[#232B3B] text-xs font-semibold text-white transition-all cursor-pointer self-start sm:self-auto"
        >
          {isEditing ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#00E5A3]" />
              <span>Save Changes</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Preferences</span>
            </>
          )}
        </button>
      </div>

      {/* Main Student Profile Card matching screenshot */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#0F141D] border border-[#20293B] shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Avatar, Name, Course */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-orange-950/40 shrink-0">
            {activeProfile.name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Student Name"
                  className="px-3 py-1.5 rounded-lg bg-[#141A25] border border-[#283244] text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
                <input
                  type="text"
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  placeholder="Major / Course"
                  className="px-3 py-1.5 rounded-lg bg-[#141A25] border border-[#283244] text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {activeProfile.name}
                </h2>
                <p className="text-xs md:text-sm text-[#8292A5]">
                  {activeProfile.course} • {activeProfile.academicLevel}
                </p>
              </>
            )}

            <div className="flex items-center gap-1.5 text-xs text-[#00E5A3] font-medium pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Learning since {activeProfile.analytics.assessmentsTaken > 0 ? 'Verified Assessment' : 'Just started'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: 4 Core Columns matching screenshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#1B2332]">
          <div>
            <span className="text-[10px] font-bold text-[#6D7B8E] uppercase tracking-wider block">
              STRONGEST SUBJECT
            </span>
            <span className="text-sm font-bold text-white mt-1 block">
              {activeProfile.analytics.strongestSubject}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#6D7B8E] uppercase tracking-wider block">
              LEARNING PACE
            </span>
            <span className="text-sm font-bold text-[#FF681F] mt-1 block">
              {activeProfile.analytics.learningPace}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#6D7B8E] uppercase tracking-wider block">
              BEST STUDY WINDOW
            </span>
            <span className="text-sm font-bold text-white mt-1 block">
              {activeProfile.analytics.bestStudyWindow}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#6D7B8E] uppercase tracking-wider block">
              OVERALL MASTERY
            </span>
            <span className="text-sm font-bold text-[#00E5A3] font-mono mt-1 block">
              {masteryPercent}
            </span>
          </div>
        </div>
      </div>

      {/* Voice Preferences Section matching screenshot */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#0F141D] border border-[#20293B] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1A2230]">
          <div>
            <span className="text-[10px] md:text-xs font-bold text-[#FF681F] tracking-widest uppercase font-mono flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>AI VOICE PREFERENCES</span>
            </span>
            <h3 className="text-lg md:text-xl font-bold text-white mt-0.5">
              AI Tutor Voice Persona
            </h3>
            <p className="text-xs text-[#7F8F9F] mt-1">
              Select your preferred voice persona for read-aloud explanations and concept walkthroughs.
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-[#18202D] border border-[#273245] text-xs font-semibold text-[#FF9248] self-start sm:self-auto">
            Active: {activeProfile.voicePersona === 'female' ? 'Female Voice' : 'Male Voice'}
          </div>
        </div>

        {/* 2 Voice Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Male Voice */}
          <div
            onClick={() => onUpdateVoicePersona('male')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeProfile.voicePersona === 'male'
                ? 'bg-[#151C28] border-[#FF681F] shadow-lg shadow-orange-950/20'
                : 'bg-[#0B0E14] border-[#1C2330] hover:border-[#2C384B] hover:bg-[#111620]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#38BDF8]" />
                  <span className="font-bold text-sm text-white">Male Voice</span>
                </div>
                {activeProfile.voicePersona === 'male' && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FF681F] text-[10px] font-extrabold text-white">
                    SELECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7D8C9F] leading-relaxed mb-4">
                Clear, articulate, and steady academic resonance. Optimized for step-by-step logic and code dry-runs.
              </p>
            </div>

            <div className="pt-3 border-t border-[#18202D] flex items-center justify-between">
              <span className="text-[11px] text-[#556377] font-mono">
                Pitch: 0.95 • Rate: 1.0x
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewVoice('male');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182130] hover:bg-[#202B3D] border border-[#263347] text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Preview Male Voice</span>
              </button>
            </div>
          </div>

          {/* Female Voice */}
          <div
            onClick={() => onUpdateVoicePersona('female')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeProfile.voicePersona === 'female'
                ? 'bg-[#151C28] border-[#FF681F] shadow-lg shadow-orange-950/20'
                : 'bg-[#0B0E14] border-[#1C2330] hover:border-[#2C384B] hover:bg-[#111620]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-[#FF681F]" />
                  <span className="font-bold text-sm text-white">Female Voice</span>
                </div>
                {activeProfile.voicePersona === 'female' && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FF681F] text-[10px] font-extrabold text-white">
                    SELECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7D8C9F] leading-relaxed mb-4">
                Warm, expressive, and encouraging pedagogical cadence. Ideal for conceptual walkthroughs and analogies.
              </p>
            </div>

            <div className="pt-3 border-t border-[#18202D] flex items-center justify-between">
              <span className="text-[11px] text-[#556377] font-mono">
                Pitch: 1.15 • Rate: 1.0x
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewVoice('female');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182130] hover:bg-[#202B3D] border border-[#263347] text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#FF681F]" />
                <span>Preview Female Voice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
