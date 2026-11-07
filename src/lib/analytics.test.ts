import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialStudentAnalytics,
  createNewStudentProfile,
  calculateAverageAccuracy,
  applyAssessmentCompletion,
} from './analytics.ts';

test('createInitialStudentAnalytics initializes all metrics to exact database specifications', () => {
  const initial = createInitialStudentAnalytics();

  // Dashboard metrics from Requirement 1 table
  assert.equal(initial.examinationsIn, 0);
  assert.equal(initial.assessmentsTaken, 0);
  assert.equal(initial.averageAccuracy, 0);
  assert.equal(initial.questionsSolved, 0);
  assert.equal(initial.recoveredConcepts, 0);
  assert.equal(initial.hiddenWeaknesses, 'NOT YET IDENTIFIED');
  assert.equal(initial.recentlyCleared, 0);

  // Additional initialized metrics
  assert.equal(initial.learningProgress, 0);
  assert.equal(initial.studyStreak, 0);
  assert.equal(initial.completedLessons, 0);
  assert.equal(initial.totalStudyTime, 0);
  assert.equal(initial.communityPoints, 0);
  assert.equal(initial.achievements, 0);
  assert.equal(initial.knowledgeMastery, 'NOT YET IDENTIFIED');
  assert.equal(initial.knowledgeMasteryScore, null);
  assert.equal(initial.learningInsights, 'NOT YET IDENTIFIED');
  assert.equal(initial.revisionProgress, 0);
});

test('createNewStudentProfile creates isolated profile with initialized analytics', () => {
  const profile = createNewStudentProfile({
    name: 'Maya Patel',
    course: 'Data Science 101',
    academicLevel: 'University / School',
    voicePersona: 'female',
  });

  assert.ok(profile.id, 'Profile must have an ID');
  assert.equal(profile.name, 'Maya Patel');
  assert.equal(profile.voicePersona, 'female');
  assert.equal(profile.analytics.examinationsIn, 0);
  assert.equal(profile.analytics.assessmentsTaken, 0);
  assert.equal(profile.analytics.averageAccuracy, 0);
  assert.equal(profile.analytics.hiddenWeaknesses, 'NOT YET IDENTIFIED');
  assert.equal(profile.analytics.knowledgeMastery, 'NOT YET IDENTIFIED');
  assert.equal(profile.analytics.learningInsights, 'NOT YET IDENTIFIED');
});

test('calculateAverageAccuracy returns 0 when no attempts exist', () => {
  assert.equal(calculateAverageAccuracy(0, 0), 0);
  assert.equal(calculateAverageAccuracy(4, 5), 80);
  assert.equal(calculateAverageAccuracy(10, 10), 100);
});

test('applyAssessmentCompletion updates statistics based on actual assessment results', () => {
  const initial = createInitialStudentAnalytics();

  const updated = applyAssessmentCompletion(initial, {
    correct: 4,
    total: 5,
    subjectName: 'Photosynthesis & Plant Biology',
    clearedConcepts: ['Light Reactions'],
    weakConcepts: ['Calvin Cycle Intermediate Steps'],
  });

  assert.equal(updated.assessmentsTaken, 1);
  assert.equal(updated.examinationsIn, 1);
  assert.equal(updated.questionsSolved, 5);
  assert.equal(updated.averageAccuracy, 80);
  assert.equal(updated.recoveredConcepts, 1);
  assert.equal(updated.recentlyCleared, 1);
  assert.equal(updated.hiddenWeaknesses, '1 Identified');
  assert.ok(updated.knowledgeMastery.includes('80%'));
  assert.notEqual(updated.knowledgeMastery, 'NOT YET IDENTIFIED');
  assert.notEqual(updated.learningInsights, 'NOT YET IDENTIFIED');
});
