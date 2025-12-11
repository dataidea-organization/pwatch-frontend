'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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
}

const COLORS = ['#085e29', '#f97316', '#dc2626', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function LoansTrackerPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [sourcesSummary, setSourcesSummary] = useState<SourceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchLoans();
    fetchSourcesSummary();
  }, [page, searchQuery]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`http://localhost:8000/api/trackers/loans/?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch loans');
      }
      const data: PaginatedResponse = await response.json();
      setLoans(data.results);
      setTotalCount(data.count);
      setTotalPages(Math.ceil(data.count / pageSize));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSourcesSummary = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/trackers/loans/sources_summary/');
      if (!response.ok) {
        throw new Error('Failed to fetch sources summary');
      }
      const data: SourceSummary[] = await response.json();
      setSourcesSummary(data);
    } catch (err) {
      console.error('Error fetching sources summary:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLoans();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  if (loading && loans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="support" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#085e29]"></div>
            <p className="mt-4 text-gray-600">Loading loans tracker data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && loans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="support" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
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
      <Header variant="support" />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href="/trackers"
            className="inline-flex items-center text-[#085e29] hover:text-[#064920] transition-colors"
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

        {/* Main Content - Table and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loan Debt Table */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">LOAN DEBT</h2>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search through ${totalCount} records...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#085e29] focus:border-transparent"
                />
              </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sector</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Label</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Approved Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-900">{loan.sector_display}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{loan.label}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
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
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-4 py-2 text-sm font-medium">
                  Per Page: {pageSize}
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loan Sources Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                      label={({ percentage }) => `${percentage}%`}
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
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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