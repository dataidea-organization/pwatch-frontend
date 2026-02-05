'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchTrivia, Trivia, TriviaQuestion } from '@/lib/api';

export default function TriviaPlayPage() {
  const params = useParams();
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const id = (params?.id as string) ?? '';

  useEffect(() => {
    if (!id) {
      setError('Invalid trivia');
      setLoading(false);
      return;
    }
    fetchTrivia(id)
      .then((data) => {
        setTrivia(data);
        setCurrentIndex(0);
        setRevealed(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load trivia');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setRevealed(false);
  }, [currentIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
          <p className="mt-4 text-gray-600">Loading trivia...</p>
        </div>
      </div>
    );
  }

  if (error || !trivia) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-700 mb-4">{error ?? 'Trivia not found'}</p>
          <Link href="/citizens-voice">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Citizens Voice
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const questions: TriviaQuestion[] = trivia.questions ?? [];
  const total = questions.length;
  const hasQuestions = total > 0;
  const currentQuestion = hasQuestions ? questions[currentIndex] : null;
  const hasAnswer = currentQuestion?.answer_text?.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/citizens-voice"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2d5016] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Citizens Voice
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{trivia.title}</h1>
          {trivia.description && (
            <p className="text-gray-600 mt-1">{trivia.description}</p>
          )}
        </div>

        {!hasQuestions ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No questions in this trivia yet.</p>
            <Link href="/citizens-voice" className="mt-4 inline-block">
              <Button variant="outline">Back to Citizens Voice</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Question {currentIndex + 1} of {total}
              </span>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full w-2 transition-colors ${
                      i === currentIndex
                        ? 'bg-[#2d5016] w-4'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to question ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Card slide */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden min-h-[280px] flex flex-col">
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {currentQuestion?.question_text}
                </p>
                {hasAnswer && (
                  <div className="mt-6">
                    {!revealed ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRevealed(true)}
                        className="border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016]/10"
                      >
                        Reveal answer
                      </Button>
                    ) : (
                      <div className="p-4 bg-[#f5f0e8] rounded-lg border border-[#2d5016]/20">
                        <p className="text-sm font-medium text-gray-700 mb-1">Answer</p>
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {currentQuestion?.answer_text}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-[#fafaf8]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(total - 1, i + 1))
                  }
                  disabled={currentIndex === total - 1}
                  className="gap-2 bg-[#2d5016] hover:bg-[#1b3d26]"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
