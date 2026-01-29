'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, DollarSign, Building2, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Loan {
  id: number;
  sector: string;
  sector_display: string;
  label: string;
  approved_amount: number;
  currency: string;
  currency_display: string;
  source: string;
  source_display: string;
  approval_date: string | null;
  description: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Loan[];
}

interface SourceSummary {
  source: string;
  name: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

const COLORS = ['#2d5016', '#f97316', '#dc2626', '#3b82f6', '#8b5cf6', '#ec4899'];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function LoansTrackerPage() {
  // Store all loans loaded from the server
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'sector' | 'label' | 'approved_amount' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const pageSize = 10;

  useEffect(() => {
    loadAllLoans();
  }, []);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const loadAllLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all loans by requesting a large page size
      // The backend max_page_size is 100, so we'll fetch in chunks if needed
      let allResults: Loan[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
      const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: '100', // Use max page size
      });

        const response = await fetch(`${API_BASE_URL}/trackers/loans/?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch loans');
      }
        
      const data: PaginatedResponse = await response.json();
        allResults = [...allResults, ...data.results];
        hasMore = data.next !== null;
        currentPage++;
      }

      setAllLoans(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering - filter allLoans based on search query
  const filteredLoans = useMemo(() => {
    if (!searchQuery.trim()) return allLoans;

    const query = searchQuery.toLowerCase();
    return allLoans.filter((loan) => {
      return (
        loan.label.toLowerCase().includes(query) ||
        loan.description.toLowerCase().includes(query) ||
        loan.sector_display.toLowerCase().includes(query) ||
        loan.source_display.toLowerCase().includes(query)
      );
    });
  }, [allLoans, searchQuery]);

  // Client-side sorting - sort the filtered loans array
  const sortedLoans = useMemo(() => {
    if (!sortField) return filteredLoans;

    const sorted = [...filteredLoans].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'sector':
          aValue = (a.sector_display || '').toLowerCase();
          bValue = (b.sector_display || '').toLowerCase();
          break;
        case 'label':
          aValue = (a.label || '').toLowerCase();
          bValue = (b.label || '').toLowerCase();
          break;
        case 'approved_amount':
          aValue = a.approved_amount || 0;
          bValue = b.approved_amount || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredLoans, sortField, sortDirection]);

  // Client-side pagination - paginate the sorted results
  const paginatedLoans = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedLoans.slice(startIndex, endIndex);
  }, [sortedLoans, page, pageSize]);

  const handleSort = (field: 'sector' | 'label' | 'approved_amount') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Calculate sources summary from filtered results
  const sourcesSummary = useMemo(() => {
    const sourceCounts = new Map<string, number>();
    
    filteredLoans.forEach((loan) => {
      if (loan.source) {
        sourceCounts.set(loan.source, (sourceCounts.get(loan.source) || 0) + 1);
    }
    });

    const total = filteredLoans.length;
    const summary: SourceSummary[] = Array.from(sourceCounts.entries())
      .map(([source, count]) => {
        // Find the display name from the first loan with this source
        const loanWithSource = filteredLoans.find(l => l.source === source);
        return {
          source,
          name: loanWithSource?.source_display || source,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0
        };
      })
      .sort((a, b) => b.count - a.count);

    return summary;
  }, [filteredLoans]);

  const totalPages = Math.ceil(sortedLoans.length / pageSize);

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  if (loading && allLoans.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
            <p className="mt-4 text-gray-600">Loading loans tracker data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && allLoans.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button
              onClick={() => loadAllLoans()}
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Loans Tracker</h1>
          <p className="text-gray-600 text-lg">Track government loans and development projects</p>
        </div>

        {/* Statistics Cards */}
        {!loading && allLoans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Loans */}
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <DollarSign className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">Total Loans</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredLoans.length.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Total Sources */}
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <Building2 className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">Loan Sources</p>
                  <p className="text-2xl font-bold text-gray-900">{sourcesSummary.length}</p>
                </div>
              </div>
            </div>

            {/* Total Amount */}
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
                  <p className="text-gray-600 text-sm mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">
                    {filteredLoans.length > 0 
                      ? formatCurrency(
                          filteredLoans.reduce((sum, loan) => sum + (loan.approved_amount || 0), 0),
                          filteredLoans[0].currency
                        )
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Table and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loan Debt Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Loan Debt</h2>
            </div>
            <div className="p-6">

            {/* Search */}
            <div className="mb-4">
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Input
                  type="text"
                    placeholder={`Search through ${filteredLoans.length} records...`}
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
                    className="bg-[#fafaf8] text-gray-700 hover:bg-[#f5f0e8] border-gray-300"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8]">
                  <tr>
                    <th 
                      className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors group"
                      onClick={() => handleSort('sector')}
                      title="Click to sort"
                    >
                      <div className="flex items-center gap-2">
                        Sector
                        <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                          sortField === 'sector' ? 'text-[#2d5016]' : ''
                        }`}>
                          {sortField === 'sector' 
                            ? (sortDirection === 'asc' ? '↑' : '↓')
                            : '↕'
                          }
                        </span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors group"
                      onClick={() => handleSort('label')}
                      title="Click to sort"
                    >
                      <div className="flex items-center gap-2">
                        Label
                        <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                          sortField === 'label' ? 'text-[#2d5016]' : ''
                        }`}>
                          {sortField === 'label' 
                            ? (sortDirection === 'asc' ? '↑' : '↓')
                            : '↕'
                          }
                        </span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors group"
                      onClick={() => handleSort('approved_amount')}
                      title="Click to sort"
                    >
                      <div className="flex items-center gap-2">
                        Approved Amount
                        <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                          sortField === 'approved_amount' ? 'text-[#2d5016]' : ''
                        }`}>
                          {sortField === 'approved_amount' 
                            ? (sortDirection === 'asc' ? '↑' : '↓')
                            : '↕'
                          }
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-[#fafaf8] transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{loan.sector_display}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{loan.label}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(loan.approved_amount, loan.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                Showing page {page} of {totalPages} ({filteredLoans.length} total loans)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-4 py-2 text-sm font-medium text-gray-700">
                  Per Page: {pageSize}
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>
          </div>

          {/* Loan Sources Chart */}
          <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">LOAN SOURCES</h2>

            {sourcesSummary.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourcesSummary}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="percentage"
                      label={(props: any) => {
                        const { percentage } = props.payload || {};
                        return `${percentage}%`;
                      }}
                    >
                      {sourcesSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value}%`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Loan Sources</h3>
                  {sourcesSummary.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-700">{source.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{source.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No loan sources data available</p>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About This Data</h3>
          <p className="text-sm text-gray-600">
            Loan data includes government-approved loans and development projects from various international and bilateral sources.
            All amounts are in their original currency denominations. Data is regularly updated from official government records.
          </p>
        </div>
      </main>
    </div>
  );
}