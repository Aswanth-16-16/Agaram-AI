import test from 'node:test';
import assert from 'node:assert/strict';
import { generateChatTitle } from './titleGenerator.ts';

test('Title Generator matches prompt canonical examples', () => {
  assert.equal(
    generateChatTitle('Explain photosynthesis in simple words'),
    'Understanding Photosynthesis'
  );

  assert.equal(
    generateChatTitle('How do I solve quadratic equations?'),
    'Solving Quadratic Equations'
  );

  assert.equal(
    generateChatTitle("Explain Newton's three laws"),
    "Newton's Laws of Motion"
  );

  assert.equal(
    generateChatTitle('What is the difference between RAM and ROM?'),
    'RAM vs ROM'
  );

  assert.equal(
    generateChatTitle('Help me understand integration'),
    'Introduction to Integration'
  );

  assert.equal(
    generateChatTitle('Explain the human digestive system'),
    'Human Digestive System'
  );

  assert.equal(
    generateChatTitle('Give me 10 questions on Python loops'),
    'Python Loop Practice'
  );
});

test('Title Generator respects 3-7 words rule and avoids generic titles', () => {
  const genericList = ['New Chat', 'Chat 1', 'Conversation 1', 'Untitled'];
  const testQueries = [
    'Can you explain Dijkstra algorithm step by step?',
    'Teach me about cellular mitosis and meiosis',
    'How does bubble sort work in computer science?',
  ];

  for (const query of testQueries) {
    const title = generateChatTitle(query);
    assert.ok(!genericList.includes(title), `Title "${title}" must not be generic`);
    const wordCount = title.split(/\s+/).length;
    assert.ok(
      wordCount >= 3 && wordCount <= 7,
      `Word count of "${title}" (${wordCount}) should be between 3 and 7`
    );
  }
});
