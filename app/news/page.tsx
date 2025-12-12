'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { fetchNews, NewsArticle } from '@/lib/api';

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await fetchNews(1, 12);
      setNewsArticles(data.results);
      setHasMore(data.next !== null);
      setPage(1);
      setError(null);
    } catch (err) {
      setError('Failed to load news articles. Please try again later.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await fetchNews(nextPage, 12);
      setNewsArticles([...newsArticles, ...data.results]);
      setHasMore(data.next !== null);
      setPage(nextPage);
    } catch (err) {
      setError('Failed to load more articles.');
      console.error('Error fetching more news:', err);
    } finally {
      setLoadingMore(false);
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
      <div className="min-h-screen bg-white">
        <Header />
        <main className="bg-gradient-to-b from-gray-100 to-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <p className="text-gray-600">Loading news articles...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && newsArticles.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="bg-gradient-to-b from-gray-100 to-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadNews}
                className="mt-4 bg-[#085e29] text-white px-6 py-2 rounded-md hover:bg-[#064920] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="bg-gradient-to-b from-gray-100 to-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              If it happened in Parliament, it&apos;s right here
            </h1>
          </div>

          {newsArticles.length === 0 ? (
            <div className="text-center text-gray-600">
              <p>No news articles available at the moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {newsArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-orange-400 to-pink-500">
                      {article.image ? (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                          News Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 text-sm mb-3 line-clamp-3">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
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
                      <div className="flex items-center gap-2 text-xs text-gray-600">
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>{article.author}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-[#085e29] text-white px-8 py-3 rounded-md hover:bg-[#064920] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Articles'}
                  </button>
                </div>
              )}
            </>
          )}

          {error && newsArticles.length > 0 && (
            <div className="mt-4 text-center text-red-600">
              <p>{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}