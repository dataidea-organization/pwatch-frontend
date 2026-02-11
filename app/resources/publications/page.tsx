'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchPublications, Publication } from '@/lib/api';
import { ArrowLeft, Calendar } from 'lucide-react';

const PUBLICATION_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'Policy Brief', label: 'Policy Brief' },
  { value: 'Policy Paper', label: 'Policy Paper' },
  { value: 'Research Report', label: 'Research Report' },
  { value: 'Analysis', label: 'Analysis' },
];

function publicationImageUrl(pub: Publication): string {
  if (pub.image) return pub.image;
  return '/images/reports.jpg';
}

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadPublications = useCallback(async () => {
    try {
      setLoading(true);
      const filters: { type?: string; search?: string } = {};
      if (selectedType !== 'all') filters.type = selectedType;
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

      const data = await fetchPublications(1, 12, {
        ...filters,
        ordering: '-date',
      });
      setPublications(data.results);
      setHasMore(data.next !== null);
      setPage(1);
      setError(null);
    } catch (err) {
      setError('Failed to load publications. Please try again later.');
      console.error('Error fetching publications:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [selectedType, debouncedSearch]);

  useEffect(() => {
    loadPublications();
  }, [loadPublications]);

  const loadMore = async () => {
    if (loadingMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const filters: { type?: string; search?: string } = {};
      if (selectedType !== 'all') filters.type = selectedType;
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

      const data = await fetchPublications(nextPage, 12, {
        ...filters,
        ordering: '-date',
      });
      setPublications((prev) => [...prev, ...data.results]);
      setHasMore(data.next !== null);
      setPage(nextPage);
    } catch (err) {
      setError('Failed to load more publications.');
      console.error('Error fetching publications:', err);
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

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (initialLoad && loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <Link href="/resources" className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] transition-colors text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Link>
          </div>
          <div className="border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Publications</h1>
            <p className="text-gray-600 text-sm sm:text-base">Research, policy briefs, and reports.</p>
          </div>
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-[#2d5016] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 mt-4">Loading publications...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && publications.length === 0 && !initialLoad) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <Link href="/resources" className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] transition-colors text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Link>
          </div>
          <header className="border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Publications</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6">Research, policy briefs, and reports.</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <input
                  type="search"
                  placeholder="Search by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-9 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2d5016]/40 focus:border-[#2d5016]"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PUBLICATION_TYPES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedType(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === opt.value ? 'bg-[#2d5016] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </header>
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
            <p className="font-medium">{error}</p>
          </div>
          <button
            onClick={loadPublications}
            className="bg-[#2d5016] text-white px-6 py-2.5 rounded-lg hover:bg-[#1b3d26] transition-colors font-medium"
          >
            Try again
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-12">
        <div className="mb-6">
          <Link href="/resources" className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
          </Link>
        </div>

        <header className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Publications</h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            Research, policy briefs, and reports from CEPA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <label htmlFor="publications-search" className="sr-only">
              Search publications
            </label>
            <div className="flex-1 relative">
              <input
                id="publications-search"
                type="search"
                placeholder="Search by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-9 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2d5016]/40 focus:border-[#2d5016]"
                aria-label="Search publications"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Publication types">
            {PUBLICATION_TYPES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={selectedType === opt.value}
                onClick={() => setSelectedType(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === opt.value ? 'bg-[#2d5016] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </header>

        <div>
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-2 border-[#2d5016] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 mt-4">Loading publications...</p>
            </div>
          ) : publications.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm py-16 px-6 text-center">
              <p className="text-gray-700 text-lg font-medium mb-2">
                {debouncedSearch || selectedType !== 'all'
                  ? 'No publications match your search or filter.'
                  : 'No publications at the moment.'}
              </p>
              {(debouncedSearch || selectedType !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                  }}
                  className="mt-3 text-[#2d5016] hover:text-[#1b3d26] font-medium underline transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {publications[0] && (
                <article className="border-b border-gray-200 pb-8">
                  <Link href={`/resources/publications/${publications[0].id}`} className="group block">
                    <div className="overflow-hidden rounded-lg bg-gray-100">
                      <div className="relative w-full h-[280px] sm:h-[360px]">
                        <Image
                          src={publicationImageUrl(publications[0])}
                          alt=""
                          fill
                          className="object-cover object-[50%_25%] transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 768px) 100vw, 672px"
                          unoptimized={publications[0].image?.startsWith('http')}
                        />
                        {publications[0].featured && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-[#2d5016] text-white rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#2d5016] bg-[#2d5016]/10 rounded mb-3">
                        {publications[0].type}
                      </span>
                      {publications[0].category && (
                        <span className="ml-2 text-xs text-gray-500">{publications[0].category}</span>
                      )}
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight group-hover:text-[#2d5016] transition-colors line-clamp-3">
                        {publications[0].title}
                      </h2>
                      <p className="mt-2 text-gray-600 text-sm line-clamp-2">{publications[0].description}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(publications[0].date)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              {publications.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  {publications.slice(1, 3).map((pub) => (
                    <article key={pub.id} className="border-b border-gray-200 pb-6 sm:pb-0 sm:border-b-0">
                      <Link href={`/resources/publications/${pub.id}`} className="group block">
                        <div className="overflow-hidden rounded-lg bg-gray-100">
                          <div className="relative w-full h-[200px]">
                            <Image
                              src={publicationImageUrl(pub)}
                              alt=""
                              fill
                              className="object-cover object-[50%_25%] transition-transform duration-300 group-hover:scale-[1.02]"
                              sizes="(max-width: 640px) 100vw, 50vw"
                              unoptimized={pub.image?.startsWith('http')}
                            />
                            {pub.featured && (
                              <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-[#2d5016] text-white rounded">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-xs font-semibold uppercase tracking-wide text-[#2d5016]">
                            {pub.type}
                          </span>
                          <h3 className="mt-1.5 text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#2d5016] transition-colors">
                            {pub.title}
                          </h3>
                          <p className="mt-2 text-sm text-gray-500">
                            {formatDateShort(pub.date)}
                          </p>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}

              {publications.length > 3 && (
                <section>
                  <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2 mb-6">
                    More publications
                  </h2>
                  <ul className="divide-y divide-gray-200">
                    {publications.slice(3).map((pub) => (
                      <li key={pub.id}>
                        <Link
                          href={`/resources/publications/${pub.id}`}
                          className="flex gap-4 py-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5016] focus-visible:ring-offset-2 rounded"
                        >
                          <div className="relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={publicationImageUrl(pub)}
                              alt=""
                              fill
                              className="object-cover object-[50%_25%] transition-transform duration-300 group-hover:scale-105"
                              sizes="112px"
                              unoptimized={pub.image?.startsWith('http')}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#2d5016]">
                              {pub.type}
                            </span>
                            <h3 className="mt-0.5 font-bold text-gray-900 line-clamp-2 group-hover:text-[#2d5016] transition-colors">
                              {pub.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {formatDateShort(pub.date)}
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
                    type="button"
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

          {error && publications.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm font-medium text-center">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
