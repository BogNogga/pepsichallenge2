"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClarifyingQuestion, QuestionAnswer } from "@/lib/types";

interface ClarifyingQuestionsProps {
  questions: ClarifyingQuestion[];
  originalQuery: string;
  onContinue: (answers: QuestionAnswer[]) => void;
  isLoading: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const card = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-2xl p-6 space-y-4">
      <div className="h-5 w-3/4 rounded-lg shimmer-bg" />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-28 rounded-xl shimmer-bg" />
        ))}
      </div>
    </div>
  );
}

export default function ClarifyingQuestions({
  questions,
  originalQuery,
  onContinue,
  isLoading,
}: ClarifyingQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const selectAnswer = (questionId: string, question: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleContinue = () => {
    const questionAnswers: QuestionAnswer[] = questions
      .filter((q) => answers[q.id])
      .map((q) => ({ question: q.question, answer: answers[q.id] }));
    onContinue(questionAnswers);
  };

  const handleSkip = () => {
    onContinue([]);
  };

  const hasAnyAnswer = Object.keys(answers).length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      {/* Original query quote */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 border-l-4 border-accent pl-4 py-1"
      >
        <p className="text-text-secondary text-sm mb-1">Your search</p>
        <p className="text-text-primary text-lg italic">&ldquo;{originalQuery}&rdquo;</p>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-2xl font-bold text-text-primary mb-6"
      >
        A few quick questions to refine your results
      </motion.h2>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {questions.map((q) => (
            <motion.div
              key={q.id}
              variants={card}
              className="bg-surface rounded-2xl p-6"
            >
              <p className="font-medium text-lg text-text-primary mb-4">
                {q.question}
              </p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((option) => {
                  const isSelected = answers[q.id] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectAnswer(q.id, q.question, option)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                        isSelected
                          ? "bg-accent text-white shadow-md shadow-accent/20"
                          : "bg-background border border-border-subtle text-text-secondary hover:border-accent hover:text-accent"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          <motion.div
            variants={card}
            className="flex items-center justify-end gap-4 pt-4"
          >
            <button
              type="button"
              onClick={handleSkip}
              className="text-text-secondary hover:text-text-primary text-sm transition-colors underline underline-offset-4"
            >
              Skip all
            </button>
            <Button
              onClick={handleContinue}
              disabled={!hasAnyAnswer}
              className="bg-accent hover:bg-accent/90 text-white rounded-xl px-8 h-11 font-semibold disabled:opacity-40 transition-all"
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
