'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, ChevronLeft, ChevronRight, X, Link2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CitizensVoiceHero from '@/components/CitizensVoiceHero';
import { fetchTrivias, fetchTrivia, Trivia, TriviaQuestion } from '@/lib/api';

export default function TriviaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [trivias, setTrivias] = useState<Trivia[]>([]);
  const [triviaModalId, setTriviaModalId] = useState<number | null>(null);
  const [triviaModalData, setTriviaModalData] = useState<Trivia | null>(null);
  const [triviaModalLoading, setTriviaModalLoading] = useState(false);
  const [triviaModalError, setTriviaModalError] = useState<string | null>(null);
  const [triviaCurrentIndex, setTriviaCurrentIndex] = useState(0);
  const [triviaSelectedOptionId, setTriviaSelectedOptionId] = useState<number | null>(null);
  const [triviaRevealed, setTriviaRevealed] = useState(false);
  const [triviaResults, setTriviaResults] = useState<(boolean | null)[]>([]);
  const [triviaShowingResults, setTriviaShowingResults] = useState(false);
  const [triviaLinkCopiedId, setTriviaLinkCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchTrivias().then(setTrivias).catch(() => setTrivias([]));
  }, []);

  useEffect(() => {
    const triviaId = searchParams.get('trivia');
    if (triviaId) {
      const id = parseInt(triviaId, 10);
      if (!Number.isNaN(id)) {
        setTriviaModalId(id);
        router.replace('/citizens-voice/trivia', { scroll: false });
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!triviaModalId) {
      setTriviaModalData(null);
      setTriviaModalError(null);
      setTriviaCurrentIndex(0);
      setTriviaSelectedOptionId(null);
      setTriviaRevealed(false);
      setTriviaResults([]);
      setTriviaShowingResults(false);
      return;
    }
    setTriviaModalLoading(true);
    setTriviaModalError(null);
    setTriviaShowingResults(false);
    fetchTrivia(String(triviaModalId))
      .then((data) => {
        setTriviaModalData(data);
        setTriviaCurrentIndex(0);
        setTriviaSelectedOptionId(null);
        setTriviaRevealed(false);
        const len = data.questions?.length ?? 0;
        setTriviaResults(Array(len).fill(null));
      })
      .catch((err) => {
        setTriviaModalError(err instanceof Error ? err.message : 'Failed to load trivia');
      })
      .finally(() => setTriviaModalLoading(false));
  }, [triviaModalId]);

  useEffect(() => {
    setTriviaSelectedOptionId(null);
    setTriviaRevealed(false);
  }, [triviaCurrentIndex]);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="relative">
        <CitizensVoiceHero
          title="Trivia"
          subtitle="Test your knowledge with our trivia quizzes on parliamentary and governance topics."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-8">
          <Link
            href="/citizens-voice"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2d5016] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Citizens Voice
          </Link>

        {trivias.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No trivia available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trivias.map((trivia) => {
              const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/citizens-voice/trivia/${trivia.id}` : `/citizens-voice/trivia/${trivia.id}`;
              const copyLink = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(shareUrl).then(() => {
                  setTriviaLinkCopiedId(trivia.id);
                  setTimeout(() => setTriviaLinkCopiedId(null), 2000);
                });
              };
              return (
                <div
                  key={trivia.id}
                  className="relative rounded-xl border border-gray-200 overflow-hidden shadow-md transition-all hover:shadow-lg hover:border-[#2d5016]/30 aspect-[4/3] min-h-[240px] group"
                >
                  <button
                    type="button"
                    onClick={() => setTriviaModalId(trivia.id)}
                    className="absolute inset-0 w-full h-full text-left"
                  >
                    <span className="sr-only">Play {trivia.title}</span>
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] flex items-center justify-center overflow-hidden pointer-events-none">
                    {trivia.image ? (
                      <Image
                        src={trivia.image}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={trivia.image.startsWith('http')}
                      />
                    ) : (
                      <HelpCircle className="w-14 h-14 text-[#2d5016]/40 relative z-0" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" aria-hidden />
                  <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-3 pt-16 pointer-events-none">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/95 drop-shadow-md">
                      {trivia.title}
                    </h3>
                    {trivia.description && (
                      <p className="text-sm text-white/90 mb-2 line-clamp-2 drop-shadow-md">
                        {trivia.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className="text-sm font-medium text-[#a3e635] drop-shadow-md">
                        {trivia.question_count ?? trivia.questions?.length ?? 0} question{(trivia.question_count ?? trivia.questions?.length ?? 0) !== 1 ? 's' : ''} – Play
                      </span>
                      <button
                        type="button"
                        onClick={copyLink}
                        className="pointer-events-auto inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors shrink-0 drop-shadow-md"
                        title="Copy link to share this trivia"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        {triviaLinkCopiedId === trivia.id ? 'Link copied!' : 'Copy link'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trivia modal */}
        {triviaModalId !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setTriviaModalId(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trivia-modal-title"
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-200 flex-shrink-0">
                <h2 id="trivia-modal-title" className="text-lg font-semibold text-gray-900 truncate flex-1 min-w-0">
                  {triviaModalLoading ? 'Loading...' : triviaModalData?.title ?? 'Trivia'}
                </h2>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {triviaModalData && (
                    <button
                      type="button"
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? `${window.location.origin}/citizens-voice/trivia/${triviaModalId}` : `/citizens-voice/trivia/${triviaModalId}`;
                        navigator.clipboard.writeText(url).then(() => {
                          setTriviaLinkCopiedId(triviaModalId);
                          setTimeout(() => setTriviaLinkCopiedId(null), 2000);
                        });
                      }}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#2d5016] transition-colors"
                      title="Copy link to share"
                      aria-label="Copy link"
                    >
                      <Link2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setTriviaModalId(null)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {triviaModalLoading && (
                  <div className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]" />
                    <p className="mt-4 text-gray-600">Loading trivia...</p>
                  </div>
                )}
                {triviaModalError && (
                  <div className="py-8 text-center">
                    <p className="text-red-700 mb-4">{triviaModalError}</p>
                    <Button variant="outline" onClick={() => setTriviaModalId(null)}>
                      Close
                    </Button>
                  </div>
                )}
                {!triviaModalLoading && !triviaModalError && triviaModalData && (() => {
                  const questions: TriviaQuestion[] = triviaModalData.questions ?? [];
                  const total = questions.length;
                  const hasQuestions = total > 0;
                  const correctCount = triviaResults.filter((r) => r === true).length;

                  if (triviaShowingResults && hasQuestions) {
                    return (
                      <div className="py-6">
                        <div className="text-center mb-6">
                          <p className="text-2xl font-bold text-gray-900 mb-1">
                            You got {correctCount} out of {total} correct!
                          </p>
                          <p className="text-sm text-gray-600">
                            {correctCount === total ? 'Well done!' : correctCount >= total / 2 ? 'Good effort!' : 'Keep trying!'}
                          </p>
                        </div>
                        <ul className="space-y-2 mb-6">
                          {questions.map((q, i) => (
                            <li
                              key={q.id}
                              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-[#fafaf8]"
                            >
                              {triviaResults[i] === true ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : triviaResults[i] === false ? (
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <span className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400 text-xs">–</span>
                              )}
                              <span className="text-sm text-gray-900 line-clamp-2 flex-1">{q.question_text}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            type="button"
                            onClick={() => {
                              setTriviaCurrentIndex(0);
                              setTriviaSelectedOptionId(null);
                              setTriviaRevealed(false);
                              setTriviaResults(Array(total).fill(null));
                              setTriviaShowingResults(false);
                            }}
                            variant="outline"
                            className="border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016]/10"
                          >
                            Play again
                          </Button>
                          <Button type="button" onClick={() => setTriviaModalId(null)} className="bg-[#2d5016] hover:bg-[#1b3d26]">
                            Close
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  const currentQuestion = hasQuestions ? questions[triviaCurrentIndex] : null;
                  const hasOptions = currentQuestion?.options && currentQuestion.options.length > 0;
                  const hasAnswer = currentQuestion?.answer_text?.trim().length > 0;
                  const correctOption = hasOptions ? currentQuestion?.options.find(opt => opt.is_correct) : null;
                  const selectedOption = triviaSelectedOptionId && hasOptions ? currentQuestion?.options.find(opt => opt.id === triviaSelectedOptionId) : null;
                  const isCorrect = selectedOption?.is_correct ?? false;

                  if (!hasQuestions) {
                    return (
                      <div className="py-8 text-center">
                        <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No questions in this trivia yet.</p>
                        <Button variant="outline" onClick={() => setTriviaModalId(null)} className="mt-4">
                          Close
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-600">
                          Question {triviaCurrentIndex + 1} of {total}
                        </span>
                        <div className="flex gap-1">
                          {questions.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setTriviaCurrentIndex(i)}
                              className={`h-2 rounded-full w-2 transition-colors ${
                                i === triviaCurrentIndex ? 'bg-[#2d5016] w-4' : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                              aria-label={`Go to question ${i + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap mb-4">
                        {currentQuestion?.question_text}
                      </p>
                      {hasOptions && (
                        <div className="space-y-3 mb-4">
                          {currentQuestion.options.map((option) => {
                            const isSelected = triviaSelectedOptionId === option.id;
                            const showCorrect = triviaSelectedOptionId !== null;
                            const isCorrectOption = option.is_correct;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  if (triviaSelectedOptionId === null) {
                                    setTriviaSelectedOptionId(option.id);
                                    setTriviaResults((prev) => {
                                      const next = [...prev];
                                      next[triviaCurrentIndex] = option.is_correct;
                                      return next;
                                    });
                                  }
                                }}
                                disabled={triviaSelectedOptionId !== null}
                                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? isCorrectOption
                                      ? 'border-green-500 bg-green-50'
                                      : 'border-red-500 bg-red-50'
                                    : showCorrect && isCorrectOption
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-[#2d5016]/50 hover:bg-[#f5f0e8]'
                                } ${triviaSelectedOptionId !== null ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                    isSelected
                                      ? isCorrectOption ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100'
                                      : showCorrect && isCorrectOption ? 'border-green-500 bg-green-100' : 'border-gray-300'
                                  }`}>
                                    {isSelected && (isCorrectOption ? <CheckCircle className="w-3 h-3 text-green-600" /> : <XCircle className="w-3 h-3 text-red-600" />)}
                                    {!isSelected && showCorrect && isCorrectOption && <CheckCircle className="w-3 h-3 text-green-600" />}
                                  </div>
                                  <span className={`flex-1 text-sm text-gray-900 ${isSelected && !isCorrectOption ? 'line-through opacity-60' : ''}`}>
                                    {option.text}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {triviaSelectedOptionId !== null && hasOptions && (
                        <div className={`p-3 rounded-lg mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex items-start gap-3">
                            {isCorrect ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                {isCorrect ? 'Correct!' : 'Incorrect'}
                              </p>
                              {!isCorrect && correctOption && (
                                <p className="text-xs text-gray-700 mt-1">
                                  The correct answer is: <span className="font-semibold">{correctOption.text}</span>
                                </p>
                              )}
                              {hasAnswer && (
                                <p className="text-xs text-gray-700 mt-2 whitespace-pre-wrap">{currentQuestion?.answer_text}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {!hasOptions && hasAnswer && (
                        <div className="mt-4">
                          {!triviaRevealed ? (
                            <Button type="button" variant="outline" size="sm" onClick={() => setTriviaRevealed(true)} className="border-[#2d5016] text-[#2d5016]">
                              Reveal answer
                            </Button>
                          ) : (
                            <div className="p-3 bg-[#f5f0e8] rounded-lg border border-[#2d5016]/20 text-sm text-gray-900 whitespace-pre-wrap">
                              {currentQuestion?.answer_text}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              {!triviaModalLoading && !triviaModalError && triviaModalData && (triviaModalData.questions?.length ?? 0) > 0 && !triviaShowingResults && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-[#fafaf8] flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTriviaCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={triviaCurrentIndex === 0}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  {triviaCurrentIndex === (triviaModalData.questions?.length ?? 1) - 1 && triviaSelectedOptionId !== null ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setTriviaShowingResults(true)}
                      className="gap-1 bg-[#2d5016] hover:bg-[#1b3d26]"
                    >
                      See results
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setTriviaCurrentIndex((i) => Math.min((triviaModalData.questions?.length ?? 1) - 1, i + 1))}
                      disabled={triviaCurrentIndex === (triviaModalData.questions?.length ?? 1) - 1}
                      className="gap-1 bg-[#2d5016] hover:bg-[#1b3d26]"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
