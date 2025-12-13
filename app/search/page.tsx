'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { searchGlobal, GlobalSearchResponse } from '@/lib/api';
import { Folder } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const typeLabels: { [key: string]: string } = {
  news: 'News',
  blogs: 'Blogs',
  mps: 'Members of Parliament',
  bills: 'Bills',
  loans: 'Loans',
  budgets: 'Budgets',
  hansards: 'Hansards',
  order_papers: 'Order Papers',
  explainers: 'Explainers',
  reports: 'Reports',
  partner_publications: 'Partner Publications',
  statements: 'Statements',
  podcasts: 'Podcasts',
  xspaces: 'X Spaces',
  gallery: 'Gallery',
  polls: 'Polls',
};

const typeLinks: { [key: string]: string } = {
  news: '/news',
  blogs: '/blogs',
  mps: '/trackers/mps',
  bills: '/trackers/bills',
  loans: '/trackers/loans',
  budgets: '/trackers/budgets',
  hansards: '/trackers/hansards',
  order_papers: '/trackers/order-paper',
  explainers: '/resources/explainers',
  reports: '/resources/reports-briefs',
  partner_publications: '/resources/partner-publications',
  statements: '/resources/statements',
  podcasts: '/multimedia/podcast',
  xspaces: '/multimedia/x-spaces',
  gallery: '/multimedia/gallery',
  polls: '/citizens-voice',
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      loadSearchResults();
    } else {
      setLoading(false);
    }
  }, [query]);

  const loadSearchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await searchGlobal(query, 20); // 20 results per category for full page
      setSearchResults(results);
    } catch (err) {
      setError('Failed to load search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResultUrl = (type: string, result: any): string => {
    switch (type) {
      case 'news':
        return `/news/${result.slug}`;
      case 'blogs':
        return `/blogs/${result.slug}`;
      case 'mps':
        return `/trackers/mps/${result.id}`;
      case 'bills':
        return `/trackers/bills/${result.id}`;
      case 'loans':
        return `/trackers/loans`;
      case 'budgets':
        return `/trackers/budgets`;
      case 'hansards':
        return `/trackers/hansards`;
      case 'order_papers':
        return `/trackers/order-paper`;
      case 'explainers':
        return `/resources/explainers`;
      case 'reports':
        return `/resources/reports-briefs`;
      case 'partner_publications':
        return `/resources/partner-publications`;
      case 'statements':
        return `/resources/statements`;
      case 'podcasts':
        return `/multimedia/podcast`;
      case 'xspaces':
        return `/multimedia/x-spaces`;
      case 'gallery':
        return `/multimedia/gallery`;
      case 'polls':
        return `/citizens-voice`;
      default:
        return '/';
    }
  };

  const getResultTitle = (result: any): string => {
    return result.title || result.name || 'Untitled';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
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
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600">Searching...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadSearchResults}
              className="mt-4 bg-[#085e29] text-white px-6 py-2 rounded-md hover:bg-[#064920] transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600">Please enter a search query</p>
          </div>
        </main>
      </div>
    );
  }

  if (!searchResults || searchResults.total_results === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Search Results for &quot;{query}&quot;
          </h1>
          <div className="text-center py-12">
            <p className="text-gray-600">No results found for your search.</p>
            <p className="text-sm text-gray-500 mt-2">Try different keywords or check your spelling.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Search Results for &quot;{query}&quot;
        </h1>
        <p className="text-gray-600 mb-8">
          Found {searchResults.total_results} result{searchResults.total_results !== 1 ? 's' : ''}
        </p>

        <div className="space-y-8">
          {Object.entries(searchResults.results).map(([type, results]) => {
            if (!results || results.length === 0) return null;
            const count = searchResults.counts[type as keyof typeof searchResults.counts] || 0;

            return (
              <div key={type} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {typeLabels[type] || type}
                  </h2>
                  {count > results.length && (
                    <Link
                      href={`${typeLinks[type]}?search=${encodeURIComponent(query)}`}
                      className="text-[#085e29] hover:text-[#064920] text-sm font-medium"
                    >
                      View all {count} {typeLabels[type]}
                    </Link>
                  )}
                </div>

                <div className="space-y-3">
                  {results.map((result) => {
                    const isNewsOrBlog = type === 'news' || type === 'blogs';
                    const isMP = type === 'mps';
                    const isResource = ['explainers', 'reports', 'partner_publications', 'statements', 'budgets', 'hansards', 'order_papers'].includes(type);

                    if (isNewsOrBlog) {
                      return (
                        <Link
                          key={result.id}
                          href={getResultUrl(type, result)}
                          className="block p-4 border border-gray-200 rounded-lg hover:border-[#085e29] hover:shadow-md transition-all"
                        >
                          <div className="flex gap-4">
                            {result.image && (
                              <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                                <img
                                  src={result.image.startsWith('http') ? result.image : `${API_BASE_URL.replace('/api', '')}${result.image}`}
                                  alt={getResultTitle(result)}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-[#085e29] uppercase">
                                  {result.category_display || result.category}
                                </span>
                                {result.published_date && (
                                  <span className="text-xs text-gray-500">
                                    {formatDate(result.published_date)}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {getResultTitle(result)}
                              </h3>
                              {result.author && (
                                <p className="text-sm text-gray-600 mb-1">By {result.author}</p>
                              )}
                              {result.excerpt && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {result.excerpt}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    }

                    if (isMP) {
                      return (
                        <Link
                          key={result.id}
                          href={getResultUrl(type, result)}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#085e29] hover:bg-gray-50 transition-all"
                        >
                          <Folder className="w-5 h-5 text-[#a0522d] flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {result.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {result.party} - {result.constituency}
                            </p>
                          </div>
                        </Link>
                      );
                    }

                    if (isResource) {
                      return (
                        <div
                          key={result.id}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                        >
                          <Folder className="w-5 h-5 text-[#a0522d] flex-shrink-0" />
                          <div className="flex-1">
                            {result.file ? (
                              <a
                                href={`${API_BASE_URL.replace('/api', '')}${result.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <p className="font-medium text-gray-900 hover:text-[#085e29]">
                                  {getResultTitle(result)}
                                </p>
                                {result.description && (
                                  <p className="text-sm text-gray-600 line-clamp-1">
                                    {result.description}
                                  </p>
                                )}
                              </a>
                            ) : (
                              <>
                                <p className="font-medium text-gray-900">
                                  {getResultTitle(result)}
                                </p>
                                {result.description && (
                                  <p className="text-sm text-gray-600 line-clamp-1">
                                    {result.description}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Default card for other types
                    return (
                      <Link
                        key={result.id}
                        href={getResultUrl(type, result)}
                        className="block p-3 border border-gray-200 rounded-lg hover:border-[#085e29] hover:bg-gray-50 transition-all"
                      >
                        <p className="font-medium text-gray-900">
                          {getResultTitle(result)}
                        </p>
                        {result.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {result.description}
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

