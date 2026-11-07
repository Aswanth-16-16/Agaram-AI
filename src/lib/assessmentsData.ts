import { AssessmentItem } from '../types.ts';

export const ASSESSMENTS: AssessmentItem[] = [
  {
    id: 'assess-bio-photosynthesis',
    title: 'Photosynthesis & Cellular Bioenergetics',
    subject: 'Biology',
    durationMinutes: 10,
    description: 'Verify understanding of light reactions, Calvin cycle, ATP synthesis, and chloroplast dynamics.',
    questions: [
      {
        id: 'q1',
        question: 'What is the primary role of chlorophyll molecules during the light-dependent reactions of photosynthesis?',
        options: [
          'To directly fix carbon dioxide into glucose molecules',
          'To absorb photon energy and excite electrons into the electron transport chain',
          'To convert pyruvate into acetyl-CoA',
          'To act as a structural cellular membrane barrier'
        ],
        correctIndex: 1,
        explanation: 'Chlorophyll pigments absorb photons (specifically blue and red wavelengths) to excite electrons, initiating photophosphorylation.',
        concept: 'Light-Dependent Reactions'
      },
      {
        id: 'q2',
        question: 'Where does the Calvin cycle take place within the chloroplast?',
        options: [
          'Inside the thylakoid lumen',
          'In the stroma fluid outside thylakoids',
          'Across the outer chloroplast membrane',
          'Within mitochondrial cristae'
        ],
        correctIndex: 1,
        explanation: 'The light-independent reactions (Calvin cycle) occur in the stroma, where NADPH and ATP reduce CO2 to G3P.',
        concept: 'Calvin Cycle'
      },
      {
        id: 'q3',
        question: 'During photolysis of water in Photosystem II, what essential byproduct is released into the atmosphere?',
        options: [
          'Molecular Oxygen (O2)',
          'Carbon Monoxide (CO)',
          'Methane (CH4)',
          'Ozone (O3)'
        ],
        correctIndex: 0,
        explanation: 'Water oxidation at the oxygen-evolving complex yields electrons, protons (H+), and molecular oxygen (O2).',
        concept: 'Photolysis & Oxygen Generation'
      },
      {
        id: 'q4',
        question: 'Which enzyme catalyzes the initial carbon fixation step by combining CO2 with Ribulose 1,5-bisphosphate?',
        options: [
          'DNA Polymerase III',
          'RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase)',
          'ATP Synthase',
          'Amylase'
        ],
        correctIndex: 1,
        explanation: 'RuBisCO is the primary catalyst for carbon fixation in photosynthetic organisms.',
        concept: 'Enzymatic Carbon Fixation'
      }
    ]
  },
  {
    id: 'assess-math-quadratics',
    title: 'Quadratic Equations & Polynomial Solutions',
    subject: 'Mathematics',
    durationMinutes: 12,
    description: 'Test techniques including factoring, completing the square, discriminant analysis, and the quadratic formula.',
    questions: [
      {
        id: 'q1',
        question: 'For a quadratic equation ax² + bx + c = 0, what does a discriminant (Δ = b² - 4ac) greater than zero indicate?',
        options: [
          'Two distinct real roots',
          'Exactly one repeated real root',
          'Two complex conjugate roots with non-zero imaginary parts',
          'No solutions exist in any number system'
        ],
        correctIndex: 0,
        explanation: 'When b² - 4ac > 0, the square root yields a positive real number, resulting in two distinct real roots.',
        concept: 'Discriminant Analysis'
      },
      {
        id: 'q2',
        question: 'What are the roots of the equation x² - 5x + 6 = 0?',
        options: [
          'x = -2 and x = -3',
          'x = 2 and x = 3',
          'x = 1 and x = 6',
          'x = -1 and x = -6'
        ],
        correctIndex: 1,
        explanation: '(x - 2)(x - 3) = 0 implies roots at x = 2 and x = 3.',
        concept: 'Factoring Quadratic Polynomials'
      },
      {
        id: 'q3',
        question: 'The vertex of the parabola described by y = 2(x - 3)² + 5 is situated at which coordinates?',
        options: [
          '(-3, 5)',
          '(3, 5)',
          '(3, -5)',
          '(6, 5)'
        ],
        correctIndex: 1,
        explanation: 'In vertex form y = a(x - h)² + k, the vertex is precisely (h, k), so (3, 5).',
        concept: 'Vertex Form & Parabolic Geometry'
      }
    ]
  },
  {
    id: 'assess-physics-newton',
    title: "Newton's Laws of Motion & Dynamics",
    subject: 'Physics',
    durationMinutes: 10,
    description: 'Foundations of inertia, acceleration, force interaction pairs, and conservation of momentum.',
    questions: [
      {
        id: 'q1',
        question: "Newton's First Law of Motion is also universally known as the law of:",
        options: [
          'Inertia',
          'Universal Gravitation',
          'Thermal Equilibrium',
          'Action and Reaction'
        ],
        correctIndex: 0,
        explanation: 'Newton’s First Law states that an object persists in its state of rest or uniform motion unless acted upon by a net external force (inertia).',
        concept: 'Inertia & Equilibrium'
      },
      {
        id: 'q2',
        question: 'A net force of 20 N acts on a mass of 4 kg. What is the resulting acceleration?',
        options: [
          '80 m/s²',
          '5 m/s²',
          '0.2 m/s²',
          '16 m/s²'
        ],
        correctIndex: 1,
        explanation: 'Using F = ma, a = F / m = 20 N / 4 kg = 5 m/s².',
        concept: 'Newtonian Second Law Calculation'
      },
      {
        id: 'q3',
        question: "According to Newton's Third Law, if a book rests on a table, the reaction force to Earth's gravitational pull on the book is:",
        options: [
          'The upward normal force of the table on the book',
          "The upward gravitational pull of the book on Earth",
          'The downward friction between table legs and the floor',
          'Air pressure exerting force downwards'
        ],
        correctIndex: 1,
        explanation: 'Action-reaction pairs act between the same two interacting bodies: Earth pulls book down, book pulls Earth up.',
        concept: 'Interaction Force Pairs'
      }
    ]
  },
  {
    id: 'assess-cs-memory',
    title: 'Computer Memory Architecture: RAM vs ROM',
    subject: 'Computer Science',
    durationMinutes: 8,
    description: 'Memory hierarchy, volatility, random access timing, and firmware execution.',
    questions: [
      {
        id: 'q1',
        question: 'What is the primary fundamental difference in data persistence between RAM and ROM?',
        options: [
          'RAM is volatile and loses data upon power loss, while ROM is non-volatile',
          'RAM can only be written once at factory manufacturing',
          'ROM is faster than L1 CPU cache',
          'RAM stores the BIOS/UEFI bootloader code permanently'
        ],
        correctIndex: 0,
        explanation: 'Random Access Memory (RAM) requires constant electrical power to maintain bit state, making it volatile, whereas ROM retains firmware permanently.',
        concept: 'Memory Volatility'
      },
      {
        id: 'q2',
        question: 'Why is DRAM (Dynamic RAM) periodically refreshed by memory controllers?',
        options: [
          'Because capacitors holding charge leak their electron states over milliseconds',
          'To synchronize clock cycles with the optical drive',
          'To clear all program variables every 10 seconds',
          'To prevent flash degradation wear'
        ],
        correctIndex: 0,
        explanation: 'DRAM cells store bits in minute microscopic capacitors that gradually discharge and must be refreshed thousands of times per second.',
        concept: 'DRAM Refresh Cycles'
      }
    ]
  }
];
