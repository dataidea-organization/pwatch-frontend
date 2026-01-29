'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ArrowLeft, X, Users, MapPin, Building2 } from 'lucide-react'
import { fetchMPs, MP } from '@/lib/api'
import { Button } from '@/components/ui/button'

// Dynamically import the map component to avoid SSR issues with Leaflet
const UgandaMap = dynamic(() => import('@/components/UgandaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2d5016]"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
})

// Party colors for badges
const PARTY_COLORS: Record<string, string> = {
  'NRM': '#FCD34D',
  'NUP': '#EF4444',
  'FDC': '#7DD3FC',
  'DP': '#22C55E',
  'UPC': '#000000',
  'ANT': '#A855F7',
  'JEEMA': '#3B82F6',
  'UFA': '#93C5FD',
  'PPP': '#FCA5A5',
  'EPU': '#6EE7B7',
  'PPF': '#B91C1C',
  'INDP.': '#9CA3AF',
  'INDEP.': '#9CA3AF',
  'INDEPENDENT': '#9CA3AF',
}

const getPartyColor = (party: string): string => {
  if (!party) return '#6B7280'
  const normalizedParty = party.toUpperCase().trim()
  return PARTY_COLORS[normalizedParty] || '#6B7280'
}

export default function ParliamentPerformancePage() {
  const [allMps, setAllMps] = useState<MP[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)

  // Fetch all MPs
  useEffect(() => {
    const loadMPs = async () => {
      try {
        setLoading(true)
        // Fetch all MPs (with a large page size to get all)
        const response = await fetchMPs(1, 1000)
        setAllMps(response.results)
      } catch (error) {
        console.error('Error fetching MPs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMPs()
  }, [])

  // Calculate MP counts per district
  const districtMPCounts = useMemo(() => {
    const counts: { [district: string]: number } = {}
    allMps.forEach(mp => {
      if (mp.district) {
        const district = mp.district.toUpperCase()
        counts[district] = (counts[district] || 0) + 1
      }
    })
    return counts
  }, [allMps])

  // Get MPs for selected district
  const districtMPs = useMemo(() => {
    if (!selectedDistrict) return []
    return allMps.filter(mp => 
      mp.district?.toUpperCase() === selectedDistrict.toUpperCase()
    )
  }, [allMps, selectedDistrict])

  // Handle district click
  const handleDistrictClick = useCallback((district: string) => {
    setSelectedDistrict(district)
  }, [])

  // Clear selected district
  const clearSelectedDistrict = () => {
    setSelectedDistrict(null)
  }

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const districts = new Set(allMps.map(mp => mp.district).filter(Boolean))
    const parties = new Set(allMps.map(mp => mp.party).filter(Boolean))
    return {
      totalMPs: allMps.length,
      totalDistricts: districts.size,
      totalParties: parties.size,
    }
  }, [allMps])

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/trackers"
            className="inline-flex items-center gap-2 text-[#2d5016] hover:text-[#1b3d26] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Trackers
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Parliament Performance Tracker</h1>
          <p className="text-gray-600 mt-2">Explore Members of Parliament by district. Click on any district to see its representatives.</p>
        </div>

        {/* Summary Stats */}
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
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalMPs}</p>
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
                  <p className="text-gray-600 text-sm mb-1">Districts</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalDistricts}</p>
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
                  <p className="text-gray-600 text-sm mb-1">Political Parties</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalParties}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map and MPs Panel */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Uganda District Map</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Click on a district to view its Members of Parliament. Districts are colored by region.
                  </p>
                  
                  {/* Region Legend */}
                  <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6B8E5A' }}></div>
                    <span className="text-gray-900 font-medium">Central</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5B8FA8' }}></div>
                    <span className="text-gray-900 font-medium">Eastern</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#C99A6B' }}></div>
                    <span className="text-gray-900 font-medium">Northern</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B6F9E' }}></div>
                    <span className="text-gray-900 font-medium">Western</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#B87A7A' }}></div>
                    <span className="text-gray-900 font-medium">West Nile</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B7D6B' }}></div>
                    <span className="text-gray-900 font-medium">Karamoja</span>
                  </div>
                  </div>

                  {loading ? (
                    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2d5016]"></div>
                        <p className="text-gray-600">Loading MPs data...</p>
                      </div>
                    </div>
                  ) : (
                    <UgandaMap
                      onDistrictClick={handleDistrictClick}
                      districtMPCounts={districtMPCounts}
                      selectedDistrict={selectedDistrict}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* MPs Panel - Always visible */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 h-full overflow-hidden">
                <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedDistrict ? `${selectedDistrict} District` : 'District MPs'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedDistrict 
                        ? `${districtMPs.length} Member${districtMPs.length !== 1 ? 's' : ''} of Parliament`
                        : 'Select a district on the map'
                      }
                    </p>
                  </div>
                  {selectedDistrict && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelectedDistrict}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </Button>
                  )}
                </div>
                
                <div className="p-4 max-h-[500px] overflow-y-auto">
                  {!selectedDistrict ? (
                    <div className="text-center py-12 text-gray-500">
                      <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">Select a District</p>
                      <p className="text-sm">Click on any district on the map to view its Members of Parliament.</p>
                    </div>
                  ) : districtMPs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No MPs found for this district.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {districtMPs.map(mp => (
                        <Link
                          key={mp.id}
                          href={`/trackers/mps/${mp.id}`}
                          className="block bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-lg p-4 hover:bg-white hover:shadow-md transition-all border border-gray-200"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2d5016] to-[#1b3d26] overflow-hidden flex-shrink-0 shadow-md">
                              {mp.photo ? (
                                <Image
                                  src={mp.photo}
                                  alt={mp.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white">
                                  <Users size={24} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{mp.name}</h4>
                              <p className="text-sm text-gray-600 truncate">{mp.constituency || 'N/A'}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                                  style={{ backgroundColor: getPartyColor(mp.party) }}
                                >
                                  {mp.party || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {selectedDistrict && districtMPs.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <Link
                      href={`/trackers/mps?district=${encodeURIComponent(selectedDistrict || '')}`}
                      className="block w-full text-center py-2 px-4 bg-[#2d5016] text-white rounded-lg hover:bg-[#1b3d26] transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      View All in MPs Tracker
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Use</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
            <li>Hover over a district to see its name, region, and number of MPs</li>
            <li>Click on a district to view all MPs representing that area</li>
            <li>Click on an MP card to view their full profile</li>
            <li>Use the "View All in MPs Tracker" button to see all MPs from that district with filtering options</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
