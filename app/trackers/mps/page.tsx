'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Building2, MapPin, ArrowLeft } from 'lucide-react';
import { fetchMPs, fetchMPSummary, fetchParliamentTerms, MP, MPSummary, ParliamentTerm, fetchPageHeroImage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

// Party color mapping
const PARTY_COLORS: Record<string, string> = {
  'NRM': '#FCD34D',      // Yellow
  'NUP': '#EF4444',      // Red
  'FDC': '#7DD3FC',      // Sky Blue
  'DP': '#22C55E',       // Green
  'UPC': '#000000',      // Black
  'ANT': '#A855F7',      // Purple
  'JEEMA': '#3B82F6',    // Blue
  'UFA': '#93C5FD',      // Light Blue
  'PPP': '#FCA5A5',      // Light Red
  'EPU': '#6EE7B7',      // Light Green
  'PPF': '#B91C1C',      // Dark Red
  'INDP.': '#9CA3AF',    // Gray
  'INDEP.': '#9CA3AF',   // Gray (alternative spelling)
  'INDEPENDENT': '#9CA3AF', // Gray (full word)
};

// Fallback color for unknown parties
const DEFAULT_PARTY_COLOR = '#6B7280';

// Function to get color for a party
const getPartyColor = (party: string): string => {
  if (!party) return DEFAULT_PARTY_COLOR;
  const normalizedParty = party.toUpperCase().trim();
  return PARTY_COLORS[normalizedParty] || DEFAULT_PARTY_COLOR;
};

export default function MPsPage() {
  // Store all MPs loaded from the server
  const [allMps, setAllMps] = useState<MP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [parliamentTerms, setParliamentTerms] = useState<ParliamentTerm[]>([]);
  const [selectedParliamentTermId, setSelectedParliamentTermId] = useState<number | null>(null);
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedSearchTerms, setSelectedSearchTerms] = useState<string[]>([]);
  const [partyFilterTerm, setPartyFilterTerm] = useState('');
  const [districtFilterTerm, setDistrictFilterTerm] = useState('');
  const [searchFilterTerm, setSearchFilterTerm] = useState('');
  const [nameSearchTerm, setNameSearchTerm] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [partyDropdownOpen, setPartyDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'party' | 'district' | 'constituency' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [heroImage, setHeroImage] = useState<string>('/images/mps.jpg');

  const districtOptions = useMemo(() => {
    const set = new Set<string>();
    allMps.forEach((mp) => {
      if (mp.district) set.add(mp.district);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allMps]);

  const searchOptions = useMemo(() => {
    const set = new Set<string>();
    allMps.forEach((mp) => {
      if (mp.name) set.add(mp.name);
      if (mp.constituency) set.add(mp.constituency);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allMps]);

  const partyOptions = useMemo(() => {
    const set = new Set<string>();
    allMps.forEach((mp) => {
      if (mp.party) set.add(mp.party);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allMps]);

  // Client-side filtering - filter allMps based on selected filters
  const filteredMps = useMemo(() => {
    let filtered = [...allMps];

    // Filter by name search term (first name, last name, or full name)
    if (nameSearchTerm.trim()) {
      const searchLower = nameSearchTerm.toLowerCase().trim();
      filtered = filtered.filter((mp) => {
        const fullName = mp.name.toLowerCase();
        const firstName = mp.first_name?.toLowerCase() || '';
        const lastName = mp.last_name?.toLowerCase() || '';
        return fullName.includes(searchLower) || 
               firstName.includes(searchLower) || 
               lastName.includes(searchLower);
      });
    }

    // Filter by search terms (name or constituency)
    if (selectedSearchTerms.length > 0) {
      filtered = filtered.filter((mp) => {
        const searchLower = selectedSearchTerms.map(term => term.toLowerCase());
        return searchLower.some(term => 
          mp.name.toLowerCase().includes(term) || 
          mp.constituency.toLowerCase().includes(term)
        );
      });
    }

    // Filter by parties (case-insensitive)
    if (selectedParties.length > 0) {
      filtered = filtered.filter((mp) => {
        return selectedParties.some(party => 
          mp.party.toLowerCase() === party.toLowerCase()
        );
      });
    }

    // Filter by districts (case-insensitive)
    if (selectedDistricts.length > 0) {
      filtered = filtered.filter((mp) => {
        return selectedDistricts.some(district => 
          mp.district.toLowerCase() === district.toLowerCase()
        );
      });
    }

    return filtered;
  }, [allMps, nameSearchTerm, selectedSearchTerms, selectedParties, selectedDistricts]);

  // Client-side sorting - sort the filtered mps array based on sortField and sortDirection
  const sortedMps = useMemo(() => {
    if (!sortField) return filteredMps;

    const sorted = [...filteredMps].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'party':
          aValue = (a.party || '').toLowerCase();
          bValue = (b.party || '').toLowerCase();
          break;
        case 'constituency':
          aValue = (a.constituency || '').toLowerCase();
          bValue = (b.constituency || '').toLowerCase();
          break;
        case 'district':
          aValue = (a.district || '').toLowerCase();
          bValue = (b.district || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredMps, sortField, sortDirection]);

  // Client-side pagination - paginate the sorted results
  const paginatedMps = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedMps.slice(startIndex, endIndex);
  }, [sortedMps, page, pageSize]);

  // Calculate summary from filtered results
  const summary = useMemo(() => {
    const totalMps = filteredMps.length;
    
    // Get unique parties and districts
    const partiesSet = new Set<string>();
    const districtsSet = new Set<string>();
    filteredMps.forEach((mp) => {
      if (mp.party) partiesSet.add(mp.party);
      if (mp.district) districtsSet.add(mp.district);
    });

    // Calculate party distribution
    const partyCounts = new Map<string, number>();
    filteredMps.forEach((mp) => {
      if (mp.party) {
        partyCounts.set(mp.party, (partyCounts.get(mp.party) || 0) + 1);
      }
    });

    const partyDistribution = Array.from(partyCounts.entries())
      .map(([party, count]) => ({
        party,
        count,
        percentage: totalMps > 0 ? Math.round((count / totalMps) * 100 * 10) / 10 : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      total_mps: totalMps,
      total_parties: partiesSet.size,
      total_districts: districtsSet.size,
      party_distribution: partyDistribution
    };
  }, [filteredMps]);

  useEffect(() => {
    fetchParliamentTerms().then(setParliamentTerms).catch(() => {});
    // Fetch dynamic hero image
    fetchPageHeroImage('mps').then((data) => {
      if (data?.image) {
        setHeroImage(data.image);
      }
    });
  }, []);

  useEffect(() => {
    loadAllMPs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParliamentTermId]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedSearchTerms, selectedParties, selectedDistricts]);

  const loadAllMPs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = selectedParliamentTermId != null ? { parliament_term: selectedParliamentTermId } : undefined;
      let allResults: MP[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const data = await fetchMPs(currentPage, 100, filters);
        allResults = [...allResults, ...data.results];
        hasMore = data.next !== null;
        currentPage++;
      }

      setAllMps(allResults);
    } catch (err) {
      setError('Failed to load Members of Parliament. Please try again later.');
      console.error('Error fetching MPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (newPage: number) => {
    const totalPages = Math.ceil(sortedMps.length / pageSize);
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSort = (field: 'name' | 'party' | 'district' | 'constituency') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };


  const toggleSelection = (value: string, list: string[], setter: (v: string[]) => void) => {
    if (!value) return;
    setter(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading Members of Parliament...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && allMps.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => loadAllMPs()}
              className="mt-4 bg-[#2d5016] text-white px-6 py-2 rounded-md hover:bg-[#1b3d26] transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">

      <main className="max-w-7xl mx-auto px-4 py-8">
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
            alt="Members of Parliament - browse and search for your representatives"
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
                <Users className="w-4 h-4 text-white" aria-hidden />
                <span className="text-sm font-medium text-white/90">Your representatives</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-3">
                Members of Parliament
              </h1>
              <p className="text-base text-white/90 leading-relaxed sm:text-lg">
                Browse and search for your representatives in Parliament. Filter by party or
                district, search by name or constituency, and view MP profiles and contact details.
              </p>
            </div>
          </div>
        </div>

        {/* Parliament / Term selector */}
        {parliamentTerms.length > 0 && (
          <div className="mb-6">
            <label htmlFor="parliament-term" className="block text-sm font-medium text-gray-700 mb-2">
              Parliament / Term
            </label>
            <select
              id="parliament-term"
              value={selectedParliamentTermId ?? ''}
              onChange={(e) => setSelectedParliamentTermId(e.target.value === '' ? null : Number(e.target.value))}
              className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-[#2d5016] focus:outline-none focus:ring-2 focus:ring-[#2d5016]/40"
            >
              <option value="">Current Parliament</option>
              {parliamentTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name} ({term.start_year}-{term.end_year}){term.is_current ? ' (current)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Summary Section */}
        {!loading && allMps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total MPs */}
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <Users className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">Total MPs</p>
                  <p className="text-2xl font-bold text-gray-900">{summary?.total_mps ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Total Parties */}
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
                  <p className="text-gray-600 text-sm mb-1">Total Parties</p>
                  <p className="text-2xl font-bold text-gray-900">{summary?.total_parties ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Total Districts */}
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <MapPin className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">Total Districts</p>
                  <p className="text-2xl font-bold text-gray-900">{summary?.total_districts ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-[#fafaf8] rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constituency
                </label>
                <DropdownMenu open={searchDropdownOpen} onOpenChange={setSearchDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-gray-600 bg-[#fafaf8] hover:bg-[#f5f0e8] border-gray-300">
                      {selectedSearchTerms.length > 0
                        ? `${selectedSearchTerms.length} selected`
                        : 'Select names/constituencies'}
                      <span className="text-gray-400 text-xs ml-2">▼</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuLabel>Search options</DropdownMenuLabel>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Type to filter..."
                        value={searchFilterTerm}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSearchFilterTerm(e.target.value);
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="h-9"
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-64 overflow-y-auto">
                      {searchOptions
                        .filter((opt) => opt.toLowerCase().includes(searchFilterTerm.toLowerCase()))
                        .map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option}
                            checked={selectedSearchTerms.includes(option)}
                            onCheckedChange={() =>
                              toggleSelection(option, selectedSearchTerms, setSelectedSearchTerms)
                            }
                          >
                            {option}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <DropdownMenu open={districtDropdownOpen} onOpenChange={setDistrictDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-gray-600 bg-[#fafaf8] hover:bg-[#f5f0e8] border-gray-300">
                      {selectedDistricts.length > 0 ? `${selectedDistricts.length} selected` : 'All Districts'}
                      <span className="text-gray-400 text-xs ml-2">▼</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuLabel>Districts</DropdownMenuLabel>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Type to filter..."
                        value={districtFilterTerm}
                        onChange={(e) => {
                          e.stopPropagation();
                          setDistrictFilterTerm(e.target.value);
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="h-9"
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-64 overflow-y-auto">
                      {districtOptions
                        .filter((d) => d.toLowerCase().includes(districtFilterTerm.toLowerCase()))
                        .map((district) => (
                          <DropdownMenuCheckboxItem
                            key={district}
                            checked={selectedDistricts.includes(district)}
                            onCheckedChange={() =>
                              toggleSelection(district, selectedDistricts, setSelectedDistricts)
                            }
                          >
                            {district}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Party
                </label>
                <DropdownMenu open={partyDropdownOpen} onOpenChange={setPartyDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-gray-600 bg-[#fafaf8] hover:bg-[#f5f0e8] border-gray-300">
                      {selectedParties.length > 0 ? `${selectedParties.length} selected` : 'All Parties'}
                      <span className="text-gray-400 text-xs ml-2">▼</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuLabel>Parties</DropdownMenuLabel>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Type to filter..."
                        value={partyFilterTerm}
                        onChange={(e) => {
                          e.stopPropagation();
                          setPartyFilterTerm(e.target.value);
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="h-9"
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-64 overflow-y-auto">
                      {partyOptions
                        .filter((p) => p.toLowerCase().includes(partyFilterTerm.toLowerCase()))
                        .map((party) => {
                          const isSelected = selectedParties.some(
                            (selected) => selected.toLowerCase() === party.toLowerCase()
                          );
                          return (
                            <DropdownMenuCheckboxItem
                              key={party}
                              checked={isSelected}
                              onCheckedChange={() => toggleSelection(party, selectedParties, setSelectedParties)}
                            >
                              {party}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {(selectedSearchTerms.length || selectedParties.length || selectedDistricts.length) ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSearchTerms([]);
                    setSelectedParties([]);
                    setSelectedDistricts([]);
                    setNameSearchTerm('');
                    setSearchFilterTerm('');
                    setPartyFilterTerm('');
                    setDistrictFilterTerm('');
                    // The useEffect will automatically reload data without showing loading state
                  }}
                  className="bg-[#fafaf8] text-gray-700 px-6 py-2 rounded-md hover:bg-[#f5f0e8] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* MPs Table and Party Distribution Chart */}
        {filteredMps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No MPs found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* MPs Table */}
            <div className="lg:col-span-2">
            {/* Name Search Field */}
            <div className="bg-[#fafaf8] rounded-lg shadow-sm p-4 mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={nameSearchTerm}
                  onChange={(e) => {
                    setNameSearchTerm(e.target.value);
                    setPage(1); // Reset to first page when searching
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2d5016] focus:border-[#2d5016] text-gray-900 placeholder:text-gray-400"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {nameSearchTerm && (
                  <button
                    onClick={() => {
                      setNameSearchTerm('');
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8]">
                    <tr>
                        <th 
                          className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors group"
                          onClick={() => handleSort('name')}
                          title="Click to sort"
                        >
                          <div className="flex items-center gap-2">
                            Name
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
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors group"
                          onClick={() => handleSort('party')}
                          title="Click to sort"
                        >
                          <div className="flex items-center gap-2">
                        Party
                            <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                              sortField === 'party' ? 'text-[#2d5016]' : ''
                            }`}>
                              {sortField === 'party' 
                                ? (sortDirection === 'asc' ? '↑' : '↓')
                                : '↕'
                              }
                            </span>
                          </div>
                      </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors group"
                          onClick={() => handleSort('constituency')}
                          title="Click to sort"
                        >
                          <div className="flex items-center gap-2">
                        Constituency
                            <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                              sortField === 'constituency' ? 'text-[#2d5016]' : ''
                            }`}>
                              {sortField === 'constituency' 
                                ? (sortDirection === 'asc' ? '↑' : '↓')
                                : '↕'
                              }
                            </span>
                          </div>
                      </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors group"
                          onClick={() => handleSort('district')}
                          title="Click to sort"
                        >
                          <div className="flex items-center gap-2">
                        District
                            <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                              sortField === 'district' ? 'text-[#2d5016]' : ''
                            }`}>
                              {sortField === 'district' 
                                ? (sortDirection === 'asc' ? '↑' : '↓')
                                : '↕'
                              }
                            </span>
                          </div>
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedMps.map((mp) => (
                      <tr key={mp.id} className="hover:bg-[#fafaf8] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-start">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#2d5016] to-[#1b3d26] flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-md">
                                {mp.photo ? (
                                  <img
                                    src={mp.photo}
                                    alt={mp.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>
                                    {mp.first_name?.[0] || ''}
                                    {mp.last_name?.[0] || ''}
                                  </span>
                                )}
                              </div>
                            </div>
                              <div className="ml-3 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 break-words">
                                {mp.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-br from-[#2d5016] to-[#1b3d26] text-white shadow-sm">
                            {mp.party}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{mp.constituency}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{mp.district}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/trackers/mps/${mp.id}`}
                            className="text-[#2d5016] hover:text-[#1b3d26] font-medium transition-colors"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                  Showing page {page} of {Math.ceil(filteredMps.length / pageSize)} ({filteredMps.length} total MPs)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-[#fafaf8] hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                    disabled={page >= Math.ceil(filteredMps.length / pageSize)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-[#fafaf8] hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
                </div>
              </div>
            </div>

            {/* Party Distribution Chart */}
            <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md p-6 border border-gray-200 self-start">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">Party Distribution</h3>
                <p className="text-sm text-gray-500">Share of MPs by political party</p>
              </div>

              {summary && summary.party_distribution.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.party_distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          dataKey="percentage"
                          nameKey="party"
                          paddingAngle={1}
                          label={({ value }) => `${value}%`}
                        >
                          {summary.party_distribution.map((entry) => (
                            <Cell key={entry.party} fill={getPartyColor(entry.party)} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, _name: string, payload: any) => {
                            const partyName = payload?.payload?.party || 'Party';
                            return [`${value}%`, partyName];
                          }}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {summary.party_distribution.map((item) => (
                      <div key={item.party} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getPartyColor(item.party) }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.party || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{item.count} MPs</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">
                  No party distribution data available.
                </p>
              )}
            </div>
          </div>
        )}

        {error && allMps.length > 0 && (
          <div className="mt-4 text-center text-red-600">
            <p>{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}