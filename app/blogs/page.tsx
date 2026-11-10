'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { fetchBlogs, BlogPost } from '@/lib/api';
import { appendUniqueById, uniqueById } from '@/lib/lists';
import { Calendar, User } from 'lucide-react';

const API_MEDIA = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';

const BLOG_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'governance', label: 'Governance' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'youth_powered', label: 'Youth Powered' },
  { value: 'accountability', label: 'Accountability' },
];

function postImageUrl(image: string | null): string {
  if (!image) return '/images/default-blog.jpg';
  if (image.startsWith('http')) return image;
  return `${API_MEDIA}${image.startsWith('/') ? '' : '/'}${image}`;
}

export default function BlogsPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const requestGen = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadBlogs = useCallback(async () => {
    const gen = ++requestGen.current;
    try {
      setLoading(true);
      const filters: { category?: string; search?: string } = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

      const data = await fetchBlogs(1, 12, filters);
      if (gen !== requestGen.current) return;
      setBlogPosts(uniqueById(data.results));
      setHasMore(data.next !== null);
      setPage(1);
      setError(null);
    } catch (err) {
      if (gen !== requestGen.current) return;
      setError('Failed to load blog posts. Please try again later.');
      console.error('Error fetching blogs:', err);
    } finally {
      if (gen === requestGen.current) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  }, [selectedCategory, debouncedSearch]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const loadMore = async () => {
    if (loadingMore) return;
    const gen = requestGen.current;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const filters: { category?: string; search?: string } = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

      const data = await fetchBlogs(nextPage, 12, filters);
      if (gen !== requestGen.current) return;
      setBlogPosts((prev) => appendUniqueById(prev, data.results));
      setHasMore(data.next !== null);
      setPage(nextPage);
    } catch (err) {
      if (gen !== requestGen.current) return;
      setError('Failed to load more posts.');
      console.error('Error fetching blogs:', err);
    } finally {
      if (gen === requestGen.current) setLoadingMore(false);
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
          <div className="border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Blog</h1>
            <p className="text-gray-600 text-sm sm:text-base">Insights and analysis from the Ugandan Parliament.</p>
          </div>
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-[#2d5016] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 mt-4">Loading blog...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && blogPosts.length === 0 && !initialLoad) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <header className="border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Blog</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6">Insights and analysis from the Ugandan Parliament.</p>
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
              {BLOG_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-[#2d5016] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </header>
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
            <p className="font-medium">{error}</p>
          </div>
          <button
            onClick={loadBlogs}
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
        <header className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Blog</h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            Insights and analysis from the Ugandan Parliament.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <label htmlFor="blog-search" className="sr-only">Search blog</label>
            <div className="flex-1 relative">
              <input
                id="blog-search"
                type="search"
                placeholder="Search by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-9 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2d5016]/40 focus:border-[#2d5016]"
                aria-label="Search blog posts"
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
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Blog categories">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-[#2d5016] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </header>

        <div>
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-2 border-[#2d5016] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 mt-4">Loading blog...</p>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm py-16 px-6 text-center">
              <p className="text-gray-700 text-lg font-medium mb-2">
                {debouncedSearch || selectedCategory !== 'all'
                  ? 'No posts match your search or filter.'
                  : 'No blog posts at the moment.'}
              </p>
              {(debouncedSearch || selectedCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-3 text-[#2d5016] hover:text-[#1b3d26] font-medium underline transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {blogPosts[0] && (
                <article className="border-b border-gray-200 pb-8">
                  <Link href={`/blogs/${blogPosts[0].slug}`} className="group block">
                    <div className="overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={postImageUrl(blogPosts[0].image)}
                        alt={blogPosts[0].title}
                        className="w-full h-[280px] sm:h-[360px] object-cover object-[50%_25%] transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="mt-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#2d5016] bg-[#2d5016]/10 rounded mb-3">
                        {blogPosts[0].category_display || blogPosts[0].category}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight group-hover:text-[#2d5016] transition-colors line-clamp-3">
                        {blogPosts[0].title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-gray-400" />
                          {blogPosts[0].author}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(blogPosts[0].published_date)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              {blogPosts.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  {blogPosts.slice(1, 3).map((post) => (
                    <article key={post.id} className="border-b border-gray-200 pb-6 sm:pb-0 sm:border-b-0">
                      <Link href={`/blogs/${post.slug}`} className="group block">
                        <div className="overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={postImageUrl(post.image)}
                            alt={post.title}
                            className="w-full h-[200px] object-cover object-[50%_25%] transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="mt-3">
                          <span className="text-xs font-semibold uppercase tracking-wide text-[#2d5016]">
                            {post.category_display || post.category}
                          </span>
                          <h3 className="mt-1.5 text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#2d5016] transition-colors">
                            {post.title}
                          </h3>
                          <p className="mt-2 text-sm text-gray-500">
                            {post.author} · {formatDateShort(post.published_date)}
                          </p>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}

              {blogPosts.length > 3 && (
                <section>
                  <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2 mb-6">
                    Latest posts
                  </h2>
                  <ul className="divide-y divide-gray-200">
                    {blogPosts.slice(3).map((post) => (
                      <li key={post.id}>
                        <Link
                          href={`/blogs/${post.slug}`}
                          className="flex gap-4 py-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5016] focus-visible:ring-offset-2 rounded"
                        >
                          <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={postImageUrl(post.image)}
                              alt={post.title}
                              className="w-full h-full object-cover object-[50%_25%] transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#2d5016]">
                              {post.category_display || post.category}
                            </span>
                            <h3 className="mt-0.5 font-bold text-gray-900 line-clamp-2 group-hover:text-[#2d5016] transition-colors">
                              {post.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {post.author} · {formatDateShort(post.published_date)}
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

          {error && blogPosts.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm font-medium text-center">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
