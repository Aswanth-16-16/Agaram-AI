import { StudentProfile, ChatConversation, AssessmentItem } from '../types.ts';

const API_BASE = '/api';

export async function fetchProfiles(): Promise<StudentProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/profiles`);
    if (!res.ok) throw new Error('Failed to fetch profiles');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API fetchProfiles failed, using localStorage cache:', err);
    const cached = localStorage.getItem('agaram_profiles_cache');
    if (cached) return JSON.parse(cached);
    throw err;
  }
}

export async function createProfile(data: {
  name: string;
  course: string;
  academicLevel: string;
  voicePersona: 'male' | 'female';
}): Promise<StudentProfile> {
  const res = await fetch(`${API_BASE}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create profile');
  }
  return res.json();
}

export async function updateProfile(
  id: string,
  data: Partial<StudentProfile>
): Promise<StudentProfile> {
  const res = await fetch(`${API_BASE}/profiles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function deleteProfile(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/profiles/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete profile');
}

export async function fetchProfileChats(profileId: string): Promise<ChatConversation[]> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}/chats`);
  if (!res.ok) throw new Error('Failed to fetch chats');
  return res.json();
}

export async function createProfileChat(
  profileId: string,
  subject: string = 'Core Foundations'
): Promise<ChatConversation> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject }),
  });
  if (!res.ok) throw new Error('Failed to create chat');
  return res.json();
}

export async function renameProfileChat(
  profileId: string,
  chatId: string,
  title: string
): Promise<ChatConversation> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}/chats/${chatId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to rename chat');
  return res.json();
}

export async function deleteProfileChat(
  profileId: string,
  chatId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}/chats/${chatId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete chat');
}

export async function sendChatMessage(
  profileId: string,
  chatId: string,
  text: string,
  subject: string = 'Core Foundations'
): Promise<{
  conversation: ChatConversation;
  tutorMessage: any;
  generatedTitle: string;
}> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, subject }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function fetchAssessments(): Promise<AssessmentItem[]> {
  const res = await fetch(`${API_BASE}/assessments`);
  if (!res.ok) throw new Error('Failed to fetch assessments');
  return res.json();
}

export async function submitAssessment(
  profileId: string,
  data: {
    assessmentId: string;
    correct: number;
    total: number;
    clearedConcepts?: string[];
    weakConcepts?: string[];
    subjectName?: string;
  }
): Promise<{ profile: StudentProfile; updatedAnalytics: any }> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit assessment');
  return res.json();
}
