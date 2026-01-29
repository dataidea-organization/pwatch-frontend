'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import { fetchNewsArticle, NewsDetail } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.slug) {
      loadArticle();
    }
  }, [params.slug]);

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
        <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden mb-8 shadow-xl">
          <img
            src={article.image 
              ? (article.image.startsWith('http') ? article.image : `${API_BASE_URL.replace('/api', '')}${article.image}`)
              : '/images/default-news.jpg'
            }
            alt={article.title}
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-4xl">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-[#2d5016] text-white text-sm font-semibold rounded-full">
                  {article.category_display || article.category}
                </span>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {article.title}
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(article.published_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{article.author}</span>
                </div>
                {readingTime > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{readingTime} min read</span>
                  </div>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                  title="Share article"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
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

