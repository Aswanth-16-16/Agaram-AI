/**
 * AGARAM – AI-Powered Adaptive Learning Platform
 * Multi-Profile Adaptive Tutoring & Evidence-Based Learning Analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StudentProfile,
  ChatConversation,
  VoicePersona,
} from './types.ts';
import {
  fetchProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  fetchProfileChats,
  createProfileChat,
  renameProfileChat,
  deleteProfileChat,
  sendChatMessage,
  submitAssessment,
} from './lib/api.ts';
import { LandingProfileSelector } from './components/LandingProfileSelector.tsx';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { TopNavbar } from './components/TopNavbar.tsx';
import { AITutorView } from './components/AITutorView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { AssessmentsView } from './components/AssessmentsView.tsx';
import { ProfileSettingsView } from './components/ProfileSettingsView.tsx';
import {
  HiddenWeaknessesView,
  KnowledgeMasteryView,
  SyllabusView,
  RevisionView,
  CollaborativeGroupsView,
  AchievementsView,
  DocumentsView,
} from './components/OtherViews.tsx';

export default function App() {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isLanding, setIsLanding] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Profile-specific conversations
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentSubject, setCurrentSubject] = useState<string>('Core Foundations');
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load profiles on mount
  useEffect(() => {
    async function init() {
      try {
        const loadedProfiles = await fetchProfiles();
        setProfiles(loadedProfiles);

        const savedProfileId = localStorage.getItem('agaram_active_profile_id');
        const defaultProfile =
          loadedProfiles.find((p) => p.id === savedProfileId) || loadedProfiles[0];

        if (defaultProfile) {
          setSelectedProfileId(defaultProfile.id);
        }

        const savedLanding = localStorage.getItem('agaram_in_landing');
        if (savedLanding === 'false' && defaultProfile) {
          setIsLanding(false);
        }
      } catch (err) {
        console.error('Failed to initialize profiles:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const activeProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  // Load chat conversations whenever active profile changes
  const loadChatsForProfile = useCallback(async (profileId: string) => {
    if (!profileId) return;
    try {
      const chats = await fetchProfileChats(profileId);
      setConversations(chats);
      if (chats.length > 0) {
        setActiveConversationId(chats[0].id);
        setCurrentSubject(chats[0].subject || 'Core Foundations');
      } else {
        setActiveConversationId(null);
      }
    } catch (err) {
      console.error('Failed to load profile chats:', err);
    }
  }, []);

  useEffect(() => {
    if (activeProfile?.id) {
      loadChatsForProfile(activeProfile.id);
      localStorage.setItem('agaram_active_profile_id', activeProfile.id);
    }
  }, [activeProfile?.id, loadChatsForProfile]);

  // Profile Actions
  const handleSelectProfile = (id: string) => {
    setSelectedProfileId(id);
    localStorage.setItem('agaram_active_profile_id', id);
  };

  const handleContinueIntoApp = (profile: StudentProfile) => {
    setSelectedProfileId(profile.id);
    localStorage.setItem('agaram_active_profile_id', profile.id);
    localStorage.setItem('agaram_in_landing', 'false');
    setIsLanding(false);
  };

  const handleReturnToLanding = () => {
    localStorage.setItem('agaram_in_landing', 'true');
    setIsLanding(true);
  };

  const handleCreateProfile = async (data: {
    name: string;
    course: string;
    academicLevel: string;
    voicePersona: VoicePersona;
  }) => {
    const created = await createProfile(data);
    const updatedProfiles = [...profiles, created];
    setProfiles(updatedProfiles);
    setSelectedProfileId(created.id);
    localStorage.setItem('agaram_active_profile_id', created.id);
  };

  const handleUpdateProfile = async (
    id: string,
    data: Partial<StudentProfile>
  ) => {
    const updated = await updateProfile(id, data);
    setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const handleDeleteProfile = async (id: string) => {
    await deleteProfile(id);
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);
    if (remaining.length > 0) {
      setSelectedProfileId(remaining[0].id);
      localStorage.setItem('agaram_active_profile_id', remaining[0].id);
    }
  };

  // Chat Actions (Profile-Specific)
  const handleNewConversation = async () => {
    if (!activeProfile) return;
    try {
      const newConv = await createProfileChat(activeProfile.id, currentSubject);
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setActiveTab('tutor');
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeProfile) return;

    let chatId = activeConversationId;
    // If no active conversation exists, generate a temporary internal ID first
    if (!chatId) {
      chatId = `temp_conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setActiveConversationId(chatId);
    }

    try {
      const res = await sendChatMessage(
        activeProfile.id,
        chatId,
        text,
        currentSubject
      );

      // Update conversations list with the permanently stored generated title
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === chatId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = res.conversation;
          return updated;
        }
        return [res.conversation, ...prev];
      });

      setActiveConversationId(res.conversation.id);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleRenameConversation = async (chatId: string, newTitle: string) => {
    if (!activeProfile) return;
    try {
      const updated = await renameProfileChat(activeProfile.id, chatId, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === chatId ? updated : c))
      );
    } catch (err) {
      console.error('Error renaming conversation:', err);
    }
  };

  const handleDeleteConversation = async (chatId: string) => {
    if (!activeProfile) return;
    try {
      await deleteProfileChat(activeProfile.id, chatId);
      const remaining = conversations.filter((c) => c.id !== chatId);
      setConversations(remaining);
      if (activeConversationId === chatId) {
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  // Assessment completion handler
  const handleAssessmentCompleted = async (data: {
    assessmentId: string;
    correct: number;
    total: number;
    clearedConcepts: string[];
    weakConcepts: string[];
    subjectName: string;
  }) => {
    if (!activeProfile) return;
    try {
      const res = await submitAssessment(activeProfile.id, data);
      // Update profile in state with updated database values
      setProfiles((prev) =>
        prev.map((p) => (p.id === activeProfile.id ? res.profile : p))
      );
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080A0D] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF681F] border-t-transparent animate-spin" />
          <span className="text-sm font-brand font-semibold text-[#8B98AD]">
            Loading AGARAM AI...
          </span>
        </div>
      </div>
    );
  }

  // 1. Landing / Profile Selection Screen
  if (isLanding || !activeProfile) {
    return (
      <LandingProfileSelector
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onSelectProfile={handleSelectProfile}
        onContinue={handleContinueIntoApp}
        onCreateProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
        onUpdateProfile={handleUpdateProfile}
      />
    );
  }

  // 2. Active Student Workspace
  const currentChat = conversations.find((c) => c.id === activeConversationId);
  const currentTitle =
    currentChat?.title || (activeTab === 'tutor' ? 'Core Foundations' : activeTab.toUpperCase());

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080A0D] text-[#F4F5F7]">
      {/* Left Navigation Rail */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeProfile={activeProfile}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onSwitchProfile={handleReturnToLanding}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <TopNavbar
          title={currentTitle}
          subject={currentSubject}
          onSubjectChange={setCurrentSubject}
          onNewChat={handleNewConversation}
          onToggleHistory={() => setShowHistoryDrawer(!showHistoryDrawer)}
          historyCount={conversations.length}
          onOpenSettings={() => setActiveTab('profile')}
          activeProfile={activeProfile}
          onSwitchProfile={handleReturnToLanding}
          canRenameChat={Boolean(activeConversationId && activeTab === 'tutor')}
          onRenameActiveChat={(newTitle) => {
            if (activeConversationId) {
              handleRenameConversation(activeConversationId, newTitle);
            }
          }}
        />

        {/* View Switcher */}
        <main className="flex-1 flex overflow-hidden relative">
          {activeTab === 'tutor' && (
            <AITutorView
              activeProfile={activeProfile}
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              onNewConversation={handleNewConversation}
              onSendMessage={handleSendMessage}
              onRenameConversation={handleRenameConversation}
              onDeleteConversation={handleDeleteConversation}
              showHistoryDrawer={showHistoryDrawer}
              onCloseHistoryDrawer={() => setShowHistoryDrawer(false)}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              activeProfile={activeProfile}
              onTakeAssessment={() => setActiveTab('assessments')}
              onOpenTutor={() => setActiveTab('tutor')}
              onOpenProfileSettings={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'assessments' && (
            <AssessmentsView
              activeProfile={activeProfile}
              onAssessmentCompleted={handleAssessmentCompleted}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileSettingsView
              activeProfile={activeProfile}
              onUpdateVoicePersona={(voice) =>
                handleUpdateProfile(activeProfile.id, { voicePersona: voice })
              }
              onUpdateProfileDetails={(name, course) =>
                handleUpdateProfile(activeProfile.id, { name, course })
              }
            />
          )}

          {activeTab === 'weaknesses' && (
            <HiddenWeaknessesView
              activeProfile={activeProfile}
              onNavigateToAssessments={() => setActiveTab('assessments')}
              onNavigateToTutor={() => setActiveTab('tutor')}
            />
          )}

          {activeTab === 'mastery' && (
            <KnowledgeMasteryView
              activeProfile={activeProfile}
              onNavigateToAssessments={() => setActiveTab('assessments')}
              onNavigateToTutor={() => setActiveTab('tutor')}
            />
          )}

          {activeTab === 'syllabus' && (
            <SyllabusView
              activeProfile={activeProfile}
              onNavigateToAssessments={() => setActiveTab('assessments')}
              onNavigateToTutor={() => setActiveTab('tutor')}
            />
          )}

          {activeTab === 'revision' && (
            <RevisionView
              activeProfile={activeProfile}
              onNavigateToAssessments={() => setActiveTab('assessments')}
              onNavigateToTutor={() => setActiveTab('tutor')}
            />
          )}

          {activeTab === 'groups' && (
            <CollaborativeGroupsView
              activeProfile={activeProfile}
              onNavigateToAssessments={() => setActiveTab('assessments')}
              onNavigateToTutor={() => setActiveTab('tutor')}
            />
          )}

          {activeTab === 'achievements' && (
            <AchievementsView
              activeProfile={activeProfile}
              onNavigateToAssessments={() => setActiveTab('assessments')}
              onNavigateToTutor={() => setActiveTab('tutor')}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              activeProfile={activeProfile}
              onNavigateToAssessments={() => setActiveTab('assessments')}
              onNavigateToTutor={() => setActiveTab('tutor')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
