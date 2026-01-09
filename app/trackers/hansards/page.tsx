'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Hansard {
  id: number;
  name: string;
  date: string | null;
  date_received: string | null;
  file: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Hansard[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function HansardsTrackerPage() {
  // Store all hansards loaded from the server
  const [allHansards, setAllHansards] = useState<Hansard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'name' | 'date' | 'created_at' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const pageSize = 15;

  useEffect(() => {
    loadAllHansards();
  }, []);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const loadAllHansards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all hansards by requesting a large page size
      // The backend max_page_size is 100, so we'll fetch in chunks if needed
      let allResults: Hansard[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
      const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: '100', // Use max page size
      });

        const response = await fetch(`${API_BASE_URL}/trackers/hansards/?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hansards');
      }
        
      const data: PaginatedResponse = await response.json();
        allResults = [...allResults, ...data.results];
        hasMore = data.next !== null;
        currentPage++;
      }

      setAllHansards(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching hansards:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering - filter allHansards based on search query
  const filteredHansards = useMemo(() => {
    if (!searchQuery.trim()) return allHansards;

    const query = searchQuery.toLowerCase();
    return allHansards.filter((hansard) => {
      return hansard.name.toLowerCase().includes(query);
    });
  }, [allHansards, searchQuery]);

  // Client-side sorting - sort the filtered hansards array
  const sortedHansards = useMemo(() => {
    if (!sortField) return filteredHansards;

    const sorted = [...filteredHansards].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = a.date ? new Date(a.date).getTime() : 0;
          bValue = b.date ? new Date(b.date).getTime() : 0;
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
  }, [filteredHansards, sortField, sortDirection]);

  // Client-side pagination - paginate the sorted results
  const paginatedHansards = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedHansards.slice(startIndex, endIndex);
  }, [sortedHansards, page, pageSize]);

  const totalPages = Math.ceil(sortedHansards.length / pageSize);
  const totalCount = sortedHansards.length;

  const handleSort = (field: 'name' | 'date' | 'created_at') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && allHansards.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3eed4]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
            <p className="mt-4 text-gray-600">Loading hansards...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && allHansards.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3eed4]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button
              onClick={() => loadAllHansards()}
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
            href="/trackers"
            className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trackers
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Hansards</h1>
          <p className="text-gray-600 text-lg">Access official parliamentary records and proceedings</p>
        </div>

        {/* Main Content */}
        <div className="bg-[#f3eed4] rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                type="text"
                placeholder={`Search through ${totalCount} hansards...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400"
                  style={{ color: '#111827' }}
                />
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="bg-[#d2c4b0] text-gray-700 hover:bg-[#c4b5a0] border-gray-300"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#ddd0b8]">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-[#d2c4b0] transition-colors group"
                    onClick={() => handleSort('name')}
                    title="Click to sort"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Document Name
                      <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                        sortField === 'name' ? 'text-[#2d5016]' : ''
                      }`}>
                        {sortField === 'name' 
                          ? (sortDirection === 'asc' ? '↑' : '↓')
                          : '↕'
                        }
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-[#d2c4b0] transition-colors group"
                    onClick={() => handleSort('date')}
                    title="Click to sort"
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                        sortField === 'date' ? 'text-[#2d5016]' : ''
                      }`}>
                        {sortField === 'date' 
                          ? (sortDirection === 'asc' ? '↑' : '↓')
                          : '↕'
                        }
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date Received
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedHansards.map((hansard) => (
                  <tr key={hansard.id} className="hover:bg-[#f3eed4] transition-colors">
                    <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{hansard.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(hansard.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {hansard.date_received ? formatDate(hansard.date_received) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={hansard.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2d5016] text-white text-sm font-medium rounded-md hover:bg-[#1b3d26] transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {sortedHansards.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hansards found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchQuery ? 'Try adjusting your search query' : 'Check back later for new hansards'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {sortedHansards.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} hansards
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f3eed4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f3eed4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-4 py-2 text-sm font-medium text-gray-700">
                  Page {page} of {totalPages}
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f3eed4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f3eed4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-[#f3eed4] rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About Hansards</h3>
          <p className="text-sm text-gray-600">
            Hansards are the official transcripts of parliamentary debates and proceedings in Uganda.
            These records provide a complete account of all discussions, motions, and votes that take place in Parliament.
            Access historical and recent hansards to stay informed about legislative activities.
          </p>
        </div>
      </main>
    </div>
  );
}