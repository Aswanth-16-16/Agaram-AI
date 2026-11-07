import express, { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { HindsightClient } from '@vectorize-io/hindsight-client';
import {
  StudentProfile,
  ChatConversation,
  ChatMessage,
  AssessmentItem,
} from './src/types.ts';
import {
  createNewStudentProfile,
  applyAssessmentCompletion,
} from './src/lib/analytics.ts';
import { generateChatTitle } from './src/lib/titleGenerator.ts';
import { ASSESSMENTS } from './src/lib/assessmentsData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'data', 'agaram-db.json');

// Initialize Gemini SDK if API key available
const geminiApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  ? process.env.GEMINI_API_KEY
  : undefined;
const aiClient = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// Initialize Hindsight Cloud Memory Client if configured
const hindsightApiKey = process.env.HINDSIGHT_API_KEY && process.env.HINDSIGHT_API_KEY !== 'MY_HINDSIGHT_API_KEY'
  ? process.env.HINDSIGHT_API_KEY
  : undefined;
const hindsightBaseUrl = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';
const hindsightEnabled = process.env.HINDSIGHT_ENABLED === 'true';

let hindsight: HindsightClient | null = null;
if (hindsightApiKey && hindsightEnabled) {
  try {
    hindsight = new HindsightClient({
      apiKey: hindsightApiKey,
      baseUrl: hindsightBaseUrl,
    });
  } catch (err) {
    console.warn('Hindsight client init notice:', err);
  }
}

interface DatabaseSchema {
  profiles: StudentProfile[];
  conversations: Record<string, ChatConversation[]>; // Keyed by profileId
}

function getInitialDatabase(): DatabaseSchema {
  const alexProfile: StudentProfile = {
    id: 'profile-alex-morgan',
    name: 'Alex Morgan',
    course: 'B.Tech Computer Science & Engineering',
    academicLevel: 'University / School',
    voicePersona: 'male',
    avatarColor: 'from-orange-500 to-amber-600',
    createdAt: '2026-10-01T08:00:00.000Z',
    analytics: {
      examinationsIn: 4,
      assessmentsTaken: 12,
      averageAccuracy: 84,
      questionsSolved: 148,
      recoveredConcepts: 8,
      hiddenWeaknesses: '2 Identified',
      hiddenWeaknessesList: [
        'Cache Invalidation in Distributed Systems',
        'Time Complexity of Recursive Backtracking',
      ],
      recentlyCleared: 3,
      learningProgress: 68,
      studyStreak: 7,
      completedLessons: 24,
      totalStudyTime: 420,
      communityPoints: 1450,
      achievements: 6,
      knowledgeMastery: 'Proficient (76%)',
      knowledgeMasteryScore: 76,
      learningInsights: 'Excels at algorithmic logic; requires consolidation on concurrency primitives.',
      revisionProgress: 62,
      strongestSubject: 'Computer Science',
      learningPace: 'Accelerated',
      bestStudyWindow: 'Evening (18:00 - 21:00)',
    },
  };

  const mayaProfile: StudentProfile = {
    id: 'profile-maya-patel',
    name: 'Maya Patel',
    course: 'Data Science 101',
    academicLevel: 'University / School',
    voicePersona: 'female',
    avatarColor: 'from-amber-600 to-orange-700',
    createdAt: '2026-11-01T10:00:00.000Z',
    analytics: {
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
    },
  };

  const alexConversations: ChatConversation[] = [
    {
      id: 'conv-alex-1',
      profileId: 'profile-alex-morgan',
      title: 'Core Foundations Breakdown',
      subject: 'Core Foundations',
      createdAt: '2026-11-06T14:20:00.000Z',
      updatedAt: '2026-11-06T14:25:00.000Z',
      isLockedTitle: true,
      messages: [
        {
          id: 'msg-alex-1',
          sender: 'student',
          text: 'Can you explain Core Foundations concepts in academic study?',
          timestamp: '2026-11-06T14:20:00.000Z',
        },
        {
          id: 'msg-alex-2',
          sender: 'tutor',
          text: `Core Foundations in academic study typically refers to the fundamental principles that govern a specific discipline. In an undergraduate context, these are the essential pillars—concepts, theories, and methodologies—upon which advanced knowledge is built. These principles are characterized by universality, foundational utility, and logical consistency. Mastery of these foundations allows for the analysis of complex problems by breaking them down into their most basic, verifiable components.\n\n1. First Principles Thinking: Deconstructing complex problems into basic truths.\n2. Logical Consistency: Ensuring axioms do not contradict each other.\n3. Scalability: Principles must hold true across different scales.\n4. Empirical Verifiability: Foundations must be observable or mathematically provable.`,
          timestamp: '2026-11-06T14:20:05.000Z',
          suggestedActions: [
            'APPLY FIRST PRINCIPLES TO A PROBLEM',
            'SHOW AN EXAMPLE OF FOUNDATIONAL AXIOMS',
            'PRACTICE A CONCEPT MAPPING EXERCISE',
          ],
          relatedConcepts: [
            'First Principles Thinking',
            'Epistemology',
            'Axiomatic Systems',
            'Structural Analysis',
          ],
        },
      ],
    },
  ];

  return {
    profiles: [alexProfile, mayaProfile],
    conversations: {
      'profile-alex-morgan': alexConversations,
      'profile-maya-patel': [],
    },
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.profiles)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading database file, using fallback initial data:', err);
  }

  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}

