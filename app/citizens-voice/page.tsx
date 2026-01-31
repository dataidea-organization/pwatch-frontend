'use client';

import { useState, useEffect, useMemo } from 'react';
import Script from 'next/script';
import { Search, Calendar, CheckCircle, XCircle, TrendingUp, Users, BarChart3, MessageSquare, Send, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchPolls, voteOnPoll, fetchPollResults, Poll, submitFeedback, FeedbackSubmission, fetchXPollEmbeds, XPollEmbed } from '@/lib/api';

declare global {
  interface Window {
    twttr?: {
      widgets: { load: (el?: HTMLElement) => void };
    };
  }
}

export default function CitizensVoicePage() {
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null);
  const [votedPolls, setVotedPolls] = useState<Set<number>>(new Set());
  const [pollResults, setPollResults] = useState<Record<number, any>>({});
  const [votingPollId, setVotingPollId] = useState<number | null>(null);
  
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState<FeedbackSubmission>({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [twitterReady, setTwitterReady] = useState(false);
  const [xPollEmbeds, setXPollEmbeds] = useState<XPollEmbed[]>([]);

  useEffect(() => {
    loadAllPolls();
  }, []);

  useEffect(() => {
    fetchXPollEmbeds().then(setXPollEmbeds).catch(() => setXPollEmbeds([]));
  }, []);

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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/multimedia/polls/?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch polls');
        }
        
        const data = await response.json();
        allResults = [...allResults, ...data.results];
        hasMore = data.next !== null;
        currentPage++;
      }

      setAllPolls(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching polls:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    allPolls.forEach((poll) => {
      if (poll.category) cats.add(poll.category);
    });
    return Array.from(cats).sort();
  }, [allPolls]);

  const filteredPolls = useMemo(() => {
    let filtered = [...allPolls];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((poll) => poll.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((poll) => poll.category === categoryFilter);
    }

    if (featuredFilter !== null) {
      filtered = filtered.filter((poll) => poll.featured === featuredFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((poll) => {
        return (
          poll.title.toLowerCase().includes(query) ||
          poll.description.toLowerCase().includes(query) ||
          (poll.category && poll.category.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [allPolls, searchQuery, statusFilter, categoryFilter, featuredFilter]);

  // After Twitter widgets.js loads and X poll embeds are in the DOM, parse them so the full tweet (including poll) renders
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

  const handleVote = async (pollId: number, optionId: number) => {
    try {
      setVotingPollId(pollId);
      await voteOnPoll(pollId, optionId);
      
      // Mark as voted
      setVotedPolls((prev) => new Set([...prev, pollId]));
      
      // Load updated results
      const results = await fetchPollResults(pollId);
      setPollResults((prev) => ({ ...prev, [pollId]: results }));
      
      // Update the poll in the list
      setAllPolls((prev) =>
        prev.map((poll) => {
          if (poll.id === pollId) {
            const updatedPoll = { ...poll };
            updatedPoll.options = updatedPoll.options.map((opt) => {
              const result = results.results.find((r: any) => r.option_id === opt.id);
              return {
                ...opt,
                vote_count: result?.vote_count || opt.vote_count,
                vote_percentage: result?.percentage || opt.vote_percentage,
              };
            });
            updatedPoll.total_votes = results.total_votes;
            return updatedPoll;
          }
          return poll;
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackForm.name.trim() || !feedbackForm.email.trim() || !feedbackForm.message.trim()) {
      setFeedbackStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      setFeedbackStatus({ type: null, message: '' });
      
      await submitFeedback(feedbackForm);
      
      setFeedbackStatus({ 
        type: 'success', 
        message: 'Thank you for your feedback! We appreciate your input.' 
      });
      
      // Reset form
      setFeedbackForm({
        name: '',
        email: '',
        message: '',
      });
    } catch (err) {
      setFeedbackStatus({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.' 
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loading && allPolls.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
            <p className="mt-4 text-gray-600">Loading polls...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && allPolls.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button onClick={() => loadAllPolls()} className="mt-4" variant="green">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onLoad={() => setTwitterReady(true)}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Citizens Voice</h1>
          <p className="text-gray-600 text-lg">
            Participate in polls and share your feedback on parliamentary matters and governance issues
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-[#fafaf8] rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search polls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-gray-400"
                  style={{ color: '#111827' }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2d5016] focus:border-transparent text-gray-900 bg-[#fafaf8]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2d5016] focus:border-transparent text-gray-900 bg-[#fafaf8]"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={featuredFilter === null ? 'all' : featuredFilter ? 'featured' : 'not-featured'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFeaturedFilter(value === 'all' ? null : value === 'featured');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2d5016] focus:border-transparent text-gray-900 bg-[#fafaf8]"
              >
                <option value="all">All Polls</option>
                <option value="featured">Featured Only</option>
              </select>
              {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || featuredFilter !== null) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                    setFeaturedFilter(null);
                  }}
                  className="bg-[#fafaf8] text-gray-700 hover:bg-[#f5f0e8] border-gray-300"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* X Poll Embeds (standalone) */}
        {xPollEmbeds.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">X Polls</h2>
            <div className="space-y-6">
              {xPollEmbeds.map((embed) => (
                <div
                  key={embed.id}
                  className="bg-[#fafaf8] rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center [&_.twitter-tweet]:!max-w-full [&_iframe]:!max-w-full"
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
          </div>
        )}

        {/* Polls Grid */}
        {filteredPolls.length === 0 ? (
          <div className="bg-[#fafaf8] rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No polls found</p>
            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || featuredFilter !== null) && (
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPolls.map((poll) => {
              const hasVoted = votedPolls.has(poll.id);
              const results = pollResults[poll.id];
              const showResults = hasVoted || poll.show_results_before_voting || poll.status === 'closed';

              return (
                <div
                  key={poll.id}
                  className="bg-[#fafaf8] rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 flex-1">{poll.title}</h3>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {poll.featured && (
                          <span className="px-2 py-1 bg-[#2d5016] text-white text-xs font-medium rounded">
                            Featured
                          </span>
                        )}
                      </div>
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

                  {/* Options */}
                  <div className="p-6">
                    {poll.options.length === 0 ? (
                          <p className="text-gray-500 text-sm">No options available</p>
                        ) : (
                          <div className="space-y-3">
                            {poll.options.map((option) => {
                              const isVoting = votingPollId === poll.id;
                              const optionResults = results?.results?.find((r: any) => r.option_id === option.id);
                              const voteCount = optionResults?.vote_count ?? option.vote_count;
                              const percentage = optionResults?.percentage ?? option.vote_percentage;

                              return (
                                <div key={option.id} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label
                                      className={`flex-1 cursor-pointer ${
                                        poll.is_active && !hasVoted ? 'hover:bg-[#f5f0e8]' : ''
                                      } p-3 rounded-lg border ${
                                        hasVoted && optionResults
                                          ? 'border-[#2d5016] bg-green-50'
                                          : 'border-gray-200'
                                      } transition-colors`}
                                    >
                                      <div className="flex items-center gap-3">
                                        {poll.is_active && !hasVoted ? (
                                          <input
                                            type="radio"
                                            name={`poll-${poll.id}`}
                                            value={option.id}
                                            disabled={isVoting || !poll.is_active || hasVoted}
                                            onChange={() => handleVote(poll.id, option.id)}
                                            className="w-4 h-4 text-[#2d5016] focus:ring-[#2d5016]"
                                          />
                                        ) : null}
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

        {/* Feedback Form Section */}
        <div className="mt-8 bg-[#fafaf8] rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Left Side - Form */}
            <div className="lg:col-span-2 p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-[#2d5016] rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Share Your Feedback</h3>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                Help us improve by sharing your thoughts and suggestions
              </p>
              
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {feedbackStatus.type && (
                  <div
                    className={`p-3 rounded-md flex items-start gap-3 ${
                      feedbackStatus.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {feedbackStatus.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <p
                      className={`text-sm ${
                        feedbackStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {feedbackStatus.message}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="feedback-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="feedback-name"
                      type="text"
                      required
                      value={feedbackForm.name}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                      disabled={isSubmittingFeedback}
                      className="w-full border-gray-300 focus:border-gray-400"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="feedback-email"
                      type="email"
                      required
                      value={feedbackForm.email}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                      disabled={isSubmittingFeedback}
                      className="w-full border-gray-300 focus:border-gray-400"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="feedback-message"
                    required
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                    disabled={isSubmittingFeedback}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400"
                    placeholder="Share your feedback, suggestions, or concerns..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="w-full sm:w-auto bg-[#2d5016] text-white hover:bg-[#1b3d26] transition-colors font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400 px-6"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2 inline" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Right Side - Info/Visual */}
            <div className="bg-[#f5f0e8] p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2d5016]" />
                    Why Your Feedback Matters
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Your input helps us enhance the platform and better serve the community's needs.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#2d5016] rounded-full mt-0.5">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Quick Response</p>
                      <p className="text-xs text-gray-600">We review all feedback regularly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#2d5016] rounded-full mt-0.5">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Community Driven</p>
                      <p className="text-xs text-gray-600">Your voice shapes our improvements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#2d5016] rounded-full mt-0.5">
                      <MessageSquare className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Open Communication</p>
                      <p className="text-xs text-gray-600">We value every suggestion</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-[#fafaf8] rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About Citizens Voice</h3>
          <p className="text-gray-600 text-sm mb-3">
            Citizens Voice is a platform for democratic engagement where you can participate in polls on various
            parliamentary and governance topics. Your opinions matter and help shape public discourse.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-[#2d5016] mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Real-time Results</h4>
                <p className="text-gray-600 text-xs">See how others are voting as results update in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-[#2d5016] mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Your Voice Matters</h4>
                <p className="text-gray-600 text-xs">Participate in polls on important governance and policy issues</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-[#2d5016] mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Transparent Process</h4>
                <p className="text-gray-600 text-xs">View detailed results and statistics for all polls</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


