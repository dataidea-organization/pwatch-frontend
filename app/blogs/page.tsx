'use client';

import { useState, useEffect } from 'react';
import { fetchBlogs, BlogPost } from '@/lib/api';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function BlogsPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBlogs();
  }, [selectedCategory]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      const data = await fetchBlogs(1, 12, filters);
      setBlogPosts(data.results);
      setHasMore(data.next !== null);
      setPage(1);
      setError(null);
    } catch (err) {
      setError('Failed to load blog posts. Please try again later.');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const filters: any = {};
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      const data = await fetchBlogs(nextPage, 12, filters);
      setBlogPosts([...blogPosts, ...data.results]);
      setHasMore(data.next !== null);
      setPage(nextPage);
    } catch (err) {
      setError('Failed to load more posts.');
      console.error('Error fetching more blogs:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    loadBlogs();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'governance', label: 'Governance' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'youth_powered', label: 'Youth Powered' },
    { value: 'accountability', label: 'Accountability' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && blogPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadBlogs}
              className="mt-4 bg-[#085e29] text-white px-6 py-2 rounded-md hover:bg-[#064920] transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                LATEST BLOG POSTS
              </h1>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#085e29] flex-1 md:flex-none md:w-64"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#085e29]"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSearch}
                  className="bg-[#085e29] text-white px-6 py-2 rounded-md hover:bg-[#064920] transition-colors font-medium"
                >
                  SEARCH
                </button>
              </div>
            </div>

            {blogPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p>No blog posts available at the moment.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {blogPosts.map((post) => (
                    <Link key={post.id} href={`/blogs/${post.slug}`}>
                      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                        <div className="relative h-64 bg-gray-200 flex-shrink-0">
                          <img
                            src={post.image 
                              ? (post.image.startsWith('http') ? post.image : `${API_BASE_URL.replace('/api', '')}${post.image}`)
                              : '/images/default-blog.jpg'
                            }
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-[#085e29] uppercase">
                              {post.category_display || post.category}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            By: {post.author}
                          </p>
                          <h3 className="font-bold text-gray-800 text-base mb-3 line-clamp-2 flex-1">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
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
                            <span>{formatDate(post.published_date)}</span>
                          </div>
                          <a
                            href={`/blogs/${post.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#085e29] hover:text-[#064920] font-medium text-sm mt-2 inline-block"
                          >
                            Read More...
                          </a>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-[#085e29] text-white px-8 py-3 rounded-md hover:bg-[#064920] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingMore ? 'Loading...' : 'LOAD MORE POSTS'}
                      {!loadingMore && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {error && blogPosts.length > 0 && (
              <div className="mt-4 text-center text-red-600">
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
