'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, CheckCircle, XCircle, TrendingUp, Users, BarChart3, MessageSquare, Send, AlertCircle, User, FileText, Scale, Share2, ExternalLink, HelpCircle, ChevronLeft, ChevronRight, X, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchPolls, voteOnPoll, fetchPollResults, Poll, submitFeedback, FeedbackSubmission, fetchXPollEmbeds, XPollEmbed, fetchPageHeroImage, fetchCitizensVoiceFeedbackLinks, CitizensVoiceFeedbackLinks, fetchTrivias, fetchTrivia, Trivia, TriviaQuestion } from '@/lib/api';

declare global {
  interface Window {
    twttr?: {
      widgets: { load: (el?: HTMLElement) => void };
    };
  }
}

export default function CitizensVoicePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [heroImage, setHeroImage] = useState<string>('/images/citizens-voice.jpg');
  const [feedbackLinks, setFeedbackLinks] = useState<CitizensVoiceFeedbackLinks | null>(null);
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
    loadAllPolls();
    // Fetch dynamic hero image
    fetchPageHeroImage('citizens-voice').then((data) => {
      if (data?.image) {
        setHeroImage(data.image);
      }
    });
    fetchCitizensVoiceFeedbackLinks().then(setFeedbackLinks);
    fetchTrivias().then(setTrivias).catch(() => setTrivias([]));
  }, []);

  useEffect(() => {
    const triviaId = searchParams.get('trivia');
    if (triviaId) {
      const id = parseInt(triviaId, 10);
      if (!Number.isNaN(id)) {
        setTriviaModalId(id);
        router.replace('/citizens-voice', { scroll: false });
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
      <main className="relative">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="relative mb-10 h-[360px] overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={heroImage}
              alt="Citizens Voice - participate in polls and share your feedback"
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized={heroImage.startsWith('http')}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 z-10 px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 mb-3">
                  <MessageSquare className="w-4 h-4 text-white" aria-hidden />
                  <span className="text-sm font-medium text-white/90">Your voice matters</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-3">
                  Citizens Voice
                </h1>
                <p className="text-base text-white/90 leading-relaxed sm:text-lg">
                  Participate in polls and share your feedback on parliamentary matters and governance issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-8">
        {/* Feedback & engagement cards - first section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ways to engage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href={feedbackLinks?.ask_mp_form_url || '#'}
              target={feedbackLinks?.ask_mp_form_url ? '_blank' : undefined}
              rel={feedbackLinks?.ask_mp_form_url ? 'noopener noreferrer' : undefined}
              className={`rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg hover:border-[#2d5016]/30 flex flex-col ${
                !feedbackLinks?.ask_mp_form_url ? 'pointer-events-none opacity-70' : ''
              }`}
            >
              <div className="p-2.5 bg-[#2d5016]/10 rounded-lg w-fit mb-4">
                <User className="w-6 h-6 text-[#2d5016]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ask your MP</h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">
                Send a question or message to your Member of Parliament.
              </p>
              {feedbackLinks?.ask_mp_form_url ? (
                <span className="text-sm font-medium text-[#2d5016] flex items-center gap-1.5">
                  Open form <ExternalLink className="w-4 h-4" />
                </span>
              ) : (
                <span className="text-sm text-gray-400">Link not configured</span>
              )}
            </a>

            <a
              href={feedbackLinks?.comment_bill_form_url || '#'}
              target={feedbackLinks?.comment_bill_form_url ? '_blank' : undefined}
              rel={feedbackLinks?.comment_bill_form_url ? 'noopener noreferrer' : undefined}
              className={`rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg hover:border-[#2d5016]/30 flex flex-col ${
                !feedbackLinks?.comment_bill_form_url ? 'pointer-events-none opacity-70' : ''
              }`}
            >
              <div className="p-2.5 bg-[#2d5016]/10 rounded-lg w-fit mb-4">
                <FileText className="w-6 h-6 text-[#2d5016]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comment on a bill</h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">
                Share your views on legislation currently before Parliament.
              </p>
              {feedbackLinks?.comment_bill_form_url ? (
                <span className="text-sm font-medium text-[#2d5016] flex items-center gap-1.5">
                  Open form <ExternalLink className="w-4 h-4" />
                </span>
              ) : (
                <span className="text-sm text-gray-400">Link not configured</span>
              )}
            </a>

            <a
              href={feedbackLinks?.feedback_law_form_url || '#'}
              target={feedbackLinks?.feedback_law_form_url ? '_blank' : undefined}
              rel={feedbackLinks?.feedback_law_form_url ? 'noopener noreferrer' : undefined}
              className={`rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg hover:border-[#2d5016]/30 flex flex-col ${
                !feedbackLinks?.feedback_law_form_url ? 'pointer-events-none opacity-70' : ''
              }`}
            >
              <div className="p-2.5 bg-[#2d5016]/10 rounded-lg w-fit mb-4">
                <Scale className="w-6 h-6 text-[#2d5016]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback on a law</h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">
                Tell us your experience or views on existing laws and their impact.
              </p>
              {feedbackLinks?.feedback_law_form_url ? (
                <span className="text-sm font-medium text-[#2d5016] flex items-center gap-1.5">
                  Open form <ExternalLink className="w-4 h-4" />
                </span>
              ) : (
                <span className="text-sm text-gray-400">Link not configured</span>
              )}
            </a>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md flex flex-col">
              <div className="p-2.5 bg-[#2d5016]/10 rounded-lg w-fit mb-4">
                <Share2 className="w-6 h-6 text-[#2d5016]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Find us on social media</h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">
                Follow us for updates, discussions, and more ways to engage.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://wa.me/256393228160"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#f5f0e8] rounded-lg text-gray-700 hover:bg-[#2d5016] hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a
                  href="https://x.com/pwatchug"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#f5f0e8] rounded-lg text-gray-700 hover:bg-[#2d5016] hover:text-white transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@pwatchug"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#f5f0e8] rounded-lg text-gray-700 hover:bg-[#2d5016] hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/cepa-_-parliament-watch-uganda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#f5f0e8] rounded-lg text-gray-700 hover:bg-[#2d5016] hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/pwatchug"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#f5f0e8] rounded-lg text-gray-700 hover:bg-[#2d5016] hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* X Poll Embeds (standalone) */}
        {xPollEmbeds.length > 0 && (
          <div className="mb-10">
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
          </div>
        )}

        {/* Platform polls */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Polls</h2>

        {/* Polls Grid */}
        {allPolls.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No polls found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {allPolls.map((poll) => {
              const hasVoted = votedPolls.has(poll.id);
              const results = pollResults[poll.id];
              const showResults = hasVoted || poll.show_results_before_voting || poll.status === 'closed';

              return (
                <div
                  key={poll.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] p-6 border-b border-gray-200">
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
                                      role="button"
                                      tabIndex={poll.is_active && !hasVoted ? 0 : undefined}
                                      className={`flex-1 cursor-pointer ${
                                        poll.is_active && !hasVoted ? 'hover:bg-[#f5f0e8]' : ''
                                      } p-3 rounded-lg border ${
                                        hasVoted && optionResults
                                          ? 'border-[#2d5016] bg-green-50'
                                          : 'border-gray-200'
                                      } transition-colors ${isVoting ? 'opacity-70 pointer-events-none' : ''}`}
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
                                        {poll.is_active && !hasVoted ? (
                                          <input
                                            type="radio"
                                            name={`poll-${poll.id}`}
                                            value={option.id}
                                            readOnly
                                            tabIndex={-1}
                                            disabled={isVoting || !poll.is_active || hasVoted}
                                            className="w-4 h-4 text-[#2d5016] focus:ring-[#2d5016] pointer-events-none"
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

        {/* Trivia section */}
        {trivias.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trivia</h2>
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
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
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

        {/* Feedback Form Section */}
        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Left Side - Form */}
            <div className="lg:col-span-2 p-6 lg:p-8 bg-white">
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
            <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 space-y-6">
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
        <div className="mt-8 relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
          </div>
          <div className="relative z-10">
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
        </div>
        </div>
      </main>
    </div>
  );
}


