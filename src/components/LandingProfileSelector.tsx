import React, { useState } from 'react';
import {
  UserPlus,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Brain,
  Mic,
  Users,
  Trophy,
  X,
  Volume2,
} from 'lucide-react';
import { StudentProfile, VoicePersona } from '../types.ts';

interface LandingProfileSelectorProps {
  profiles: StudentProfile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onContinue: (profile: StudentProfile) => void;
  onCreateProfile: (data: {
    name: string;
    course: string;
    academicLevel: string;
    voicePersona: VoicePersona;
  }) => Promise<void>;
  onDeleteProfile: (id: string) => Promise<void>;
  onUpdateProfile: (id: string, data: Partial<StudentProfile>) => Promise<void>;
}

export const LandingProfileSelector: React.FC<LandingProfileSelectorProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onContinue,
  onCreateProfile,
  onDeleteProfile,
  onUpdateProfile,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Create form state
  const [name, setName] = useState('');
  const [course, setCourse] = useState('Data Science 101');
  const [academicLevel, setAcademicLevel] = useState('University / School');
  const [voicePersona, setVoicePersona] = useState<VoicePersona>('female');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editVoice, setEditVoice] = useState<VoicePersona>('male');

  const handleStartCreate = () => {
    setName('');
    setCourse('Data Science 101');
    setAcademicLevel('University / School');
    setVoicePersona('female');
    setErrorMsg('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a student name.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onCreateProfile({
        name: name.trim(),
        course: course.trim(),
        academicLevel: academicLevel.trim(),
        voicePersona,
      });
      setShowCreateModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create student profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (p: StudentProfile) => {
    setEditingProfileId(p.id);
    setEditName(p.name);
    setEditCourse(p.course);
    setEditVoice(p.voicePersona);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await onUpdateProfile(id, {
      name: editName.trim(),
      course: editCourse.trim(),
      voicePersona: editVoice,
    });
    setEditingProfileId(null);
  };

  const activeProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  return (
    <div className="min-h-screen bg-[#080A0D] bg-grid-pattern text-[#F4F5F7] flex flex-col items-center justify-between p-6 select-none relative overflow-y-auto">
      {/* Top spacing */}
      <div className="w-full h-8" />

      {/* Main Container */}
      <div className="w-full max-w-2xl flex flex-col items-center z-10 my-auto">
        {/* Brand Logo & Tagline */}
        <div className="text-center mb-8">
          <h1 className="font-brand text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-2 inline-flex items-center gap-1.5">
            <span>agaram</span>
            <span className="text-[#FF681F]">Ai</span>
          </h1>
          <div className="w-24 h-1 bg-[#FF681F] mx-auto rounded-full mb-3" />
          <p className="text-[#8E9CAE] text-base md:text-lg font-normal">
            Your personal learning companion
          </p>
        </div>

        {/* Profile Selector Card */}
        <div className="w-full bg-[#0F131A]/90 border border-[#202736] rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1B2332]">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                Start your educational journey !
              </h2>
              <p className="text-xs md:text-sm text-[#828FA3] mt-1">
                Select your student profile or create an isolated study space.
              </p>
            </div>
            <button
              onClick={handleStartCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF681F] to-[#FF5100] hover:from-[#FF7A38] hover:to-[#FF681F] text-white text-sm font-semibold shadow-lg shadow-orange-950/40 hover:shadow-orange-700/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add New Profile</span>
            </button>
          </div>

          {/* Profile List */}
          <div className="flex flex-col gap-3.5 my-6 max-h-[380px] overflow-y-auto pr-1">
            {profiles.map((p) => {
              const isSelected = p.id === selectedProfileId;
              const isEditing = editingProfileId === p.id;
              const masteryDisplay =
                p.analytics.knowledgeMasteryScore !== null
                  ? `${p.analytics.knowledgeMasteryScore}%`
                  : '0%';

              if (isEditing) {
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-[#161D29] border border-[#FF681F]/50 flex flex-col gap-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Student name"
                        className="px-3 py-1.5 rounded-lg bg-[#0F131A] border border-[#2B3547] text-white text-sm focus:outline-none focus:border-[#FF681F]"
                      />
                      <input
                        type="text"
                        value={editCourse}
                        onChange={(e) => setEditCourse(e.target.value)}
                        placeholder="Course / Program"
                        className="px-3 py-1.5 rounded-lg bg-[#0F131A] border border-[#2B3547] text-white text-sm focus:outline-none focus:border-[#FF681F]"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2 text-xs text-[#95A3B8]">
                        <span>Voice:</span>
                        <button
                          type="button"
                          onClick={() => setEditVoice('male')}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            editVoice === 'male'
                              ? 'bg-[#FF681F]/20 text-[#FF681F] font-bold'
                              : 'bg-[#121721] text-[#717E91]'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditVoice('female')}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            editVoice === 'female'
                              ? 'bg-[#FF681F]/20 text-[#FF681F] font-bold'
                              : 'bg-[#121721] text-[#717E91]'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingProfileId(null)}
                          className="px-3 py-1 rounded bg-[#202838] text-xs text-[#8A97AC] hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(p.id)}
                          className="px-3 py-1 rounded bg-[#FF681F] text-xs font-semibold text-white cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProfile(p.id)}
                  className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#141A25] border-[#FF681F] shadow-lg shadow-orange-950/20'
                      : 'bg-[#111620] border-[#1E2636] hover:border-[#2D394E] hover:bg-[#131924]'
                  }`}
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-tr ${
                        p.avatarColor || 'from-orange-500 to-amber-600'
                      } flex items-center justify-center text-white font-bold text-lg shadow shrink-0`}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base text-white truncate">
                          {p.name}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FF681F] text-[10px] font-extrabold uppercase tracking-wide text-white">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#7F8D9F] truncate mt-0.5">
                        {p.course} • {p.academicLevel}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#00E5A3] mt-1 font-medium">
                        <span>Mastery: {masteryDisplay}</span>
                        <span className="text-[#414E63]">•</span>
                        <span>Streak: {p.analytics.studyStreak}d</span>
                        <span className="text-[#414E63]">•</span>
                        <span className="text-[#9BA7BA] capitalize">
                          Voice: {p.voicePersona}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(p);
                      }}
                      className="p-1.5 rounded-lg text-[#667285] hover:text-white hover:bg-[#1C2433] transition-colors cursor-pointer"
                      title="Edit Profile"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {profiles.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(`Delete profile for ${p.name}? All isolated chats and analytics will be removed.`)
                          ) {
                            onDeleteProfile(p.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-[#667285] hover:text-rose-400 hover:bg-[#1C2433] transition-colors cursor-pointer"
                        title="Delete Profile"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onContinue(p);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF681F] hover:bg-[#FF7A38] text-white text-xs font-bold transition-all shadow-md cursor-pointer ml-1"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action if unselected or generic continue */}
          {activeProfile && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onContinue(activeProfile)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF681F] to-[#FF5100] hover:from-[#FF7A38] hover:to-[#FF681F] text-white font-bold text-sm shadow-xl shadow-orange-950/40 cursor-pointer"
              >
                <span>Enter as {activeProfile.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feature Badges matching landing screenshot */}
      <div className="w-full flex flex-wrap items-center justify-center gap-3 pt-6 z-10 text-xs text-[#8A96A8]">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121620] border border-[#21293A]">
          <Brain className="w-3.5 h-3.5 text-[#FF681F]" />
          <span>Adaptive Hindsight Memory</span>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121620] border border-[#21293A]">
          <Mic className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Voice Concept Tutoring</span>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121620] border border-[#21293A]">
          <Users className="w-3.5 h-3.5 text-[#818CF8]" />
          <span>Collaborative Groups</span>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121620] border border-[#21293A]">
          <Trophy className="w-3.5 h-3.5 text-[#FBBF24]" />
          <span>Gamified Mastery & XP</span>
        </div>
      </div>

      {/* Modal: Create New Profile */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F131A] border border-[#232B3C] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6C798E] hover:text-white hover:bg-[#1B2332] cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-[#FF681F]/15 border border-[#FF681F]/30 text-[#FF681F]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Create New Student Profile
                </h3>
                <p className="text-xs text-[#7F8D9F]">
                  Isolated learning metrics, personalized memory, and dedicated chat history.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8E9CAE] mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A25] border border-[#252E40] text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8E9CAE] mb-1">
                    Major / Course
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. Data Science 101"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#141A25] border border-[#252E40] text-white text-sm focus:outline-none focus:border-[#FF681F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E9CAE] mb-1">
                    Academic Level
                  </label>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#141A25] border border-[#252E40] text-white text-sm focus:outline-none focus:border-[#FF681F]"
                  >
                    <option value="University / School">University / School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="High School">High School</option>
                    <option value="Post-Graduate">Post-Graduate</option>
                  </select>
                </div>
              </div>

              {/* Voice Persona Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#8E9CAE] mb-1.5">
                  AI Tutor Voice Persona
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVoicePersona('male')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      voicePersona === 'male'
                        ? 'bg-[#181E2B] border-[#FF681F] text-white'
                        : 'bg-[#121620] border-[#222A3B] text-[#78859A] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white">
                        Male Voice
                      </span>
                      {voicePersona === 'male' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF681F]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E7B8E]">
                      Articulate and steady academic cadence.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoicePersona('female')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      voicePersona === 'female'
                        ? 'bg-[#181E2B] border-[#FF681F] text-white'
                        : 'bg-[#121620] border-[#222A3B] text-[#78859A] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white">
                        Female Voice
                      </span>
                      {voicePersona === 'female' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF681F]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E7B8E]">
                      Warm, expressive, and pedagogical cadence.
                    </p>
                  </button>
                </div>
              </div>

              {/* Mandatory Database Initialization Notice */}
              <div className="p-3.5 rounded-xl bg-[#141A24] border border-[#232C3E] text-[11px] text-[#8695AA] space-y-1">
                <div className="font-semibold text-[#FF9248] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Verified Database Initial State:</span>
                </div>
                <p>
                  Examinations In: 0 • Assessments Taken: 0 • Questions Solved: 0 • Average Accuracy: 0%
                </p>
                <p>
                  Hidden Weaknesses, Knowledge Mastery, & Learning Insights: <strong className="text-white">NOT YET IDENTIFIED</strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1A2230] text-sm text-[#8D9BAD] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#FF681F] hover:bg-[#FF7A38] text-white text-sm font-bold shadow-lg shadow-orange-950/40 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