let db = loadDatabase();

export async function createServer() {
  const app = express();
  app.use(express.json());

  // Log all API requests
  app.use('/api', (req, res, next) => {
    next();
  });

  // ==========================================
  // PROFILE ENDPOINTS
  // ==========================================

  // Get all profiles
  app.get('/api/profiles', (req: Request, res: Response) => {
    res.json(db.profiles);
  });

  // Create new profile with initialized database metrics
  app.post('/api/profiles', (req: Request, res: Response) => {
    const { name, course, academicLevel, voicePersona } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Profile name is required' });
    }

    const newProfile = createNewStudentProfile({
      name,
      course: course || 'General Studies',
      academicLevel: academicLevel || 'University / School',
      voicePersona: voicePersona || 'male',
    });

    db.profiles.push(newProfile);
    db.conversations[newProfile.id] = [];
    saveDatabase(db);

    res.status(201).json(newProfile);
  });

  // Get single profile
  app.get('/api/profiles/:id', (req: Request, res: Response) => {
    const profile = db.profiles.find((p) => p.id === req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  });

  // Update profile preferences
  app.put('/api/profiles/:id', (req: Request, res: Response) => {
    const profile = db.profiles.find((p) => p.id === req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { name, course, academicLevel, voicePersona } = req.body;
    if (name) profile.name = name.trim();
    if (course) profile.course = course.trim();
    if (academicLevel) profile.academicLevel = academicLevel.trim();
    if (voicePersona) profile.voicePersona = voicePersona;

    saveDatabase(db);
    res.json(profile);
  });

  // Delete profile
  app.delete('/api/profiles/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    db.profiles = db.profiles.filter((p) => p.id !== id);
    delete db.conversations[id];
    saveDatabase(db);
    res.json({ success: true, deletedId: id });
  });

  // ==========================================
  // CHAT CONVERSATION ENDPOINTS (Profile-Specific)
  // ==========================================

  // Get conversations for a specific profile UUID
  app.get('/api/profiles/:id/chats', (req: Request, res: Response) => {
    const profileId = req.params.id;
    const profileChats = db.conversations[profileId] || [];
    res.json(profileChats);
  });

  // Create new conversation (with temporary internal ID)
  app.post('/api/profiles/:id/chats', (req: Request, res: Response) => {
    const profileId = req.params.id;
    const profile = db.profiles.find((p) => p.id === profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const tempId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const subject = req.body.subject || 'Core Foundations';

    const newConv: ChatConversation = {
      id: tempId,
      profileId: profileId,
      title: 'New Conversation',
      subject: subject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      isLockedTitle: false,
    };

    if (!db.conversations[profileId]) {
      db.conversations[profileId] = [];
    }
    db.conversations[profileId].unshift(newConv);
    saveDatabase(db);

    res.status(201).json(newConv);
  });

  // Rename or update a conversation
  app.put('/api/profiles/:id/chats/:chatId', (req: Request, res: Response) => {
    const { id: profileId, chatId } = req.params;
    const list = db.conversations[profileId];
    if (!list) return res.status(404).json({ error: 'Profile conversations not found' });

    const conv = list.find((c) => c.id === chatId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    if (req.body.title && req.body.title.trim()) {
      conv.title = req.body.title.trim();
      conv.isCustomNamed = true;
      conv.isLockedTitle = true;
    }
    if (req.body.subject) {
      conv.subject = req.body.subject;
    }
    conv.updatedAt = new Date().toISOString();

    saveDatabase(db);
    res.json(conv);
  });

  // Delete a conversation
  app.delete('/api/profiles/:id/chats/:chatId', (req: Request, res: Response) => {
    const { id: profileId, chatId } = req.params;
    if (!db.conversations[profileId]) {
      return res.status(404).json({ error: 'Profile conversations not found' });
    }

    db.conversations[profileId] = db.conversations[profileId].filter((c) => c.id !== chatId);
    saveDatabase(db);
    res.json({ success: true, deletedChatId: chatId });
  });

  // Send message & generate AI response + automatic title generation
  app.post('/api/profiles/:id/chats/:chatId/messages', async (req: Request, res: Response) => {
    const { id: profileId, chatId } = req.params;
    const { text, subject } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const profile = db.profiles.find((p) => p.id === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (!db.conversations[profileId]) {
      db.conversations[profileId] = [];
    }

    let conv = db.conversations[profileId].find((c) => c.id === chatId);
    if (!conv) {
      // Auto-create if temporary internal ID
      conv = {
        id: chatId,
        profileId,
        title: 'New Conversation',
        subject: subject || 'Core Foundations',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        isLockedTitle: false,
      };
      db.conversations[profileId].unshift(conv);
    }

    const studentMessage: ChatMessage = {
      id: `msg_std_${Date.now()}`,
      sender: 'student',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    conv.messages.push(studentMessage);

    // ==========================================
    // TITLE GENERATION (Turn 1: After first meaningful question)
    // ==========================================
    const isFirstQuestion = conv.messages.filter((m) => m.sender === 'student').length === 1;

    if (isFirstQuestion && !conv.isCustomNamed && !conv.isLockedTitle) {
      try {
        const initialGeneratedTitle = generateChatTitle(text.trim());
        conv.title = initialGeneratedTitle;
      } catch (err) {
        console.error('Error in initial title generation:', err);
      }
    }

    // ==========================================
    // AI TUTOR RESPONSE GENERATION
    // ==========================================
    let tutorText = '';
    let suggestedActions: string[] = [];
    let relatedConcepts: string[] = [];

    // Attempt Gemini API if client configured
    if (aiClient) {
      try {
        const prompt = `You are AGARAM, an elite AI Academic Tutor specialized in adaptive first-principles pedagogy.
The student profile: ${profile.name}, Academic Level: ${profile.academicLevel}, Major: ${profile.course}.
Topic/Subject: ${conv.subject || 'General Studies'}.
Student Question: "${text.trim()}"

Provide a structured, deep, yet clear academic response:
1. Direct high-level answer and conceptual framing.
2. 3-4 numbered first-principles breakdown points.
3. If relevant, a code snippet or mathematical formulation in a markdown block.
Keep tone encouraging, rigorous, and clear.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response && response.text) {
          tutorText = response.text;
        }
      } catch (err) {
        console.warn('Gemini generateContent call fell back to pedagogical rule engine:', err);
      }
    }

    // Fallback pedagogical generator if Gemini is not available or threw error
    if (!tutorText) {
      const q = text.toLowerCase();
      if (q.includes('photosynthesis')) {
        tutorText = `Photosynthesis is the fundamental biological process by which autotrophic organisms (plants, algae, and cyanobacteria) convert light energy into chemical energy stored in carbohydrate bonds.\n\n` +
          `1. Light-Dependent Reactions: Photons strike Photosystem II and I in the thylakoid membranes, exciting electrons and splitting H2O to release oxygen (O2) and generate ATP and NADPH.\n` +
          `2. Calvin Cycle (Light-Independent): In the stroma, RuBisCO catalyzes the fixation of atmospheric CO2 onto ribulose-1,5-bisphosphate, utilizing ATP and NADPH to synthesize glyceraldehyde 3-phosphate (G3P).\n` +
          `3. Net Biochemical Equation:\n   6 CO2 + 6 H2O + Light Energy → C6H12O6 + 6 O2\n` +
          `4. Energetic Efficiency: Converts approximately 1–2% of incident solar radiation into plant biomass, providing the foundational energy source for terrestrial ecosystems.`;
        suggestedActions = [
          'BREAK DOWN THE CALVIN CYCLE STEP BY STEP',
          'COMPARE C3, C4, AND CAM PHOTOSYNTHESIS',
          'TAKE BIOENERGETICS ASSESSMENT QUIZ',
        ];
        relatedConcepts = [
          'Photophosphorylation',
          'Thylakoid Dynamics',
          'RuBisCO Kinetics',
          'Cellular Respiration',
        ];
      } else if (q.includes('quadratic')) {
        tutorText = `A quadratic equation is a second-order polynomial equation of the canonical form ax² + bx + c = 0, where a ≠ 0.\n\n` +
          `1. The Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)\n` +
          `2. The Discriminant (Δ = b² - 4ac):\n   - If Δ > 0: Two distinct real solutions.\n   - If Δ = 0: Exactly one repeated real root (vertex on axis).\n   - If Δ < 0: Conjugate complex solutions.\n` +
          `3. Factoring Technique: When expressions decompose cleanly into (x - p)(x - q) = 0, roots are immediately identifiable via the zero-product property.\n` +
          `4. Parabolic Geometry: The graph forms a parabola with vertex at x = -b / (2a).`;
        suggestedActions = [
          'SOLVE A SAMPLE QUADRATIC WITH FRACTIONS',
          'VISUALIZE PARABOLIC VERTEX SHIFT',
          'PRACTICE DERIVATION OF THE QUADRATIC FORMULA',
        ];
        relatedConcepts = [
          'Polynomial Factorization',
          'Discriminant Analysis',
          'Completing the Square',
          'Parabolic Trajectories',
        ];
      } else if (q.includes('newton')) {
        tutorText = `Sir Isaac Newton formulated the three classical laws of motion, which define how forces govern the dynamics of physical objects in classical mechanics.\n\n` +
          `1. First Law (Law of Inertia): An object remains at rest or continues in uniform motion in a straight line unless acted upon by a non-zero net external force (ΣF = 0 ⟹ dv/dt = 0).\n` +
          `2. Second Law (Fundamental Dynamics): The acceleration of an object is directly proportional to the net force acting upon it and inversely proportional to its mass:\n   ΣF = m · a = dp/dt\n` +
          `3. Third Law (Action and Reaction): When body A exerts a force on body B, body B simultaneously exerts an equal and opposite force on body A (F_AB = -F_BA).\n` +
          `4. Conservation of Momentum: In any closed, isolated system with zero external force, total vector momentum remains strictly invariant.`;
        suggestedActions = [
          'CALCULATE ACCELERATION WITH FRICTION',
          'SOLVE AN ATWOOD MACHINE PROBLEM',
          'REVIEW MOMENTUM CONSERVATION EXAMPLES',
        ];
        relatedConcepts = [
          'Inertial Reference Frames',
          'Vector Force Decomposition',
          'Impulse-Momentum Theorem',
          'Frictional Coefficients',
        ];
      } else if (q.includes('ram') && q.includes('rom')) {
        tutorText = `RAM (Random Access Memory) and ROM (Read-Only Memory) are both semiconductor primary storage technologies, but serve contrasting architectural functions.\n\n` +
          `1. Volatility: RAM is volatile (erased when electrical power is cut), while ROM is non-volatile (retains data indefinitely without power).\n` +
          `2. Read/Write Speed: RAM supports gigabytes-per-second symmetric read and write operations; ROM is either read-only or exhibits significantly slower write/erase cycles (EEPROM/Flash).\n` +
          `3. System Purpose: RAM hosts active running program instructions, stack frames, and operating system heap; ROM houses firmware (UEFI/BIOS, bootloaders, microcode).\n` +
          `4. Physical Density: DRAM achieves dense packing using single-transistor-single-capacitor cells; ROM cells are hardwired diode/transistor matrices or floating-gate cells.`;
        suggestedActions = [
          'COMPARE SRAM VS DRAM IN CACHE DESIGN',
          'TRACE THE UEFI BOOT PROCESS FROM ROM',
          'EXAMINE MEMORY BUS LATENCY TIMINGS',
        ];
        relatedConcepts = [
          'Memory Hierarchy',
          'Non-Volatile Storage',
          'Bootloader Architecture',
          'DRAM Refresh Cycles',
        ];
      } else if (q.includes('integration') || q.includes('integral')) {
        tutorText = `Integration in calculus is the mathematical counterpart to differentiation, representing the continuous accumulation of quantities over a domain.\n\n` +
          `1. Definite vs Indefinite: Indefinite integrals (∫ f(x) dx = F(x) + C) yield the family of antiderivatives; definite integrals calculate net signed area between limits [a, b].\n` +
          `2. Fundamental Theorem of Calculus: Links differentiation and integration:\n   d/dx [∫_{a}^{x} f(t) dt] = f(x) and ∫_{a}^{b} f(x) dx = F(b) - F(a)\n` +
          `3. Standard Techniques: Integration by Parts (∫ u dv = uv - ∫ v du), Substitution (u-substitution), Partial Fraction Decomposition, and Trigonometric Substitution.\n` +
          `4. Physical Interpretation: Integration computes displacement from velocity, work from force, center of mass, and probability density volumes.`;
        suggestedActions = [
          'WALKTHROUGH INTEGRATION BY PARTS FORMULA',
          'SHOW GAUSSIAN INTEGRAL APPROXIMATION',
          'PRACTICE U-SUBSTITUTION STEP BY STEP',
        ];
        relatedConcepts = [
          'Riemann Sums',
          'Fundamental Theorem of Calculus',
          'Antiderivative Families',
          'Improper Integrals',
        ];
      } else if (q.includes('digestive') || q.includes('digestion')) {
        tutorText = `The human digestive system is a specialized anatomical tract responsible for the mechanical breakdown, enzymatic hydrolysis, and nutrient absorption of food.\n\n` +
          `1. Ingestion and Oral Processing: Teeth perform mechanical mastication; salivary amylase initiates carbohydrate breakdown.\n` +
          `2. Gastric Acidification: The stomach secretes HCl (pH ~1.5–2.0) to denature proteins and activates pepsinogen into pepsin, producing chyme.\n` +
          `3. Small Intestine (Duodenum, Jejunum, Ileum): Pancreatic enzymes (trypsin, lipase) and liver bile emulsify lipids; microvilli maximize surface area (~30 m²) for nutrient uptake.\n` +
          `4. Large Intestine & Microbiome: Reabsorbs water and electrolytes, houses symbiotic gut microbiota synthesizing vitamins K and B, and consolidates waste.`;
        suggestedActions = [
          'DIAGRAM ENZYMATIC PATHWAYS OF PROTEIN DIGESTION',
          'EXPLAIN BILE SALT LIPID EMULSIFICATION',
          'EXPLORE GUT MICROBIOME METABOLIC ROLES',
        ];
        relatedConcepts = [
          'Peristalsis Mechanics',
          'Enzymatic Hydrolysis',
          'Villi & Nutrient Absorption',
          'Hepatic Portal Circulation',
        ];
      } else if (q.includes('python') && q.includes('loop')) {
        tutorText = `In Python, loops provide control flow iteration over sequences (lists, tuples, strings, dictionaries) or condition evaluation.\n\n` +
          `1. For Loops (Definite Iteration):\n\`\`\`python\nfor item in iterable:\n    process(item)\n\`\`\`\n` +
          `2. While Loops (Indefinite Iteration):\n\`\`\`python\nwhile condition:\n    execute_body()\n\`\`\`\n` +
          `3. Loop Control Statements: 'break' terminates loop immediately; 'continue' skips to the subsequent iteration; 'else' block executes when loop finishes without break.\n` +
          `4. Pythonic Idioms: Comprehensions \`[x*2 for x in data if x > 0]\` and generators provide vectorized-speed readable iteration over explicit counter loops.`;
        suggestedActions = [
          'PRACTICE 10 ITERATION EXERCISES',
          'DEBUG AN INFINITE WHILE LOOP',
          'COMPARE LIST COMPREHENSION PERFORMANCE',
        ];
        relatedConcepts = [
          'Iterator Protocol (__iter__, __next__)',
          'List Comprehensions',
          'Generator Expressions',
          'Enumerate & Zip Builtins',
        ];
      } else {
        tutorText = `Let's analyze "${text.trim()}" from first principles.\n\n` +
          `1. Core Definition: Deconstruct the problem into foundational axioms and verifiable components.\n` +
          `2. Structural Mechanics: Trace the cause-and-effect relationships and operational logic governing this topic.\n` +
          `3. Mathematical or Practical Analogy: Anchor the abstraction in real-world empirical examples.\n` +
          `4. Key Takeaway: Ensure synthesized understanding before applying to advanced examination questions.`;
        suggestedActions = [
          'APPLY FIRST PRINCIPLES TO A PROBLEM',
          'SHOW AN EXAMPLE OF FOUNDATIONAL AXIOMS',
          'PRACTICE A CONCEPT MAPPING EXERCISE',
        ];
        relatedConcepts = [
          'First Principles Thinking',
          'Conceptual Deconstruction',
          'Axiomatic Analysis',
          'Pedagogical Scaffolding',
        ];
      }
    }

    // Refine title if needed (Turn 2 refinement)
    if (isFirstQuestion && !conv.isCustomNamed && !conv.isLockedTitle) {
      const refinedTitle = generateChatTitle(text.trim(), tutorText);
      conv.title = refinedTitle;
      conv.isLockedTitle = true; // Lock so subsequent follow-ups don't overwrite title
    }

    const tutorMessage: ChatMessage = {
      id: `msg_tut_${Date.now()}`,
      sender: 'tutor',
      text: tutorText,
      timestamp: new Date().toISOString(),
      suggestedActions,
      relatedConcepts,
    };
    conv.messages.push(tutorMessage);
    conv.updatedAt = new Date().toISOString();

    saveDatabase(db);

    // Optional Hindsight cloud sync
    if (hindsight && hindsightEnabled) {
      try {
        const bankId = `agaram-${profileId}`;
        const memoryContent = `Student Question: ${text.trim()}\nTutor Response Summary: ${tutorText.slice(0, 300)}`;
        // Non-blocking background log
        hindsight.retain(bankId, memoryContent)
          .catch((e: any) => console.warn('Hindsight background sync notice:', e?.message || e));
      } catch (e) {
        // Safe ignore
      }
    }

    res.json({
      conversation: conv,
      tutorMessage,
      generatedTitle: conv.title,
    });
  });

  // ==========================================
  // ASSESSMENTS & EXAMINATIONS ENDPOINTS
  // ==========================================

  // Get list of available assessments
  app.get('/api/assessments', (req: Request, res: Response) => {
    res.json(ASSESSMENTS);
  });

  // Complete an assessment & update profile analytics in database
  app.post('/api/profiles/:id/assessments', (req: Request, res: Response) => {
    const profileId = req.params.id;
    const profile = db.profiles.find((p) => p.id === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const { assessmentId, correct, total, clearedConcepts, weakConcepts, subjectName } = req.body;

    if (typeof correct !== 'number' || typeof total !== 'number') {
      return res.status(400).json({ error: 'Correct and total counts must be numbers' });
    }

    profile.analytics = applyAssessmentCompletion(profile.analytics, {
      correct,
      total,
      clearedConcepts: clearedConcepts || [],
      weakConcepts: weakConcepts || [],
      subjectName: subjectName || 'Course Assessment',
    });

    saveDatabase(db);
    res.json({
      profile,
      updatedAnalytics: profile.analytics,
    });
  });

  // Hindsight status
  app.get('/api/hindsight/status', (req: Request, res: Response) => {
    res.json({
      configured: Boolean(hindsightApiKey),
      enabled: hindsightEnabled,
      baseUrl: hindsightBaseUrl,
    });
  });

  return app;
}

async function startServer() {
  const app = await createServer();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: false,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static build in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AGARAM Server running on http://0.0.0.0:${port}`);
  });
}

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMainModule && process.env.NODE_ENV !== 'test') {
  startServer();
}

