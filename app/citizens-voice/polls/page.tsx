'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Users, BarChart3 } from 'lucide-react';
import CitizensVoiceHero from '@/components/CitizensVoiceHero';
import { Button } from '@/components/ui/button';
import {
  fetchXPollEmbeds,
  XPollEmbed,
  voteOnPoll,
  fetchPollResults,
  Poll,
} from '@/lib/api';

declare global {
  interface Window {
    twttr?: {
      widgets: { load: (el?: HTMLElement) => void };
    };
  }
}

export default function PollsPage() {
  const [xPollEmbeds, setXPollEmbeds] = useState<XPollEmbed[]>([]);
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votedPolls, setVotedPolls] = useState<Set<number>>(new Set());
  const [pollResults, setPollResults] = useState<Record<number, any>>({});
  const [votingPollId, setVotingPollId] = useState<number | null>(null);
  const [twitterReady, setTwitterReady] = useState(false);

  useEffect(() => {
    loadAllPolls();
    fetchXPollEmbeds().then(setXPollEmbeds).catch(() => setXPollEmbeds([]));
  }, []);

  useEffect(() => {
    if (!twitterReady || xPollEmbeds.length === 0) return;
    const t = typeof window !== 'undefined' ? window.twttr : undefined;
    if (!t?.widgets?.load) return;
    const run = () => t.widgets.load();
    const id = setTimeout(run, 100);
    const id2 = setTimeout(run, 500);
    return () => {
      clearTimeout(id);
      clearTimeout(id2);
    };
  }, [twitterReady, xPollEmbeds.length]);

  const loadAllPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      let allResults: Poll[] = [];
      let currentPage = 1;
      let hasMore = true;
      while (hasMore) {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: '100',
        });
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/multimedia/polls/?${params}`
        );
        if (!response.ok) throw new Error('Failed to fetch polls');
        const data = await response.json();
        allResults = [...allResults, ...data.results];
        hasMore = data.next !== null;
        currentPage++;
      }
      setAllPolls(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: number, optionId: number) => {
    try {
      setVotingPollId(pollId);
      await voteOnPoll(pollId, optionId);
      setVotedPolls((prev) => new Set([...prev, pollId]));
      const results = await fetchPollResults(pollId);
      setPollResults((prev) => ({ ...prev, [pollId]: results }));
      setAllPolls((prev) =>
        prev.map((poll) => {
          if (poll.id !== pollId) return poll;
          const updatedPoll = { ...poll };
          updatedPoll.options = updatedPoll.options.map((opt) => {
            const r = results.results.find((x: any) => x.option_id === opt.id);
            return {
              ...opt,
              vote_count: r?.vote_count ?? opt.vote_count,
              vote_percentage: r?.percentage ?? opt.vote_percentage,
            };
          });
          updatedPoll.total_votes = results.total_votes;
          return updatedPoll;
        })
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setVotingPollId(null);
    }
  };

  const loadResults = async (pollId: number) => {
    if (pollResults[pollId]) return;
    try {
      const results = await fetchPollResults(pollId);
      setPollResults((prev) => ({ ...prev, [pollId]: results }));
    } catch (err) {
      console.error('Error loading results:', err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onLoad={() => setTwitterReady(true)}
      />
      <main className="relative">
        <CitizensVoiceHero
          title="Polls"
          subtitle="X (Twitter) polls and platform polls. Have your say on parliamentary and governance issues."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-8">
          <Link
            href="/citizens-voice"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2d5016] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Citizens Voice
          </Link>
        {/* X Polls */}
        {xPollEmbeds.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">X Polls</h2>
            <div className="flex flex-row flex-wrap justify-start gap-6">
              {xPollEmbeds.map((embed) => (
                <div
                  key={embed.id}
                  className="w-fit bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col items-center [&_.twitter-tweet]:!max-w-full [&_iframe]:!max-w-full"
                >
                  {embed.title && (
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 w-full">{embed.title}</h3>
                  )}
                  <div
                    className="x-poll-embed-content"
                    dangerouslySetInnerHTML={{ __html: embed.embed_html }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Platform Polls */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Polls</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]" />
              <p className="mt-4 text-gray-600">Loading polls...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <Button onClick={loadAllPolls} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : allPolls.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">No polls found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {allPolls.map((poll) => {
                const hasVoted = votedPolls.has(poll.id);
                const results = pollResults[poll.id];
                const showResults =
                  hasVoted || poll.show_results_before_voting || poll.status === 'closed';

                return (
                  <div
                    key={poll.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 flex-1">{poll.title}</h3>
                        {poll.featured && (
                          <span className="px-2 py-1 bg-[#2d5016] text-white text-xs font-medium rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      {poll.description && (
                        <p className="text-gray-600 text-sm mb-3">{poll.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {poll.category && (
                          <span className="px-2 py-1 bg-[#f5f0e8] rounded">{poll.category}</span>
                        )}
                        <div className="flex items-center gap-1">
                          {poll.is_active ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-green-600">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-gray-400" />
                              <span>{poll.status_display}</span>
                            </>
                          )}
                        </div>
                        {poll.total_votes > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{poll.total_votes} votes</span>
                          </div>
                        )}
                      </div>
                      {(poll.start_date || poll.end_date) && (
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                          {poll.start_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Starts: {formatDate(poll.start_date)}</span>
                            </div>
                          )}
                          {poll.end_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Ends: {formatDate(poll.end_date)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {poll.options.length === 0 ? (
                        <p className="text-gray-500 text-sm">No options available</p>
                      ) : (
                        <div className="space-y-3">
                          {poll.options.map((option) => {
                            const isVoting = votingPollId === poll.id;
                            const optionResults = results?.results?.find(
                              (r: any) => r.option_id === option.id
                            );
                            const voteCount = optionResults?.vote_count ?? option.vote_count;
                            const percentage =
                              optionResults?.percentage ?? option.vote_percentage;

                            return (
                              <div key={option.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label
                                    role="button"
                                    tabIndex={poll.is_active && !hasVoted ? 0 : undefined}
                                    className={`flex-1 cursor-pointer p-3 rounded-lg border transition-colors ${
                                      poll.is_active && !hasVoted ? 'hover:bg-[#f5f0e8]' : ''
                                    } ${
                                      hasVoted && optionResults
                                        ? 'border-[#2d5016] bg-green-50'
                                        : 'border-gray-200'
                                    } ${isVoting ? 'opacity-70 pointer-events-none' : ''}`}
                                    onClick={(e) => {
                                      if (!poll.is_active || hasVoted || isVoting) return;
                                      e.preventDefault();
                                      handleVote(poll.id, option.id);
                                    }}
                                    onKeyDown={(e) => {
                                      if (!poll.is_active || hasVoted || isVoting) return;
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleVote(poll.id, option.id);
                                      }
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      {poll.is_active && !hasVoted && (
                                        <input
                                          type="radio"
                                          name={`poll-${poll.id}`}
                                          value={option.id}
                                          readOnly
                                          tabIndex={-1}
                                          disabled
                                          className="w-4 h-4 text-[#2d5016] focus:ring-[#2d5016] pointer-events-none"
                                        />
                                      )}
                                      <span className="text-sm font-medium text-gray-900 flex-1">
                                        {option.text}
                                      </span>
                                      {showResults && (
                                        <span className="text-sm font-semibold text-[#2d5016]">
                                          {percentage}%
                                        </span>
                                      )}
                                    </div>
                                  </label>
                                </div>
                                {showResults && (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                      <span>{voteCount} votes</span>
                                      <span>{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-[#f5f0e8] rounded-full h-2">
                                      <div
                                        className="bg-[#2d5016] h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {poll.is_active && !hasVoted && poll.total_votes > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => loadResults(poll.id)}
                          className="w-full mt-4"
                          disabled={!!pollResults[poll.id]}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          {pollResults[poll.id] ? 'Results Loaded' : 'View Results'}
                        </Button>
                      )}

                      {hasVoted && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Thank you for your vote!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        </div>
      </main>
    </div>
  );
}
