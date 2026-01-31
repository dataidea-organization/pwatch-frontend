'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText, BookOpen, CheckCircle, Clock, Award, XCircle, FileCheck, Users, PenTool, ArrowRight, Search } from 'lucide-react';
import { fetchBills, BillList, fetchPageHeroImage } from '@/lib/api';
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

function BillsTrackerPageContent() {
  // Store all bills loaded from the server
  const [allBills, setAllBills] = useState<BillList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [heroImage, setHeroImage] = useState<string>('/images/bills.jpg');

  useEffect(() => {
    loadAllBills();
    // Fetch dynamic hero image
    fetchPageHeroImage('bills').then((data) => {
      if (data?.image) {
        setHeroImage(data.image);
      }
    });
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



  // Get count for a specific status
  const getBillCountForStatus = (status: string) => {
    return allBills.filter((bill) => bill.status === status).length;
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Status configuration for cards
  const statusConfig = [
    {
      status: '1st_reading',
      label: '1st Reading',
      icon: FileText,
      description: 'bills',
    },
    {
      status: '2nd_reading',
      label: '2nd Reading',
      icon: BookOpen,
      description: 'bills',
    },
    {
      status: '3rd_reading',
      label: '3rd Reading',
      icon: CheckCircle,
      description: 'bills',
    },
    {
      status: 'passed',
      label: 'Waiting Assent',
      icon: Clock,
      description: 'bills',
    },
    {
      status: 'assented',
      label: 'Assented',
      icon: Award,
      description: 'bills',
    },
    {
      status: 'withdrawn',
      label: 'Withdrawn',
      icon: XCircle,
      description: 'bills',
    },
  ];

  // Status slug mapping (URL-friendly format)
  const statusToSlug = (status: string): string => {
    // Special case: 'passed' maps to 'waiting-assent'
    if (status === 'passed') {
      return 'waiting-assent';
    }
    return status.replace(/_/g, '-');
  };
  const steps = [
    {
      step: 1,
      title: 'Draft Bill',
      description: 'A bill is a draft law prepared for consideration by Parliament',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
    },
    {
      step: 2,
      title: 'Parliamentary Approval',
      description: 'It becomes an Act if approved by majority representatives in Parliament',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      step: 3,
      title: 'Presidential Assent',
      description: 'Signed by the President. An Act of Parliament is a law enforced in all areas of Uganda where it is applicable',
      icon: PenTool,
      color: 'from-[#2d5016] to-[#1b3d26]',
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">

      <main className="relative">
        {/* Breadcrumb and Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/trackers" className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trackers
            </Link>
          </div>

          {/* Hero Section - full-cover image with text on dark overlay at bottom (height matches home page hero) */}
          <div className="relative mb-10 h-[400px] overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={heroImage}
              alt="Bills tracker - legislative bills and acts"
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized={heroImage.startsWith('http')}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 z-10 px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 mb-3">
                  <FileText className="w-4 h-4 text-white" aria-hidden />
                  <span className="text-sm font-medium text-white/90">Legislative process</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-3">
                  Bills Tracker
                </h1>
                <p className="text-base text-white/90 leading-relaxed sm:text-lg">
                  Track bills through the legislative process from draft to assent. Browse by status,
                  search by title or mover, and follow how a bill becomes an Act of Parliament.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How a Bill Becomes an Act Section */}
        <div className="bg-[#f5f0e8] border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                How a Bill Becomes an Act
              </h2>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-[#2d5016]/20"></div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 relative">
                {steps.map((stepItem, index) => {
                  const Icon = stepItem.icon;
                  return (
                    <div key={index} className="relative">
                      {/* Compact Card with consistent styling */}
                      <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-xl hover:border-[#2d5016] hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                        {/* Decorative background pattern */}
                        <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
                          <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
                        </div>
                        
                        {/* Document icon pattern in background */}
                        <div className="absolute bottom-0 right-0 opacity-5 group-hover:opacity-10 transition-opacity">
                          <FileText className="w-16 h-16 text-[#2d5016] transform rotate-12" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                          <div className="flex items-start gap-4">
                            {/* Icon container */}
                            <div className="flex-shrink-0">
                              <div className="p-2.5 bg-white/60 rounded-lg group-hover:bg-white/80 transition-colors shadow-sm">
                                <Icon className="w-5 h-5 text-[#2d5016] group-hover:scale-110 transition-transform" />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-[#2d5016]">Step {stepItem.step}</span>
                                {index < steps.length - 1 && (
                                  <ArrowRight className="hidden lg:block w-3 h-3 text-gray-400 ml-auto" />
                                )}
                              </div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-1.5 group-hover:text-[#2d5016] transition-colors">
                                {stepItem.title}
                              </h3>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {stepItem.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Connecting line for mobile */}
                      {index < steps.length - 1 && (
                        <div className="lg:hidden flex justify-center my-3">
                          <div className="w-px h-4 bg-gradient-to-b from-gray-300 to-transparent"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bills Listing Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Current Bills</h2>
            <p className="text-gray-600">Select a status to view bills in that stage of the legislative process, or search from all bills in the table below</p>
          </div>

          {/* Status Cards Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
              <p className="mt-4 text-gray-600">Loading bills...</p>
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
          ) : allBills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {statusConfig.map((config) => {
                const Icon = config.icon;
                const count = getBillCountForStatus(config.status);
                if (count === 0) return null;
                
                return (
                  <Link
                    key={config.status}
                    href={`/trackers/bills/status/${statusToSlug(config.status)}`}
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
                          <Icon className="w-8 h-8 text-[#2d5016] group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                      
                      {/* Status Label */}
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#2d5016] transition-colors">
                        {config.label}
                      </h2>
                      
                      {/* Count */}
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#2d5016]"></div>
                        <p className="text-sm font-medium text-gray-700">
                          {count} {count === 1 ? 'bill' : 'bills'}
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
            </div>
          ) : (
            <div className="bg-[#fafaf8] rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No bills available</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for new bills</p>
            </div>
          )}

          {/* All Bills Table */}
          <div className="mt-12">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">All Bills</h3>
              <p className="text-slate-600 text-sm">Search and filter through all bills</p>
            </div>

            {/* Search Section */}
            <div className="mb-6">
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Input
                    type="text"
                    placeholder="Search bills by title, mover, type, or status..."
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
              <div className="bg-[#fafaf8] rounded-lg shadow-sm overflow-hidden">
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
              </div>
            ) : (
              <div className="text-center py-16 bg-[#fafaf8] rounded-lg border border-slate-200">
                <p className="text-slate-600">
                  {searchQuery 
                    ? `No bills found matching "${searchQuery}". Try a different search term.`
                    : 'No bills found. Please check back later.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BillsTrackerPage() {
  return <BillsTrackerPageContent />;
}