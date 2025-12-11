'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
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

export default function BillsTrackerPage() {
  // Store all bills loaded from the server
  const [allBills, setAllBills] = useState<BillList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    loadAllBills();
  }, []);

  const loadAllBills = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all bills without filters
      const data = await fetchBills();
      setAllBills(data);
    } catch (err) {
      setError('Failed to load bills. Please try again later.');
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering - filter allBills based on search query
  const filteredBills = useMemo(() => {
    if (!searchQuery.trim()) return allBills;

    const query = searchQuery.toLowerCase();
    return allBills.filter((bill) => {
      return (
        bill.title.toLowerCase().includes(query) ||
        bill.mover.toLowerCase().includes(query) ||
        bill.bill_type_display.toLowerCase().includes(query) ||
        bill.status_display.toLowerCase().includes(query)
      );
    });
  }, [allBills, searchQuery]);

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

  // Calculate summary from filtered results
  const summary = useMemo(() => {
    const statusCounts = {
      '1st_reading': 0,
      '2nd_reading': 0,
      '3rd_reading': 0,
      passed: 0,
      assented: 0,
      withdrawn: 0,
    };

    filteredBills.forEach((bill) => {
      const status = bill.status;
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++;
      }
    });

    return {
      '1st_reading': statusCounts['1st_reading'],
      '2nd_reading': statusCounts['2nd_reading'],
      '3rd_reading': statusCounts['3rd_reading'],
      passed: statusCounts.passed,
      assented: statusCounts.assented,
      withdrawn: statusCounts.withdrawn,
      total: filteredBills.length,
    };
  }, [filteredBills]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const steps = [
    {
      step: 1,
      title: 'A bill is a draft law',
      description: ''
    },
    {
      step: 2,
      title: 'It becomes an Act if it is approved by majority representatives in Parliament',
      description: ''
    },
    {
      step: 3,
      title: 'Signed by the President. An Act of Parliament is a law enforced in all areas of Uganda where it is applicable',
      description: ''
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="support" />

      <main className="relative">

        {/* How a Bill Becomes an Act Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-semibold text-slate-800 text-center mb-8">
              How a Bill Becomes an Act
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((stepItem, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-[#085e29] text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                      {stepItem.step}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-slate-200" style={{ transform: 'translateY(-50%)', width: 'calc(100% + 2rem)' }} />
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-[#085e29] mb-2 uppercase tracking-wide">
                    Step {stepItem.step}
                  </h3>

                  <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                    {stepItem.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bills Listing Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Current Bills</h2>
            <p className="text-slate-600">Browse all bills currently in the legislative process</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <p className="text-sm text-gray-500">1st Reading</p>
              {loading ? (
                <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.['1st_reading'] ?? 0}</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <p className="text-sm text-gray-500">2nd Reading</p>
              {loading ? (
                <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.['2nd_reading'] ?? 0}</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <p className="text-sm text-gray-500">3rd Reading</p>
              {loading ? (
                <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.['3rd_reading'] ?? 0}</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <p className="text-sm text-gray-500">Waiting Assent</p>
              {loading ? (
                <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.passed ?? 0}</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <p className="text-sm text-gray-500">Assented</p>
              {loading ? (
                <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.assented ?? 0}</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <p className="text-sm text-gray-500">Withdrawn</p>
              {loading ? (
                <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.withdrawn ?? 0}</p>
              )}
            </div>
          </div>

          {/* Search Section */}
          <div className="mb-6">
            <div className="flex gap-3 items-center">
              <div className="w-80">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bills by title..."
                  className="w-full text-gray-900 placeholder:text-gray-400"
                  style={{ color: '#111827' }}
                />
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

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
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors group text-xs font-medium text-gray-500 uppercase tracking-wider"
                        onClick={() => handleSort('title')}
                        title="Click to sort"
                      >
                      <div className="flex items-center gap-2">
                        Title
                        <span className={`text-gray-400 group-hover:text-[#085e29] transition-colors text-xs ${
                          sortField === 'title' ? 'text-[#085e29]' : ''
                        }`}>
                          {sortField === 'title' 
                            ? (sortDirection === 'asc' ? '↑' : '↓')
                            : '↕'
                          }
                        </span>
                      </div>
                    </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors group text-xs font-medium text-gray-500 uppercase tracking-wider"
                        onClick={() => handleSort('bill_type')}
                        title="Click to sort"
                      >
                        <div className="flex items-center gap-2">
                          Type
                          <span className={`text-gray-400 group-hover:text-[#085e29] transition-colors text-xs ${
                            sortField === 'bill_type' ? 'text-[#085e29]' : ''
                          }`}>
                            {sortField === 'bill_type' 
                              ? (sortDirection === 'asc' ? '↑' : '↓')
                              : '↕'
                            }
                          </span>
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors group text-xs font-medium text-gray-500 uppercase tracking-wider"
                        onClick={() => handleSort('status')}
                        title="Click to sort"
                      >
                        <div className="flex items-center gap-2">
                          Status
                          <span className={`text-gray-400 group-hover:text-[#085e29] transition-colors text-xs ${
                            sortField === 'status' ? 'text-[#085e29]' : ''
                          }`}>
                            {sortField === 'status' 
                              ? (sortDirection === 'asc' ? '↑' : '↓')
                              : '↕'
                            }
                          </span>
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors group text-xs font-medium text-gray-500 uppercase tracking-wider"
                        onClick={() => handleSort('year_introduced')}
                        title="Click to sort"
                      >
                        <div className="flex items-center gap-2">
                          Year Introduced
                          <span className={`text-gray-400 group-hover:text-[#085e29] transition-colors text-xs ${
                            sortField === 'year_introduced' ? 'text-[#085e29]' : ''
                          }`}>
                            {sortField === 'year_introduced' 
                              ? (sortDirection === 'asc' ? '↑' : '↓')
                              : '↕'
                            }
                          </span>
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors group text-xs font-medium text-gray-500 uppercase tracking-wider"
                        onClick={() => handleSort('mover')}
                        title="Click to sort"
                      >
                        <div className="flex items-center gap-2">
                          Mover
                          <span className={`text-gray-400 group-hover:text-[#085e29] transition-colors text-xs ${
                            sortField === 'mover' ? 'text-[#085e29]' : ''
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
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {sortedBills.map((bill) => (
                      <TableRow key={bill.id} className="hover:bg-gray-50 transition-colors">
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
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-emerald-50 text-[#085e29]'
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
                          className="text-[#085e29] hover:text-[#064920] font-medium"
                        >
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-600">
                {searchQuery 
                  ? `No bills found matching "${searchQuery}". Try a different search term.`
                  : 'No bills found. Please check back later.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}