'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Calendar, Clock, User, ExternalLink, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchXSpaces, XSpace } from '@/lib/api';

type SortField = 'title' | 'scheduled_date' | 'host' | 'created_at' | null;
type SortDirection = 'asc' | 'desc';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function XSpacesPage() {
  // Store all X Spaces loaded from the server
  const [allXSpaces, setAllXSpaces] = useState<XSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    loadAllXSpaces();
  }, []);

  // Reset when search or status filter changes
  useEffect(() => {
    setSortField(null);
  }, [searchQuery, statusFilter]);

  const loadAllXSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all X Spaces by requesting a large page size
      let allResults: XSpace[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: '100', // Use max page size
        });

        const response = await fetch(`${API_BASE_URL}/multimedia/x-spaces/?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch X Spaces');
        }
        
        const data = await response.json();
        allResults = [...allResults, ...data.results];
        hasMore = data.next !== null;
        currentPage++;
      }

      setAllXSpaces(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching X Spaces:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering - filter allXSpaces based on search query and status
  const filteredXSpaces = useMemo(() => {
    let filtered = [...allXSpaces];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((space) => space.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((space) => {
        return (
          space.title.toLowerCase().includes(query) ||
          space.description.toLowerCase().includes(query) ||
          space.host.toLowerCase().includes(query) ||
          space.topics.toLowerCase().includes(query) ||
          space.speakers.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [allXSpaces, searchQuery, statusFilter]);

  // Client-side sorting - sort the filtered X Spaces array
  const sortedXSpaces = useMemo(() => {
    if (!sortField) return filteredXSpaces;

    const sorted = [...filteredXSpaces].sort((a, b) => {
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
        case 'scheduled_date':
          aValue = new Date(a.scheduled_date).getTime();
          bValue = new Date(b.scheduled_date).getTime();
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
  }, [filteredXSpaces, sortField, sortDirection]);

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'live':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-[#ddd0b8] text-gray-800';
      default:
        return 'bg-[#ddd0b8] text-gray-800';
    }
  };

  if (loading && allXSpaces.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3eed4]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
            <p className="mt-4 text-gray-600">Loading X Spaces...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && allXSpaces.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3eed4]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button
              onClick={() => loadAllXSpaces()}
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
    <div className="min-h-screen bg-[#f3eed4]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href="/multimedia"
            className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Multimedia
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">X Spaces</h1>
          <p className="text-gray-600 text-lg">Join our live discussions and listen to recorded X Spaces events</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-[#f3eed4] rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search X Spaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400"
                  style={{ color: '#111827' }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2d5016] focus:border-transparent text-gray-900 bg-[#f3eed4]"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {(searchQuery || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="bg-[#d2c4b0] text-gray-700 hover:bg-[#c4b5a0] border-gray-300"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* X Spaces Grid */}
        {sortedXSpaces.length === 0 ? (
          <div className="bg-[#f3eed4] rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No X Spaces found</p>
            {(searchQuery || statusFilter !== 'all') && (
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedXSpaces.map((space) => (
              <div
                key={space.id}
                className="bg-[#f3eed4] rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                {space.thumbnail ? (
                  <div className="relative h-48 w-full">
                    <img
                      src={`${API_BASE_URL.replace('/api', '')}${space.thumbnail}`}
                      alt={space.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(space.status)}`}>
                        {space.status_display}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 w-full bg-gradient-to-br from-[#2d5016] to-[#1b3d26] flex items-center justify-center">
                    <div className="text-white text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm font-medium">{space.status_display}</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(space.status)}`}>
                        {space.status_display}
                      </span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{space.title}</h3>
                  
                  {space.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{space.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="truncate">{space.host}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(space.scheduled_date)}</span>
                    </div>
                    {space.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{space.duration} minutes</span>
                      </div>
                    )}
                  </div>

                  {/* Topics */}
                  {space.topics && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Topics:</p>
                      <div className="flex flex-wrap gap-1">
                        {space.topics.split(',').slice(0, 3).map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-[#ddd0b8] text-gray-700 text-xs rounded"
                          >
                            {topic.trim()}
                          </span>
                        ))}
                        {space.topics.split(',').length > 3 && (
                          <span className="px-2 py-1 text-gray-500 text-xs">
                            +{space.topics.split(',').length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={space.x_space_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2d5016] text-white text-sm font-medium rounded-md hover:bg-[#1b3d26] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {space.status === 'live' ? 'Join Live' : space.status === 'upcoming' ? 'View on X' : 'View'}
                    </a>
                    {space.recording_url && (
                      <a
                        href={space.recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-[#f3eed4] transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Recording
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 bg-[#f3eed4] rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About X Spaces</h3>
          <p className="text-sm text-gray-600">
            X Spaces are live audio conversations on X (formerly Twitter). Join our discussions on parliamentary
            matters, governance, and civic engagement. You can participate in live spaces or listen to recordings
            of past events.
          </p>
        </div>
      </main>
    </div>
  );
}


