'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { fetchBills, BillList } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type SortField = 'title' | 'year_introduced' | 'created_at' | 'bill_type' | 'status' | 'mover' | null;
type SortDirection = 'asc' | 'desc';

// Status slug to status mapping
const slugToStatus: { [key: string]: string } = {
  '1st-reading': '1st_reading',
  '2nd-reading': '2nd_reading',
  '3rd-reading': '3rd_reading',
  'waiting-assent': 'passed',
  'passed': 'passed', // Also allow 'passed' as slug
  'assented': 'assented',
  'withdrawn': 'withdrawn',
};

// Status configuration
const statusConfig: { [key: string]: { label: string; description: string } } = {
  '1st_reading': { label: '1st Reading', description: 'Bills in first reading stage' },
  '2nd_reading': { label: '2nd Reading', description: 'Bills in second reading stage' },
  '3rd_reading': { label: '3rd Reading', description: 'Bills in third reading stage' },
  'passed': { label: 'Waiting Assent', description: 'Bills passed and waiting for presidential assent' },
  'assented': { label: 'Assented', description: 'Bills that have been assented by the President' },
  'withdrawn': { label: 'Withdrawn', description: 'Bills that have been withdrawn' },
};

export default function BillsStatusPage() {
  const params = useParams();
  const statusSlug = params?.status as string;
  const status = slugToStatus[statusSlug];

  const [allBills, setAllBills] = useState<BillList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    if (status) {
      loadAllBills();
    }
  }, [status]);

  useEffect(() => {
    setSearchQuery('');
  }, [status]);

  const loadAllBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBills();
      setAllBills(data);
    } catch (err) {
      setError('Failed to load bills. Please try again later.');
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter bills by status
  const billsForStatus = useMemo(() => {
    return allBills.filter((bill) => bill.status === status);
  }, [allBills, status]);

  // Client-side filtering - filter based on search query
  const filteredBills = useMemo(() => {
    if (!searchQuery.trim()) return billsForStatus;

    const query = searchQuery.toLowerCase();
    return billsForStatus.filter((bill) => {
      return (
        bill.title.toLowerCase().includes(query) ||
        bill.mover.toLowerCase().includes(query) ||
        bill.bill_type_display.toLowerCase().includes(query) ||
        bill.status_display.toLowerCase().includes(query)
      );
    });
  }, [billsForStatus, searchQuery]);

  // Client-side sorting - sort the filtered bills array
  const sortedBills = useMemo(() => {
    if (!sortField) return filteredBills;

    const sorted = [...filteredBills].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'bill_type':
          aValue = (a.bill_type_display || '').toLowerCase();
          bValue = (b.bill_type_display || '').toLowerCase();
          break;
        case 'status':
          aValue = (a.status_display || '').toLowerCase();
          bValue = (b.status_display || '').toLowerCase();
          break;
        case 'year_introduced':
          aValue = parseInt(a.year_introduced) || 0;
          bValue = parseInt(b.year_introduced) || 0;
          break;
        case 'mover':
          aValue = (a.mover || '').toLowerCase();
          bValue = (b.mover || '').toLowerCase();
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
  }, [filteredBills, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (!statusSlug || !status) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Invalid status parameter</p>
            <Link href="/trackers/bills" className="text-[#2d5016] hover:underline mt-2 inline-block">
              Back to Bills
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const statusInfo = statusConfig[status];
  const totalCount = sortedBills.length;

  if (loading && allBills.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
            <p className="mt-4 text-gray-600">Loading bills...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && allBills.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button
              onClick={() => loadAllBills()}
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
            href="/trackers/bills"
            className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bills
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Bills - {statusInfo?.label || statusSlug}
          </h1>
          <p className="text-gray-600 text-lg">
            {statusInfo?.description || `Bills in ${statusInfo?.label.toLowerCase() || statusSlug} stage`}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-[#fafaf8] rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder={`Search through ${totalCount} bills...`}
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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading bills...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={() => loadAllBills()}
                className="mt-4"
                variant="green"
              >
                Try Again
              </Button>
            </div>
          ) : sortedBills.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#fafaf8]">
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-[#f5f0e8] transition-colors group text-xs font-medium text-gray-500 uppercase tracking-wider"
                      onClick={() => handleSort('title')}
                      title="Click to sort"
                    >
                      <div className="flex items-center gap-2">
                        Title
                        <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                          sortField === 'title' ? 'text-[#2d5016]' : ''
                        }`}>
                          {sortField === 'title' 
                            ? (sortDirection === 'asc' ? '↑' : '↓')
                            : '↕'
                          }
                        </span>
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-[#f5f0e8] transition-colors group text-xs font-medium text-gray-500 uppercase tracking-wider"
                      onClick={() => handleSort('bill_type')}
                      title="Click to sort"
                    >
                      <div className="flex items-center gap-2">
                        Type
                        <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                          sortField === 'bill_type' ? 'text-[#2d5016]' : ''
                        }`}>
                          {sortField === 'bill_type' 
                            ? (sortDirection === 'asc' ? '↑' : '↓')
                            : '↕'
                          }
                        </span>
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-[#f5f0e8] transition-colors group text-xs font-medium text-gray-500 uppercase tracking-wider"
                      onClick={() => handleSort('status')}
                      title="Click to sort"
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                          sortField === 'status' ? 'text-[#2d5016]' : ''
                        }`}>
                          {sortField === 'status' 
                            ? (sortDirection === 'asc' ? '↑' : '↓')
                            : '↕'
                          }
                        </span>
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-[#f5f0e8] transition-colors group text-xs font-medium text-gray-500 uppercase tracking-wider"
                      onClick={() => handleSort('year_introduced')}
                      title="Click to sort"
                    >
                      <div className="flex items-center gap-2">
                        Year Introduced
                        <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                          sortField === 'year_introduced' ? 'text-[#2d5016]' : ''
                        }`}>
                          {sortField === 'year_introduced' 
                            ? (sortDirection === 'asc' ? '↑' : '↓')
                            : '↕'
                          }
                        </span>
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-[#f5f0e8] transition-colors group text-xs font-medium text-gray-500 uppercase tracking-wider"
                      onClick={() => handleSort('mover')}
                      title="Click to sort"
                    >
                      <div className="flex items-center gap-2">
                        Mover
                        <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                          sortField === 'mover' ? 'text-[#2d5016]' : ''
                        }`}>
                          {sortField === 'mover' 
                            ? (sortDirection === 'asc' ? '↑' : '↓')
                            : '↕'
                          }
                        </span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-[#fafaf8] divide-y divide-gray-200">
                  {sortedBills.map((bill) => (
                    <TableRow key={bill.id} className="hover:bg-[#f5f0e8] transition-colors">
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900 max-w-md">
                          {bill.title}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bill.bill_type_display}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bill.status === 'assented'
                            ? 'bg-[#f5f0e8] text-gray-700'
                            : 'bg-emerald-50 text-[#2d5016]'
                        }`}>
                          {bill.status_display}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bill.year_introduced}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900 max-w-xs">{bill.mover}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/trackers/bills/${bill.id}`}
                          className="text-[#2d5016] hover:text-[#1b3d26] font-medium"
                        >
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery 
                  ? `No bills found matching "${searchQuery}"`
                  : `No bills found in ${statusInfo?.label.toLowerCase() || statusSlug} stage`}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchQuery ? 'Try adjusting your search query' : 'Check back later for new bills'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-[#fafaf8] rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About Bills</h3>
          <p className="text-sm text-gray-600">
            Bills are draft laws that go through several stages before becoming Acts of Parliament.
            Track the progress of bills through the legislative process, from introduction to final assent.
          </p>
        </div>
      </main>
    </div>
  );
}
