"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClarifyingQuestion, QuestionAnswer } from "@/lib/types";
import { pickClarifyingString } from "@/lib/copy-strings";
import { useTypewriter } from "@/lib/use-typewriter";

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
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const card = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

type AnswerValue =
  | { option: string; no_preference?: undefined }
  | { option?: undefined; no_preference: true };

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-2xl p-6 space-y-4 border border-border-subtle/60">
      <div className="h-5 w-3/4 rounded-lg shimmer-bg" />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-28 rounded-xl shimmer-bg" />
        ))}
      </div>
    </div>
  );
}

function LoadingStringRotator() {
  const [text, setText] = useState(() => pickClarifyingString());
  const typed = useTypewriter(text, 10);

  useEffect(() => {
    // Hold 3.5s after typing finishes, then rotate.
    const id = window.setInterval(() => {
      setText((prev) => pickClarifyingString(prev));
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="h-7 mb-6 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-text-secondary"
        >
          {typed}
          {typed.length < text.length && <span className="typewriter-cursor" />}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function ClarifyingQuestions({
  questions,
  originalQuery,
  onContinue,
  isLoading,
}: ClarifyingQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  const selectAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { option } }));
  };

  const selectNoPreference = (questionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { no_preference: true } }));
  };

  const handleContinue = () => {
    const questionAnswers: QuestionAnswer[] = questions
      .filter((q) => answers[q.id])
      .map((q) => {
        const val = answers[q.id];
        if (val.no_preference) {
          return { question: q.question, answer: "no_preference", no_preference: true };
        }
        return { question: q.question, answer: val.option! };
      });
    onContinue(questionAnswers);
  };

  const handleSkip = () => {
    onContinue([]);
  };

  const hasAnyAnswer = Object.keys(answers).length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pt-8 pb-12">
      {/* Original query quote */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8 border-l-4 border-accent pl-4 py-1"
      >
        <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Your search</p>
        <p className="text-text-primary text-lg italic">&ldquo;{originalQuery}&rdquo;</p>
      </motion.div>

      {isLoading ? (
        <div>
          <LoadingStringRotator />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-2xl font-bold text-text-primary mb-6 tracking-tight"
          >
            A few quick questions to refine your results
          </motion.h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {questions.map((q) => {
              const answer = answers[q.id];
              const isNoPreference = answer?.no_preference === true;

              return (
                <motion.div
                  key={q.id}
                  variants={card}
                  className="bg-surface rounded-2xl p-6 border border-border-subtle/60"
                >
                  <p className="font-medium text-lg text-text-primary mb-4">
                    {q.question}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((option) => {
                      const isSelected = !isNoPreference && answer?.option === option;
                      return (
                        <motion.button
                          key={option}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => selectAnswer(q.id, option)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                            isSelected
                              ? "bg-accent text-white shadow-md shadow-accent/20"
                              : "bg-background border border-border-subtle text-text-secondary hover:border-accent hover:text-accent"
                          )}
                        >
                          {option}
                        </motion.button>
                      );
                    })}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => selectNoPreference(q.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        isNoPreference
                          ? "bg-background text-text-primary border border-text-secondary/40"
                          : "bg-background text-text-secondary hover:text-text-primary border border-dashed border-border-subtle hover:border-text-secondary/40"
                      )}
                    >
                      No preference
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              variants={card}
              className="flex items-center justify-between gap-4 pt-2"
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
                Search
              </Button>
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
}
