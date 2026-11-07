export type VoicePersona = 'male' | 'female';

export interface StudentAnalytics {
  examinationsIn: number;
  assessmentsTaken: number;
  averageAccuracy: number; // Stored as number, e.g. 0 initially
  questionsSolved: number;
  recoveredConcepts: number;
  hiddenWeaknesses: string; // "NOT YET IDENTIFIED" initially
  hiddenWeaknessesList: string[];
  recentlyCleared: number;
  learningProgress: number; // 0..100 (%)
  studyStreak: number; // 0 (days)
  completedLessons: number; // 0
  totalStudyTime: number; // 0 (minutes)
  communityPoints: number; // 0
  achievements: number; // 0
  knowledgeMastery: string; // "NOT YET IDENTIFIED"
  knowledgeMasteryScore: number | null; // null initially
  learningInsights: string; // "NOT YET IDENTIFIED"
  revisionProgress: number; // 0..100 (%)
  strongestSubject: string; // "General Studies" initially
  learningPace: string; // "Structured" initially
  bestStudyWindow: string; // "Flexible" initially
}

export interface StudentProfile {
  id: string; // UUID
  name: string;
  course: string;
  academicLevel: string;
  voicePersona: VoicePersona;
  avatarColor: string;
  createdAt: string;
  analytics: StudentAnalytics;
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'tutor';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  relatedConcepts?: string[];
  codeBlock?: string;
  isInitialGreeting?: boolean;
}

export interface ChatConversation {
  id: string; // Unique conversation ID
  profileId: string; // Profile UUID
  title: string; // Meaningful 3-7 word title
  subject: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  isLockedTitle?: boolean; // Locked after meaningful first question
  isCustomNamed?: boolean; // If student manually renamed
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  concept: string;
}

export interface AssessmentItem {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  description: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentResult {
  assessmentId: string;
  profileId: string;
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
  timestamp: string;
  clearedConcepts: string[];
  weakConcepts: string[];
}
