'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { ArrowLeft, Search, Calendar, Clock, User, ExternalLink, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchPodcasts, Podcast } from '@/lib/api';

type SortField = 'title' | 'published_date' | 'host' | 'created_at' | null;
type SortDirection = 'asc' | 'desc';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function PodcastPage() {
  // Store all podcasts loaded from the server
  const [allPodcasts, setAllPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    loadAllPodcasts();
  }, []);

  // Reset when search or category filter changes
  useEffect(() => {
    setSortField(null);
  }, [searchQuery, categoryFilter]);

  const loadAllPodcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all podcasts by requesting a large page size
      let allResults: Podcast[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: '100', // Use max page size
        });

        const response = await fetch(`${API_BASE_URL}/multimedia/podcasts/?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch podcasts');
        }
        
        const data = await response.json();
        allResults = [...allResults, ...data.results];
        hasMore = data.next !== null;
        currentPage++;
      }

      setAllPodcasts(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching podcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allPodcasts.forEach((podcast) => {
      if (podcast.category) cats.add(podcast.category);
    });
    return Array.from(cats).sort();
  }, [allPodcasts]);

  // Client-side filtering - filter allPodcasts based on search query and category
  const filteredPodcasts = useMemo(() => {
    let filtered = [...allPodcasts];

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((podcast) => podcast.category === categoryFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((podcast) => {
        return (
          podcast.title.toLowerCase().includes(query) ||
          podcast.description.toLowerCase().includes(query) ||
          podcast.host.toLowerCase().includes(query) ||
          (podcast.guest && podcast.guest.toLowerCase().includes(query)) ||
          (podcast.tags && podcast.tags.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [allPodcasts, searchQuery, categoryFilter]);

  // Client-side sorting - sort the filtered podcasts array
  const sortedPodcasts = useMemo(() => {
    if (!sortField) return filteredPodcasts;

    const sorted = [...filteredPodcasts].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'host':
          aValue = a.host.toLowerCase();
          bValue = b.host.toLowerCase();
          break;
        case 'published_date':
          aValue = new Date(a.published_date).getTime();
          bValue = new Date(b.published_date).getTime();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredPodcasts, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading && allPodcasts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="support" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#085e29]"></div>
            <p className="mt-4 text-gray-600">Loading podcasts...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && allPodcasts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="support" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button
              onClick={() => loadAllPodcasts()}
              className="mt-4"
              variant="green"
            >
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="support" />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href="/multimedia"
            className="inline-flex items-center text-[#085e29] hover:text-[#064920] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Multimedia
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Podcasts</h1>
          <p className="text-gray-600 text-lg">Watch our YouTube podcast episodes on parliamentary matters and governance</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search podcasts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400"
                  style={{ color: '#111827' }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#085e29] focus:border-transparent text-gray-900 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {(searchQuery || categoryFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Podcasts Grid */}
        {sortedPodcasts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No podcasts found</p>
            {(searchQuery || categoryFilter !== 'all') && (
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPodcasts.map((podcast) => {
              const videoId = extractVideoId(podcast.youtube_url);
              const thumbnailUrl = podcast.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);

              return (
                <div
                  key={podcast.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 w-full bg-gray-200">
                    {podcast.thumbnail ? (
                      <img
                        src={`${API_BASE_URL.replace('/api', '')}${podcast.thumbnail}`}
                        alt={podcast.title}
                        className="w-full h-full object-cover"
                      />
                    ) : thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={podcast.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#085e29] to-[#064920] flex items-center justify-center">
                        <Play className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                      <a
                        href={podcast.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <div className="bg-[#085e29] rounded-full p-4">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </a>
                    </div>
                    {podcast.episode_number && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-[#085e29] text-white text-xs font-medium rounded">
                          Episode {podcast.episode_number}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{podcast.title}</h3>
                    
                    {podcast.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{podcast.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="truncate">{podcast.host}</span>
                      </div>
                      {podcast.guest && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Guest:</span> {podcast.guest}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(podcast.published_date)}</span>
                      </div>
                      {podcast.duration && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(podcast.duration)}</span>
                        </div>
                      )}
                    </div>

                    {/* Category */}
                    {podcast.category && (
                      <div className="mb-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {podcast.category}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {podcast.tags && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {podcast.tags.split(',').slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                          {podcast.tags.split(',').length > 3 && (
                            <span className="px-2 py-1 text-gray-500 text-xs">
                              +{podcast.tags.split(',').length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <a
                      href={podcast.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#085e29] text-white text-sm font-medium rounded-md hover:bg-[#064920] transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About Our Podcasts</h3>
          <p className="text-sm text-gray-600">
            Our podcasts feature in-depth discussions on parliamentary matters, governance, and civic engagement.
            Watch episodes on our YouTube channel to stay informed about important legislative and political topics.
          </p>
        </div>
      </main>
    </div>
  );
}

