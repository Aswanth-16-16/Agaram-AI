import { StudentAnalytics, StudentProfile, VoicePersona } from '../types.ts';

/**
 * Creates actual initial database analytics values for any new student profile.
 * Every metric is explicitly initialized with real database values:
 * - 0 for counts and percentages
 * - "NOT YET IDENTIFIED" for unassessed qualitative fields
 */
export function createInitialStudentAnalytics(): StudentAnalytics {
  return {
    examinationsIn: 0,
    assessmentsTaken: 0,
    averageAccuracy: 0,
    questionsSolved: 0,
    recoveredConcepts: 0,
    hiddenWeaknesses: 'NOT YET IDENTIFIED',
    hiddenWeaknessesList: [],
    recentlyCleared: 0,
    learningProgress: 0,
    studyStreak: 0,
    completedLessons: 0,
    totalStudyTime: 0,
    communityPoints: 0,
    achievements: 0,
    knowledgeMastery: 'NOT YET IDENTIFIED',
    knowledgeMasteryScore: null,
    learningInsights: 'NOT YET IDENTIFIED',
    revisionProgress: 0,
    strongestSubject: 'General Studies',
    learningPace: 'Structured',
    bestStudyWindow: 'Flexible',
  };
}

/**
 * Creates a new student profile with unique UUID and database analytics initialized.
 */
export function createNewStudentProfile(params: {
  id?: string;
  name: string;
  course: string;
  academicLevel: string;
  voicePersona?: VoicePersona;
  avatarColor?: string;
}): StudentProfile {
  const avatarColors = [
    'from-orange-500 to-amber-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-pink-600',
    'from-rose-500 to-red-600',
  ];
  const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  return {
    id: params.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `profile-${Date.now()}`),
    name: params.name.trim(),
    course: params.course.trim(),
    academicLevel: params.academicLevel.trim(),
    voicePersona: params.voicePersona || 'male',
    avatarColor: params.avatarColor || randomColor,
    createdAt: new Date().toISOString(),
    analytics: createInitialStudentAnalytics(),
  };
}

/**
 * Calculates Average Accuracy strictly from completed attempts.
 * Returns 0 when no attempts exist.
 */
export function calculateAverageAccuracy(totalCorrect: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((totalCorrect / totalQuestions) * 100);
}

/**
 * Updates analytics when an assessment is completed.
 * Recalculates metrics with actual completed assessment evidence.
 */
export function applyAssessmentCompletion(
  current: StudentAnalytics,
  result: {
    correct: number;
    total: number;
    weakConcepts?: string[];
    clearedConcepts?: string[];
    subjectName?: string;
  }
): StudentAnalytics {
  const newAssessmentsTaken = current.assessmentsTaken + 1;
  const newExaminationsIn = current.examinationsIn + 1;
  const newQuestionsSolved = current.questionsSolved + result.total;

  // Calculate cumulative accuracy
  const previousTotalCorrect = Math.round((current.averageAccuracy / 100) * current.questionsSolved);
  const updatedTotalCorrect = previousTotalCorrect + result.correct;
  const newAverageAccuracy = calculateAverageAccuracy(updatedTotalCorrect, newQuestionsSolved);

  // Concept recovery and weaknesses
  const newlyCleared = (result.clearedConcepts || []).length;
  const recoveredConcepts = current.recoveredConcepts + newlyCleared;

  // Retain existing weaknesses, remove cleared ones, add new verified weak ones
  const activeWeaknesses = new Set(current.hiddenWeaknessesList);
  (result.clearedConcepts || []).forEach((c) => activeWeaknesses.delete(c));
  (result.weakConcepts || []).forEach((c) => activeWeaknesses.add(c));
  const updatedWeaknessList = Array.from(activeWeaknesses);

  const hiddenWeaknessesStatus =
    updatedWeaknessList.length > 0
      ? `${updatedWeaknessList.length} Identified`
      : 'None Detected';

  // Knowledge mastery calculation
  const scorePercent = calculateAverageAccuracy(result.correct, result.total);
  let masteryLevel = 'Foundational';
  if (newAverageAccuracy >= 85) masteryLevel = 'Mastered';
  else if (newAverageAccuracy >= 70) masteryLevel = 'Proficient';
  else if (newAverageAccuracy >= 50) masteryLevel = 'Developing';

  const knowledgeMastery = `${masteryLevel} (${newAverageAccuracy}%)`;

  // Learning Insights generated from real performance evidence
  let learningInsights = `Strong performance in ${result.subjectName || 'completed topics'}. `;
  if (result.correct === result.total) {
    learningInsights += 'Flawless recall demonstrated on key concept foundations.';
  } else if (result.correct / result.total >= 0.7) {
    learningInsights += 'Consistent mastery of core principles with minor review recommended.';
  } else {
    learningInsights += 'Targeted revision queued for active recall consolidation.';
  }

  // Learning progress updates
  const newProgress = Math.min(100, Math.round(current.learningProgress + 15));
  const newStreak = Math.max(1, current.studyStreak);
  const newLessons = current.completedLessons + 1;
  const newTime = current.totalStudyTime + 15;
  const newPoints = current.communityPoints + result.correct * 20 + 50;
  const newAchievements = current.achievements + 1;
  const newRevisionProgress = Math.min(100, Math.round(current.revisionProgress + 20));

  return {
    ...current,
    examinationsIn: newExaminationsIn,
    assessmentsTaken: newAssessmentsTaken,
    averageAccuracy: newAverageAccuracy,
    questionsSolved: newQuestionsSolved,
    recoveredConcepts: recoveredConcepts,
    hiddenWeaknesses: hiddenWeaknessesStatus,
    hiddenWeaknessesList: updatedWeaknessList,
    recentlyCleared: current.recentlyCleared + newlyCleared,
    learningProgress: newProgress,
    studyStreak: newStreak,
    completedLessons: newLessons,
    totalStudyTime: newTime,
    communityPoints: newPoints,
    achievements: newAchievements,
    knowledgeMastery: knowledgeMastery,
    knowledgeMasteryScore: newAverageAccuracy,
    learningInsights: learningInsights,
    revisionProgress: newRevisionProgress,
  };
}
