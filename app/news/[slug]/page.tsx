'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error || 'News article not found'}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={loadArticle}
                className="bg-[#085e29] text-white px-6 py-2 rounded-md hover:bg-[#064920] transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/news"
                className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/news"
            className="inline-flex items-center text-[#085e29] hover:text-[#064920] font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to All News
          </Link>
        </div>

        {/* News Article */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Image */}
          {article.image && (
            <div className="relative h-96 bg-gray-200">
              <img
                src={article.image.startsWith('http') ? article.image : `${API_BASE_URL.replace('/api', '')}${article.image}`}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Category and Date */}
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-[#085e29] text-white text-sm font-semibold rounded-full">
                {article.category_display || article.category}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDate(article.published_date)}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-[#085e29] flex items-center justify-center text-white font-semibold">
                {article.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{article.author}</p>
                <p className="text-sm text-gray-600">Author</p>
              </div>
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <div className="mb-6">
                <p className="text-lg text-gray-700 italic border-l-4 border-[#085e29] pl-4">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Content */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                color: '#374151',
                lineHeight: '1.75',
                fontSize: '1.125rem',
              }}
            />
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/news"
            className="bg-[#085e29] text-white px-8 py-3 rounded-md hover:bg-[#064920] transition-colors font-medium"
          >
            View All News
          </Link>
        </div>
      </main>
    </div>
  );
}

