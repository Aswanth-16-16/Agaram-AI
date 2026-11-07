import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';
import { StudentProfile, AssessmentItem } from '../types.ts';
import { ASSESSMENTS } from '../lib/assessmentsData.ts';

interface AssessmentsViewProps {
  activeProfile: StudentProfile;
  onAssessmentCompleted: (data: {
    assessmentId: string;
    correct: number;
    total: number;
    clearedConcepts: string[];
    weakConcepts: string[];
    subjectName: string;
  }) => Promise<void>;
  onNavigateToDashboard: () => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  activeProfile,
  onAssessmentCompleted,
  onNavigateToDashboard,
}) => {
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{
    correct: number;
    total: number;
    percent: number;
    clearedConcepts: string[];
    weakConcepts: string[];
  } | null>(null);

  const handleStart = (item: AssessmentItem) => {
    setSelectedAssessment(item);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResults(null);
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
  };

  const handleSubmit = async () => {
    if (!selectedAssessment || isSubmitting) return;

    let correctCount = 0;
    const cleared: string[] = [];
    const weak: string[] = [];

    selectedAssessment.questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      if (chosen === q.correctIndex) {
        correctCount++;
        cleared.push(q.concept);
      } else {
        weak.push(q.concept);
      }
    });

    const percent = Math.round((correctCount / selectedAssessment.questions.length) * 100);

    setIsSubmitting(true);
    try {
      await onAssessmentCompleted({
        assessmentId: selectedAssessment.id,
        correct: correctCount,
        total: selectedAssessment.questions.length,
        clearedConcepts: cleared,
        weakConcepts: weak,
        subjectName: selectedAssessment.title,
      });

      setResults({
        correct: correctCount,
        total: selectedAssessment.questions.length,
        percent,
        clearedConcepts: cleared,
        weakConcepts: weak,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (results && selectedAssessment) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white flex flex-col items-center justify-center">
        <div className="w-full max-w-xl bg-[#0F141D] border border-[#20293B] rounded-2xl p-6 md:p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#00E5A3] flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Assessment Completed!</h2>
            <p className="text-xs text-[#8090A4] mt-1">{selectedAssessment.title}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#090C12] border border-[#1A2230] grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-[#637286] uppercase font-bold">Accuracy</span>
              <div className="text-2xl font-black text-[#00E5A3] font-mono mt-0.5">
                {results.percent}%
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#637286] uppercase font-bold">Correct</span>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                {results.correct} / {results.total}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#637286] uppercase font-bold">Cleared</span>
              <div className="text-2xl font-black text-[#FF681F] font-mono mt-0.5">
                {results.clearedConcepts.length}
              </div>
            </div>
          </div>

          {/* Database verification banner */}
          <div className="p-3.5 rounded-xl bg-[#141A25] border border-[#232D3F] text-left text-xs text-[#8D9BB0] space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF681F]" />
              <span>Database Updated Automatically:</span>
            </div>
            <p>
              • Assessments Taken: updated from {activeProfile.analytics.assessmentsTaken - 1} to{' '}
              <strong className="text-white">{activeProfile.analytics.assessmentsTaken}</strong>
            </p>
            <p>
              • Average Accuracy: updated to{' '}
              <strong className="text-[#00E5A3]">{activeProfile.analytics.averageAccuracy}%</strong>
            </p>
            <p>
              • Knowledge Mastery: updated from NOT YET IDENTIFIED to{' '}
              <strong className="text-white">{activeProfile.analytics.knowledgeMastery}</strong>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedAssessment(null);
                setResults(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#171E2B] hover:bg-[#20293A] border border-[#263145] text-xs font-semibold text-white transition-all cursor-pointer"
            >
              Take Another Assessment
            </button>
            <button
              onClick={onNavigateToDashboard}
              className="px-5 py-2.5 rounded-xl bg-[#FF681F] hover:bg-[#FF7A38] text-xs font-bold text-white shadow-lg shadow-orange-950/40 transition-all cursor-pointer"
            >
              View Updated Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedAssessment) {
    const q = selectedAssessment.questions[currentQuestionIndex];
    const totalQ = selectedAssessment.questions.length;
    const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-[#0F141D] border border-[#20293B] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1A2230]">
            <div>
              <span className="text-[10px] font-bold text-[#FF681F] tracking-widest uppercase">
                {selectedAssessment.subject}
              </span>
              <h2 className="text-lg font-bold text-white">{selectedAssessment.title}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8A98AC]">
              <Clock className="w-4 h-4 text-[#38BDF8]" />
              <span>Question {currentQuestionIndex + 1} of {totalQ}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#171E2B] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF681F] to-[#FF5100] transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQ) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="py-2">
            <p className="text-base md:text-lg font-semibold text-white leading-relaxed">
              {q.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, oidx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === oidx;
              return (
                <button
                  key={oidx}
                  onClick={() => handleSelectOption(oidx)}
                  className={`w-full p-4 rounded-xl border text-left text-xs md:text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#182130] border-[#FF681F] text-white shadow-md'
                      : 'bg-[#0B0E14] border-[#1C2330] hover:border-[#2C384B] hover:bg-[#111620] text-[#B0BCCF]'
                  }`}
                >
                  <span>{opt}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-[#FF681F] bg-[#FF681F]'
                        : 'border-[#303B4E]'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1A2230]">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              className="px-4 py-2 rounded-xl bg-[#171E2B] text-xs font-semibold text-[#8B98AD] hover:text-white disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>

            {currentQuestionIndex < totalQ - 1 ? (
              <button
                disabled={!isAnswered}
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="px-5 py-2 rounded-xl bg-[#FF681F] hover:bg-[#FF7A38] text-xs font-bold text-white disabled:opacity-40 cursor-pointer shadow-md"
              >
                Next Question
              </button>
            ) : (
              <button
                disabled={!isAnswered || isSubmitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-xs font-bold text-white disabled:opacity-40 cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080A0D] bg-grid-pattern text-white space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1B2230]">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Examinations & Academic Assessments
          </h1>
          <p className="text-xs md:text-sm text-[#7D8C9F] mt-1">
            Complete real diagnostic assessments to verify concepts and evolve your student database metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ASSESSMENTS.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-[#0F141D] border border-[#1E2738] hover:border-[#2D394E] flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#1A2230] border border-[#273245] text-[10px] font-bold text-[#FF681F] uppercase">
                  {item.subject}
                </span>
                <span className="text-xs text-[#707E91] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {item.durationMinutes} mins
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-[#8090A4] leading-relaxed mb-4">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#18202D] flex items-center justify-between">
              <span className="text-xs text-[#5D6B7E]">
                {item.questions.length} questions
              </span>
              <button
                onClick={() => handleStart(item)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF681F] hover:bg-[#FF7A38] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
