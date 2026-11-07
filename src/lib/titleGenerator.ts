/**
 * Title generator for AGARAM AI Tutor conversations.
 * Rules:
 * - Concise, 3-7 words
 * - Based on actual conversation content and domain concepts
 * - No generic titles (e.g., "New Chat", "Chat 1", "Untitled")
 * - Resilient fallback from student prompt
 */

interface TitleMapRule {
  pattern: RegExp;
  title: string;
}

const CANONICAL_RULES: TitleMapRule[] = [
  { pattern: /photosynthesis/i, title: 'Understanding Photosynthesis' },
  { pattern: /quadratic\s+equations?/i, title: 'Solving Quadratic Equations' },
  { pattern: /newton'?s?(\s+three)?\s+laws?/i, title: "Newton's Laws of Motion" },
  { pattern: /ram\s+(and|vs|versus|\/)\s+rom/i, title: 'RAM vs ROM' },
  { pattern: /difference\s+between\s+ram\s+and\s+rom/i, title: 'RAM vs ROM' },
  { pattern: /integration|calculus\s+integral/i, title: 'Introduction to Integration' },
  { pattern: /human\s+digestive\s+system|digestion/i, title: 'Human Digestive System' },
  { pattern: /python\s+loops?|for\s+loop.*python|while\s+loop.*python/i, title: 'Python Loop Practice' },
  { pattern: /binary\s+search(\s+tree)?/i, title: 'Binary Search Fundamentals' },
  { pattern: /cell\s+respiration|cellular\s+respiration/i, title: 'Cellular Respiration Concepts' },
  { pattern: /recursion|recursive\s+functions?/i, title: 'Recursive Algorithms Mastery' },
  { pattern: /database\s+normalization|1nf|2nf|3nf/i, title: 'Database Normalization Guide' },
  { pattern: /mitochondria|powerhouse/i, title: 'Mitochondrial Energy Systems' },
  { pattern: /thermodynamics/i, title: 'Laws of Thermodynamics' },
  { pattern: /electromagnetism|magnetic\s+field/i, title: 'Electromagnetism Principles' },
  { pattern: /core\s+foundations/i, title: 'Core Foundations Breakdown' },
];

export function generateChatTitle(firstQuestion: string, tutorResponse?: string): string {
  if (!firstQuestion || !firstQuestion.trim()) {
    return 'General Learning Inquiry';
  }

  const cleanQuestion = firstQuestion.trim();

  // 1. Check canonical and domain-specific topic matches
  for (const rule of CANONICAL_RULES) {
    if (rule.pattern.test(cleanQuestion)) {
      return rule.title;
    }
  }

  // Also check if tutor response mentions a specific canonical topic
  if (tutorResponse) {
    for (const rule of CANONICAL_RULES) {
      if (rule.pattern.test(tutorResponse) && rule.pattern.test(cleanQuestion)) {
        return rule.title;
      }
    }
  }

  // 2. Extract key topic by removing query prefix fillers
  let topic = cleanQuestion
    .replace(/^(\s*hi|\s*hello|\s*hey|\s*please)\b[,!.\s]*/i, '')
    .replace(/^(can\s+you\s+explain|could\s+you\s+explain|explain\s+to\s+me|explain)\s+/i, '')
    .replace(/^(help\s+me\s+understand|help\s+me\s+with|help\s+me\s+solve)\s+/i, '')
    .replace(/^(how\s+do\s+i\s+solve|how\s+to\s+solve|how\s+do\s+i|how\s+to)\s+/i, '')
    .replace(/^(what\s+is\s+the\s+difference\s+between|what\s+is|what\s+are|what\s+does)\s+/i, '')
    .replace(/^(give\s+me\s+\d+\s+questions\s+on|give\s+me\s+questions\s+on|practice\s+questions\s+on)\s+/i, '')
    .replace(/^(tell\s+me\s+about|teach\s+me\s+about|teach\s+me)\s+/i, '')
    .replace(/in\s+simple\s+words.*$/i, '')
    .replace(/in\s+simple\s+terms.*$/i, '')
    .replace(/step\s+by\s+step.*$/i, '')
    .replace(/[?!.]+$/g, '')
    .trim();

  // If question was "Give me 10 questions on Python loops", topic becomes "Python loops"
  // Let's add action prefix if intent was questions/practice or explanation
  const isPractice = /questions|quiz|exercise|practice|problems/i.test(firstQuestion);
  const isComparison = /difference\s+between|compare|vs\b/i.test(firstQuestion);
  const isSolving = /how\s+to\s+solve|how\s+do\s+i\s+solve|solving/i.test(firstQuestion);

  if (topic.length === 0) {
    topic = cleanQuestion.slice(0, 30).trim();
  }

  // Capitalize words
  const words = topic
    .split(/\s+/)
    .filter(Boolean)
    .map((w, idx) => {
      const lower = w.toLowerCase();
      // Keep small prepositions/conjunctions lowercase unless first word
      if (idx > 0 && ['and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'the', 'a', 'an', 'vs'].includes(lower)) {
        return lower === 'vs' ? 'vs' : lower;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    });

  let generated = words.slice(0, 6).join(' ');

  if (isPractice && !/practice|questions|exercises/i.test(generated)) {
    generated = `${generated} Practice`;
  } else if (isSolving && !/solving|solution/i.test(generated)) {
    generated = `Solving ${generated}`;
  } else if (isComparison && !/vs|comparison/i.test(generated) && words.length <= 4) {
    generated = `Comparison of ${generated}`;
  }

  // Ensure word count is within 3-7 words
  const finalWords = generated.split(/\s+/).filter(Boolean);
  if (finalWords.length < 3) {
    if (/practice/i.test(generated)) {
      return `Topic ${generated}`;
    }
    return `Understanding ${generated}`;
  }
  if (finalWords.length > 7) {
    return finalWords.slice(0, 6).join(' ');
  }

  return generated;
}
