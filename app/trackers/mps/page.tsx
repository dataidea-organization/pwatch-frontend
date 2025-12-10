'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { fetchMPs, MP } from '@/lib/api';

export default function MPsPage() {
  const [mps, setMps] = useState<MP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  useEffect(() => {
    loadMPs();
  }, [searchQuery, selectedParty, selectedDistrict]);

  const loadMPs = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (selectedParty) filters.party = selectedParty;
      if (selectedDistrict) filters.district = selectedDistrict;

      const data = await fetchMPs(1, 20, filters);
      setMps(data.results);
      setHasMore(data.next !== null);
      setTotalCount(data.count);
      setPage(1);
      setError(null);
    } catch (err) {
      setError('Failed to load Members of Parliament. Please try again later.');
      console.error('Error fetching MPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = async (newPage: number) => {
    if (loadingMore) return;

    try {
      setLoadingMore(true);
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (selectedParty) filters.party = selectedParty;
      if (selectedDistrict) filters.district = selectedDistrict;

      const data = await fetchMPs(newPage, 20, filters);
      setMps(data.results);
      setHasMore(data.next !== null);
      setPage(newPage);
    } catch (err) {
      setError('Failed to load MPs.');
      console.error('Error fetching MPs:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMPs();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="support" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading Members of Parliament...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && mps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="support" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadMPs}
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
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Members of Parliament
          </h1>
          <p className="text-gray-600">
            Browse and search for your representatives in Parliament
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} {totalCount === 1 ? 'MP' : 'MPs'} found
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Name or Constituency
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search MPs..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#085e29] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Party
                </label>
                <select
                  value={selectedParty}
                  onChange={(e) => setSelectedParty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#085e29] focus:border-transparent"
                >
                  <option value="">All Parties</option>
                  <option value="nrm">NRM</option>
                  <option value="nup">NUP</option>
                  <option value="fdc">FDC</option>
                  <option value="dp">DP</option>
                  <option value="independent">Independent</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by District
                </label>
                <input
                  type="text"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  placeholder="Enter district..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#085e29] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#085e29] text-white px-6 py-2 rounded-md hover:bg-[#064920] transition-colors"
              >
                Search
              </button>
              {(searchQuery || selectedParty || selectedDistrict) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedParty('');
                    setSelectedDistrict('');
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </form>
        </div>

        {/* MPs Table */}
        {mps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No MPs found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Party
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Constituency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        District
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mps.map((mp) => (
                      <tr key={mp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
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
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {mp.phone_no && (
                              <div className="">{mp.phone_no}</div>
                            )}
                          </div>
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
                Showing page {page} of {Math.ceil(totalCount / 20)} ({totalCount} total MPs)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1 || loadingMore}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={!hasMore || loadingMore}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? 'Loading...' : 'Next'}
                </button>
              </div>
            </div>
          </>
        )}

        {error && mps.length > 0 && (
          <div className="mt-4 text-center text-red-600">
            <p>{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}