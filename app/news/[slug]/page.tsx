'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Share2, MessageCircle, Eye } from 'lucide-react';
import { fetchNewsArticle, NewsDetail, fetchNewsComments, submitNewsComment, NewsCommentItem } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<NewsCommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentForm, setCommentForm] = useState({ author_name: '', author_email: '', body: '' });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    if (params.slug) {
      loadArticle();
    }
  }, [params.slug]);

  useEffect(() => {
    if (params.slug && article) {
      loadComments();
    }
  }, [params.slug, article]);

  const loadComments = async () => {
    if (!params.slug) return;
    try {
      setCommentsLoading(true);
      const data = await fetchNewsComments(params.slug as string);
      setComments(data);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.slug || !commentForm.author_name.trim() || !commentForm.author_email.trim() || !commentForm.body.trim()) return;
    setCommentError(null);
    setCommentSuccess(false);
    try {
      setCommentSubmitting(true);
      const newComment = await submitNewsComment(params.slug as string, {
        author_name: commentForm.author_name.trim(),
        author_email: commentForm.author_email.trim(),
        body: commentForm.body.trim(),
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentForm({ author_name: '', author_email: '', body: '' });
      setCommentSuccess(true);
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to submit comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await fetchNewsArticle(params.slug as string);
      setArticle(data);
      setError(null);
    } catch (err) {
      setError('Failed to load news article. Please try again later.');
      console.error('Error fetching news article:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate reading time
  const readingTime = useMemo(() => {
    if (!article?.content) return 0;
    const text = article.content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200); // Average reading speed: 200 words per minute
  }, [article]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading news article...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error || 'News article not found'}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={loadArticle}
                className="bg-[#2d5016] text-white px-6 py-2 rounded-md hover:bg-[#1b3d26] transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/news"
                className="inline-block bg-[#d2c4b0] text-gray-700 px-6 py-2 rounded-md hover:bg-[#c4b5a0] transition-colors"
              >
                Back to News
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/news"
            className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to All News
          </Link>
        </div>

        {/* Hero Image Section */}
        <div className="relative h-[480px] sm:h-[520px] md:h-[560px] lg:h-[600px] rounded-2xl overflow-hidden mb-8 shadow-xl ring-1 ring-black/5">
          <img
            src={article.image 
              ? (article.image.startsWith('http') ? article.image : `${API_BASE_URL.replace('/api', '')}${article.image}`)
              : '/images/default-news.jpg'
            }
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
            style={{ objectPosition: 'center 30%' }}
          />
          {/* Gradient overlay – stronger at bottom for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
          {/* Subtle vignette at edges */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.3)]" aria-hidden />
          {/* Decorative blur – brand accent */}
          <div className="absolute bottom-0 right-0 w-64 h-64 translate-x-1/3 translate-y-1/3 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-3xl" />
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="max-w-4xl">
              {/* Category Badge */}
              <div className="mb-3 md:mb-4">
                <span className="inline-block px-4 py-2 bg-[#2d5016] text-white text-sm font-semibold rounded-full shadow-lg shadow-black/20">
                  {article.category_display || article.category}
                </span>
              </div>

              {/* Title – text shadow for contrast on any image */}
              <h1 
                className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white mb-5 md:mb-6 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6), 0 4px 24px rgba(0,0,0,0.4)' }}
              >
                {article.title}
              </h1>

              {/* Meta row – separators and clearer share */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-white/95">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0 opacity-90" />
                  <span className="text-sm">{formatDate(article.published_date)}</span>
                </div>
                <span className="hidden sm:inline w-px h-4 bg-white/50" aria-hidden />
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 flex-shrink-0 opacity-90" />
                  <span className="text-sm">{article.author}</span>
                </div>
                {readingTime > 0 && (
                  <>
                    <span className="hidden sm:inline w-px h-4 bg-white/50" aria-hidden />
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0 opacity-90" />
                      <span className="text-sm">{readingTime} min read</span>
                    </div>
                  </>
                )}
                <span className="hidden sm:inline w-px h-4 bg-white/50" aria-hidden />
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 flex-shrink-0 opacity-90" />
                  <span className="text-sm">{article.view_count ?? 0} views</span>
                </div>
                <span className="hidden sm:inline w-px h-4 bg-white/50" aria-hidden />
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/50 bg-white/10 hover:bg-white/20 hover:border-white/70 text-white transition-colors"
                  title="Share article"
                  aria-label="Share this article"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 md:py-16">
            {/* Author Section */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2d5016] to-[#1b3d26] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {article.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{article.author}</p>
                <p className="text-sm text-gray-600">Author</p>
              </div>
            </div>

            {/* Content */}
            <div
              className="blog-content prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#2d5016] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>

        {/* Comments */}
        <section className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#2d5016] to-[#1b3d26] px-6 md:px-12 py-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-white" />
            <h2 className="text-xl font-semibold text-white">
              Comments {comments.length > 0 && `(${comments.length})`}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
            <form onSubmit={handleSubmitComment} className="mb-8 space-y-4">
              <p className="text-sm text-gray-600">Leave a comment. No login required.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Your name"
                  value={commentForm.author_name}
                  onChange={(e) => setCommentForm((f) => ({ ...f, author_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-[#2d5016] outline-none bg-white text-gray-900 placeholder:text-gray-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={commentForm.author_email}
                  onChange={(e) => setCommentForm((f) => ({ ...f, author_email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-[#2d5016] outline-none bg-white text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>
              <textarea
                placeholder="Your comment"
                value={commentForm.body}
                onChange={(e) => setCommentForm((f) => ({ ...f, body: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-[#2d5016] outline-none resize-y bg-white text-gray-900 placeholder:text-gray-500"
                required
              />
              {commentError && <p className="text-sm text-red-600">{commentError}</p>}
              {commentSuccess && <p className="text-sm text-[#2d5016]">Comment posted successfully.</p>}
              <button
                type="submit"
                disabled={commentSubmitting}
                className="bg-[#2d5016] text-white px-6 py-2 rounded-lg hover:bg-[#1b3d26] transition-colors disabled:opacity-60 font-medium"
              >
                {commentSubmitting ? 'Posting...' : 'Post comment'}
              </button>
            </form>

            {commentsLoading ? (
              <p className="text-gray-500 text-sm">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment.</p>
            ) : (
              <ul className="space-y-6">
                {comments.map((c) => (
                  <li key={c.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#2d5016]/20 to-[#1b3d26]/20 flex items-center justify-center text-[#2d5016] font-semibold">
                      {c.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{c.author_name}</p>
                      <p className="text-xs text-gray-500 mb-1">{formatDate(c.created_at)}</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{c.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Navigation */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 bg-[#2d5016] text-white px-8 py-3 rounded-lg hover:bg-[#1b3d26] transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            View All News
          </Link>
        </div>
      </main>
    </div>
  );
}

