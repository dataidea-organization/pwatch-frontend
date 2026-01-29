'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText, TrendingUp, Clock } from 'lucide-react';
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
  const [allHansards, setAllHansards] = useState<Hansard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllHansards();
  }, []);

  const loadAllHansards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let allResults: Hansard[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: '100',
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

  // Extract unique years from hansards
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    
    allHansards.forEach((hansard) => {
      if (hansard.date) {
        const year = new Date(hansard.date).getFullYear();
        if (!isNaN(year)) {
          yearSet.add(year);
        }
      }
    });

    // Convert to array and sort descending (most recent first)
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [allHansards]);

  // Count hansards per year
  const getHansardCountForYear = (year: number) => {
    return allHansards.filter((hansard) => {
      if (!hansard.date) return false;
      return new Date(hansard.date).getFullYear() === year;
    }).length;
  };

  // Count hansards without dates
  const undatedCount = useMemo(() => {
    return allHansards.filter((hansard) => !hansard.date).length;
  }, [allHansards]);

  // Statistics calculations
  const stats = useMemo(() => {
    const totalHansards = allHansards.length;
    const totalYears = years.length;
    
    // Helper function to count hansards per year
    const countForYear = (year: number) => {
      return allHansards.filter((hansard) => {
        if (!hansard.date) return false;
        return new Date(hansard.date).getFullYear() === year;
      }).length;
    };
    
    // Find most active year
    let mostActiveYear = null;
    let maxCount = 0;
    years.forEach((year) => {
      const count = countForYear(year);
      if (count > maxCount) {
        maxCount = count;
        mostActiveYear = year;
      }
    });

    // Count recent additions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCount = allHansards.filter((hansard) => {
      if (!hansard.created_at) return false;
      return new Date(hansard.created_at) >= thirtyDaysAgo;
    }).length;

    return {
      totalHansards,
      totalYears,
      mostActiveYear,
      maxCount,
      recentCount,
    };
  }, [allHansards, years]);

  if (loading && allHansards.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
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
      <div className="min-h-screen bg-[#f5f0e8]">
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
    <div className="min-h-screen bg-[#f5f0e8]">
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
        </div>

        {/* Statistics Cards */}
        {!loading && allHansards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Hansards */}
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <FileText className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">Total Hansards</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHansards.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Years Covered */}
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <Calendar className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">Years Covered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalYears}</p>
                </div>
              </div>
            </div>

            {/* Most Active Year */}
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <TrendingUp className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">Most Active Year</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.mostActiveYear || 'N/A'}
                  </p>
                  {stats.mostActiveYear && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.maxCount} {stats.maxCount === 1 ? 'hansard' : 'hansards'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Additions */}
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <Clock className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">Last 30 Days</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentCount}</p>
                  <p className="text-xs text-gray-500 mt-1">New hansards</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-600 text-lg">Select a year to view parliamentary records and proceedings</p>
        </div>

        {/* Year Cards Grid */}
        {(years.length > 0 || undatedCount > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {years.map((year) => {
              const count = getHansardCountForYear(year);
              return (
                <Link
                  key={year}
                  href={`/trackers/hansards/${year}`}
                  className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-xl hover:border-[#2d5016] hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                >
                  {/* Decorative background pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                    <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-3xl"></div>
                  </div>
                  
                  {/* Document icon pattern in background */}
                  <div className="absolute bottom-0 right-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FileText className="w-24 h-24 text-[#2d5016] transform rotate-12" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon container */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="p-3 bg-white/60 rounded-lg group-hover:bg-white/80 transition-colors shadow-sm">
                        <Calendar className="w-8 h-8 text-[#2d5016] group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    
                    {/* Year */}
                    <h2 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#2d5016] transition-colors">
                      {year}
                    </h2>
                    
                    {/* Count */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#2d5016]"></div>
                      <p className="text-sm font-medium text-gray-700">
                        {count} {count === 1 ? 'hansard' : 'hansards'}
                      </p>
                    </div>
                  </div>

                  {/* Hover arrow indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-[#2d5016] flex items-center justify-center">
                      <ArrowLeft className="w-4 h-4 text-white rotate-180" />
                    </div>
                  </div>
                </Link>
              );
            })}
            
            {/* Undated Card */}
            {undatedCount > 0 && (
              <Link
                href="/trackers/hansards/undated"
                className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-md border border-gray-300 p-8 hover:shadow-xl hover:border-gray-400 hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
              >
                {/* Decorative background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="absolute inset-0 bg-gray-600 rounded-full blur-3xl"></div>
                </div>
                
                {/* Document icon pattern in background */}
                <div className="absolute bottom-0 right-0 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FileText className="w-24 h-24 text-gray-600 transform rotate-12" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon container */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="p-3 bg-white/60 rounded-lg group-hover:bg-white/80 transition-colors shadow-sm">
                      <FileText className="w-8 h-8 text-gray-600 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  
                  {/* Label */}
                  <h2 className="text-2xl font-bold text-gray-700 mb-3 group-hover:text-gray-900 transition-colors">
                    Undated
                  </h2>
                  
                  {/* Count */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    <p className="text-sm font-medium text-gray-600">
                      {undatedCount} {undatedCount === 1 ? 'hansard' : 'hansards'}
                    </p>
                  </div>
                </div>

                {/* Hover arrow indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 text-white rotate-180" />
                  </div>
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-[#fafaf8] rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hansards available</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for new hansards</p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 bg-[#fafaf8] rounded-lg shadow-sm border border-gray-200 p-6">
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