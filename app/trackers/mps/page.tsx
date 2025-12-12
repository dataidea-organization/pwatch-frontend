'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchMPs, fetchMPSummary, MP, MPSummary } from '@/lib/api';
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

const PARTY_COLORS = ['#085e29', '#f97316', '#2563eb', '#9333ea', '#ef4444', '#14b8a6', '#f59e0b'];

export default function MPsPage() {
  // Store all MPs loaded from the server
  const [allMps, setAllMps] = useState<MP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedSearchTerms, setSelectedSearchTerms] = useState<string[]>([]);
  const [partyFilterTerm, setPartyFilterTerm] = useState('');
  const [districtFilterTerm, setDistrictFilterTerm] = useState('');
  const [searchFilterTerm, setSearchFilterTerm] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [partyDropdownOpen, setPartyDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'party' | 'district' | 'constituency' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
  }, [allMps, selectedSearchTerms, selectedParties, selectedDistricts]);

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
    // Load all MPs on mount (fetch all pages)
    loadAllMPs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedSearchTerms, selectedParties, selectedDistricts]);

  const loadAllMPs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all MPs by requesting a large page size
      // The backend max_page_size is 100, so we'll fetch in chunks if needed
      let allResults: MP[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const data = await fetchMPs(currentPage, 100); // Use max page size
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filters are now applied client-side, so no API call needed
    setPage(1);
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
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => loadAllMPs()}
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
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Members of Parliament
          </h1>
          <p className="text-gray-600">
            Browse and search for your representatives in Parliament
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">
              {filteredMps.length} {filteredMps.length === 1 ? 'MP' : 'MPs'} found
            </p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <p className="text-sm text-gray-500">Total MPs</p>
            {loading ? (
              <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.total_mps ?? 0}</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <p className="text-sm text-gray-500">Total Parties</p>
            {loading ? (
              <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.total_parties ?? 0}</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <p className="text-sm text-gray-500">Total Districts</p>
            {loading ? (
              <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.total_districts ?? 0}</p>
            )}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constituency
                </label>
                <DropdownMenu open={searchDropdownOpen} onOpenChange={setSearchDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-gray-600 bg-white hover:bg-gray-50 border-gray-300">
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
                    <Button variant="outline" className="w-full justify-between text-gray-600 bg-white hover:bg-gray-50 border-gray-300">
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
                    <Button variant="outline" className="w-full justify-between text-gray-600 bg-white hover:bg-gray-50 border-gray-300">
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

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#085e29] text-white px-6 py-2 rounded-md hover:bg-[#064920] transition-colors"
              >
                Search
              </button>
              {(selectedSearchTerms.length || selectedParties.length || selectedDistricts.length) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSearchTerms([]);
                    setSelectedParties([]);
                    setSelectedDistricts([]);
                    setSearchFilterTerm('');
                    setPartyFilterTerm('');
                    setDistrictFilterTerm('');
                    // The useEffect will automatically reload data without showing loading state
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          </form>
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
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                        <th 
                          className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                          onClick={() => handleSort('name')}
                          title="Click to sort"
                        >
                          <div className="flex items-center gap-2">
                            Name
                            <span className={`text-gray-400 group-hover:text-[#085e29] transition-colors text-xs ${
                              sortField === 'name' ? 'text-[#085e29]' : ''
                            }`}>
                              {sortField === 'name' 
                                ? (sortDirection === 'asc' ? '↑' : '↓')
                                : '↕'
                              }
                            </span>
                          </div>
                      </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                          onClick={() => handleSort('party')}
                          title="Click to sort"
                        >
                          <div className="flex items-center gap-2">
                        Party
                            <span className={`text-gray-400 group-hover:text-[#085e29] transition-colors text-xs ${
                              sortField === 'party' ? 'text-[#085e29]' : ''
                            }`}>
                              {sortField === 'party' 
                                ? (sortDirection === 'asc' ? '↑' : '↓')
                                : '↕'
                              }
                            </span>
                          </div>
                      </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                          onClick={() => handleSort('constituency')}
                          title="Click to sort"
                        >
                          <div className="flex items-center gap-2">
                        Constituency
                            <span className={`text-gray-400 group-hover:text-[#085e29] transition-colors text-xs ${
                              sortField === 'constituency' ? 'text-[#085e29]' : ''
                            }`}>
                              {sortField === 'constituency' 
                                ? (sortDirection === 'asc' ? '↑' : '↓')
                                : '↕'
                              }
                            </span>
                          </div>
                      </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                          onClick={() => handleSort('district')}
                          title="Click to sort"
                        >
                          <div className="flex items-center gap-2">
                        District
                            <span className={`text-gray-400 group-hover:text-[#085e29] transition-colors text-xs ${
                              sortField === 'district' ? 'text-[#085e29]' : ''
                            }`}>
                              {sortField === 'district' 
                                ? (sortDirection === 'asc' ? '↑' : '↓')
                                : '↕'
                              }
                            </span>
                          </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedMps.map((mp) => (
                      <tr key={mp.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#085e29] to-[#064920] flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                {mp.photo ? (
                                  <img
                                    src={mp.photo}
                                    alt={mp.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>
                                    {mp.first_name[0]}
                                    {mp.last_name[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                              <div className="ml-3 min-w-0">
                                <div className="text-sm font-medium text-gray-900 break-words">
                                {mp.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#085e29] text-white">
                            {mp.party}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{mp.constituency}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{mp.district}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/trackers/mps/${mp.id}`}
                            className="text-[#085e29] hover:text-[#064920] font-medium"
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
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                    disabled={page >= Math.ceil(filteredMps.length / pageSize)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
                </div>
              </div>
            </div>

            {/* Party Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 self-start">
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
                          {summary.party_distribution.map((entry, index) => (
                            <Cell key={entry.party} fill={PARTY_COLORS[index % PARTY_COLORS.length]} />
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
                    {summary.party_distribution.map((item, index) => (
                      <div key={item.party} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PARTY_COLORS[index % PARTY_COLORS.length] }}
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