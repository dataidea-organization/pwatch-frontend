'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, FileText, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Report {
  id: number
  name: string
  description: string | null
  file: string | null
  date_received: string | null
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Report[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function ReportsBriefsPage() {
  const [allReports, setAllReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllReports()
  }, [])

  const loadAllReports = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let allResults: Report[] = []
      let currentPage = 1
      let hasMore = true

      while (hasMore) {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: '100',
        })

        const response = await fetch(`${API_BASE_URL}/resources/reports/?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch reports')
        }
        
        const data: PaginatedResponse = await response.json()
        allResults = [...allResults, ...data.results]
        hasMore = data.next !== null
        currentPage++
      }

      setAllReports(allResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  // Extract unique years from reports
  const years = useMemo(() => {
    const yearSet = new Set<number>()
    
    allReports.forEach((report) => {
      if (report.date_received) {
        const year = new Date(report.date_received).getFullYear()
        if (!isNaN(year)) {
          yearSet.add(year)
        }
      }
    })

    return Array.from(yearSet).sort((a, b) => b - a)
  }, [allReports])

  // Count reports per year
  const getReportCountForYear = (year: number) => {
    return allReports.filter((report) => {
      if (!report.date_received) return false
      return new Date(report.date_received).getFullYear() === year
    }).length
  }

  // Count reports without dates
  const undatedCount = useMemo(() => {
    return allReports.filter((report) => !report.date_received).length
  }, [allReports])

  // Statistics calculations
  const stats = useMemo(() => {
    const totalReports = allReports.length
    const totalYears = years.length
    
    // Helper function to count reports per year
    const countForYear = (year: number) => {
      return allReports.filter((report) => {
        if (!report.date_received) return false
        return new Date(report.date_received).getFullYear() === year
      }).length
    }
    
    // Find most active year
    let mostActiveYear = null
    let maxCount = 0
    years.forEach((year) => {
      const count = countForYear(year)
      if (count > maxCount) {
        maxCount = count
        mostActiveYear = year
      }
    })

    // Count recent additions (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentCount = allReports.filter((report) => {
      if (!report.created_at) return false
      return new Date(report.created_at) >= thirtyDaysAgo
    }).length

    return {
      totalReports,
      totalYears,
      mostActiveYear,
      maxCount,
      recentCount,
    }
  }, [allReports, years])

  if (loading && allReports.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error && allReports.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button
              onClick={() => loadAllReports()}
              className="mt-4"
              variant="green"
            >
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/resources" className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] mb-4 transition-colors">
            <ArrowLeft className="mr-2" size={20} />
            Back to Resources
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Reports & Briefs</h1>
        </div>

        {/* Statistics Cards */}
        {!loading && allReports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Reports */}
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
                  <p className="text-gray-600 text-sm mb-1">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReports.toLocaleString()}</p>
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
                      {stats.maxCount} {stats.maxCount === 1 ? 'report' : 'reports'}
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
                  <p className="text-xs text-gray-500 mt-1">New reports</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-600 text-lg">Select a year to view research reports, policy briefs, and analysis documents</p>
        </div>

        {/* Year Cards Grid */}
        {(years.length > 0 || undatedCount > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {years.map((year) => {
              const count = getReportCountForYear(year)
              return (
                <Link
                  key={year}
                  href={`/resources/reports-briefs/${year}`}
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
                        {count} {count === 1 ? 'report' : 'reports'}
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
              )
            })}
            
            {/* Undated Card */}
            {undatedCount > 0 && (
              <Link
                href="/resources/reports-briefs/undated"
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
                      {undatedCount} {undatedCount === 1 ? 'report' : 'reports'}
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
            <p className="text-gray-500 text-lg">No reports available</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for new reports</p>
          </div>
        )}

        <div className="mt-8 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About Reports & Briefs</h3>
          <p className="text-sm text-gray-600">
            In-depth research reports, policy briefs, and analytical documents covering parliamentary activities and governance issues.
          </p>
        </div>
      </main>
    </div>
  )
}