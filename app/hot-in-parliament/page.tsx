'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { fetchHotInParliament, HotInParliamentItem } from '@/lib/api';

const API_MEDIA = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';

function itemImageUrl(image: string | null): string {
  if (!image) return '/images/default-news.jpg';
  if (image.startsWith('http')) return image;
  return `${API_MEDIA}${image.startsWith('/') ? '' : '/'}${image}`;
}

export default function HotInParliamentPage() {
  const [items, setItems] = useState<HotInParliamentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const data = await fetchHotInParliament(1, 12);
        setItems(data.results || []);
        setHasMore(data.next !== null);
        setPage(1);
        setError(null);
      } catch (err) {
        console.error('Error fetching hot in parliament:', err);
        setError('Failed to load Hot in Parliament items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await fetchHotInParliament(nextPage, 12);
      setItems((prev) => [...prev, ...(data.results || [])]);
      setHasMore(data.next !== null);
      setPage(nextPage);
    } catch (err) {
      console.error('Error fetching more hot in parliament:', err);
      setError('Failed to load more items.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8]">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-12">
        <header className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Hot in Parliament</h1>
          <p className="text-gray-600 text-sm sm:text-base">Latest highlights and developments from Parliament.</p>
        </header>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#2d5016] border-t-transparent" />
            <p className="text-gray-600 mt-4">Loading items...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <p className="font-medium">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm py-16 px-6 text-center">
            <p className="text-gray-700 text-lg font-medium">No items available right now.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {items[0] && (
              <article className="border-b border-gray-200 pb-8">
                <Link href={`/hot-in-parliament/${items[0].slug}`} className="group block">
                  <div className="overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={itemImageUrl(items[0].image)}
                      alt={items[0].title}
                      className="w-full h-[280px] sm:h-[360px] object-cover object-[50%_25%] transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="mt-4">
                    <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#2d5016] bg-[#2d5016]/10 rounded mb-3">
                      Hot in Parliament
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight group-hover:text-[#2d5016] transition-colors line-clamp-3">
                      {items[0].title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-400" />
                        {items[0].author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(items[0].published_date)}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {items.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {items.slice(1, 3).map((item) => (
                  <article key={item.id} className="border-b border-gray-200 pb-6 sm:pb-0 sm:border-b-0">
                    <Link href={`/hot-in-parliament/${item.slug}`} className="group block">
                      <div className="overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={itemImageUrl(item.image)}
                          alt={item.title}
                          className="w-full h-[200px] object-cover object-[50%_25%] transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="mt-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#2d5016]">
                          Hot in Parliament
                        </span>
                        <h3 className="mt-1.5 text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#2d5016] transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          {item.author} · {formatDate(item.published_date)}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {items.length > 3 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2 mb-6">
                  Latest in Parliament
                </h2>
                <ul className="divide-y divide-gray-200">
                  {items.slice(3).map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/hot-in-parliament/${item.slug}`}
                        className="flex gap-4 py-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5016] focus-visible:ring-offset-2 rounded"
                      >
                        <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={itemImageUrl(item.image)}
                            alt={item.title}
                            className="w-full h-full object-cover object-[50%_25%] transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-[#2d5016]">
                            Hot in Parliament
                          </span>
                          <h3 className="mt-0.5 font-bold text-gray-900 line-clamp-2 group-hover:text-[#2d5016] transition-colors">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.author} · {formatDate(item.published_date)}
                          </p>
                        </div>
                        <span className="flex-shrink-0 self-center text-gray-400 group-hover:text-[#2d5016] transition-colors" aria-hidden>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {hasMore && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-[#2d5016] text-white px-8 py-3 rounded-lg hover:bg-[#1b3d26] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    'Load more'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
