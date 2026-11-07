import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
import { createServer } from '../../server.ts';
import http from 'node:http';

test('Full Acceptance Flow: Multi-profile, initialized analytics, and AI Tutor auto-titling', async (t) => {
  const app = await createServer();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(() => {
    server.close();
  });

  // Step 1: Create a new student profile (e.g. Maya Patel)
  const createRes = await fetch(`${baseUrl}/api/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Maya Patel',
      course: 'Data Science 101',
      academicLevel: 'University / School',
      voicePersona: 'female',
    }),
  });
  assert.equal(createRes.status, 201);
  const newProfile = await createRes.json();
  const mayaId = newProfile.id;

  // Step 2: Verify all examination and assessment metrics start at zero
  assert.equal(newProfile.analytics.examinationsIn, 0);
  assert.equal(newProfile.analytics.assessmentsTaken, 0);
  assert.equal(newProfile.analytics.averageAccuracy, 0);
  assert.equal(newProfile.analytics.questionsSolved, 0);
  assert.equal(newProfile.analytics.recoveredConcepts, 0);
  assert.equal(newProfile.analytics.recentlyCleared, 0);
  assert.equal(newProfile.analytics.learningProgress, 0);
  assert.equal(newProfile.analytics.studyStreak, 0);
  assert.equal(newProfile.analytics.completedLessons, 0);
  assert.equal(newProfile.analytics.totalStudyTime, 0);
  assert.equal(newProfile.analytics.communityPoints, 0);
  assert.equal(newProfile.analytics.achievements, 0);
  assert.equal(newProfile.analytics.revisionProgress, 0);

  // Step 3: Verify Hidden Weaknesses, Knowledge Mastery and Learning Insights show NOT YET IDENTIFIED
  assert.equal(newProfile.analytics.hiddenWeaknesses, 'NOT YET IDENTIFIED');
  assert.equal(newProfile.analytics.knowledgeMastery, 'NOT YET IDENTIFIED');
  assert.equal(newProfile.analytics.learningInsights, 'NOT YET IDENTIFIED');

  // Step 4: Complete an assessment and verify the relevant statistics update correctly
  const assessRes = await fetch(`${baseUrl}/api/profiles/${mayaId}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assessmentId: 'assess-bio-photosynthesis',
      correct: 3,
      total: 4,
      clearedConcepts: ['Light-Dependent Reactions', 'Photolysis & Oxygen Generation'],
      weakConcepts: ['Calvin Cycle Intermediate Steps'],
      subjectName: 'Photosynthesis & Bioenergetics',
    }),
  });
  assert.equal(assessRes.status, 200);
  const updatedAssessData = await assessRes.json();
  const updatedAnalytics = updatedAssessData.updatedAnalytics;

  assert.equal(updatedAnalytics.assessmentsTaken, 1);
  assert.equal(updatedAnalytics.examinationsIn, 1);
  assert.equal(updatedAnalytics.questionsSolved, 4);
  assert.equal(updatedAnalytics.averageAccuracy, 75); // 3 / 4 = 75%
  assert.equal(updatedAnalytics.recoveredConcepts, 2);
  assert.equal(updatedAnalytics.recentlyCleared, 2);
  assert.equal(updatedAnalytics.hiddenWeaknesses, '1 Identified');
  assert.ok(updatedAnalytics.knowledgeMastery.includes('75%'));
  assert.notEqual(updatedAnalytics.knowledgeMastery, 'NOT YET IDENTIFIED');
  assert.notEqual(updatedAnalytics.learningInsights, 'NOT YET IDENTIFIED');

  // Step 5 & 6: Ask the AI Tutor a question about photosynthesis -> verify title becomes "Understanding Photosynthesis"
  const chatCreateRes = await fetch(`${baseUrl}/api/profiles/${mayaId}/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: 'Biology & Bioenergetics' }),
  });
  assert.equal(chatCreateRes.status, 201);
  const conv = await chatCreateRes.json();
  const chatId = conv.id;

  const msg1Res = await fetch(`${baseUrl}/api/profiles/${mayaId}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Explain photosynthesis in simple words',
      subject: 'Biology & Bioenergetics',
    }),
  });
  assert.equal(msg1Res.status, 200);
  const msg1Data = await msg1Res.json();
  assert.equal(msg1Data.generatedTitle, 'Understanding Photosynthesis');
  assert.equal(msg1Data.conversation.title, 'Understanding Photosynthesis');

  // Step 7: Ask follow-up questions and verify the original title remains relevant (does not overwrite)
  const msg2Res = await fetch(`${baseUrl}/api/profiles/${mayaId}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'What is the role of ATP synthase in this process?',
      subject: 'Biology & Bioenergetics',
    }),
  });
  assert.equal(msg2Res.status, 200);
  const msg2Data = await msg2Res.json();
  assert.equal(msg2Data.conversation.title, 'Understanding Photosynthesis');
  assert.equal(msg2Data.conversation.messages.length, 4); // 2 student msgs, 2 tutor responses

  // Step 8: Rename a chat and verify the new title persists
  const renameRes = await fetch(`${baseUrl}/api/profiles/${mayaId}/chats/${chatId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Mastering Plant Bioenergetics' }),
  });
  assert.equal(renameRes.status, 200);
  const renamedConv = await renameRes.json();
  assert.equal(renamedConv.title, 'Mastering Plant Bioenergetics');

  // Step 9: Switch to another profile (Alex Morgan) and verify statistics and chat titles remain independent
  const alexChatsRes = await fetch(`${baseUrl}/api/profiles/profile-alex-morgan/chats`);
  assert.equal(alexChatsRes.status, 200);
  const alexChats = await alexChatsRes.json();

  // Alex Morgan's chats must not contain Maya's chat
  assert.ok(!alexChats.some((c: any) => c.id === chatId));
  assert.ok(alexChats.some((c: any) => c.title === 'Core Foundations Breakdown'));

  // Step 10: Refresh and reload all data to verify persistence
  const getMayaRes = await fetch(`${baseUrl}/api/profiles/${mayaId}`);
  assert.equal(getMayaRes.status, 200);
  const reloadedMaya = await getMayaRes.json();
  assert.equal(reloadedMaya.analytics.assessmentsTaken, 1);
  assert.equal(reloadedMaya.analytics.averageAccuracy, 75);

  const getMayaChatsRes = await fetch(`${baseUrl}/api/profiles/${mayaId}/chats`);
  const reloadedMayaChats = await getMayaChatsRes.json();
  assert.equal(reloadedMayaChats.length, 1);
  assert.equal(reloadedMayaChats[0].title, 'Mastering Plant Bioenergetics');
});
