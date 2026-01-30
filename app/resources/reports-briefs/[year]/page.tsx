'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ReportsBriefsYearPage() {
  const params = useParams()
  const year = params?.year as string
  const yearNumber = parseInt(year, 10)

  const [allReports, setAllReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 15

  useEffect(() => {
    if (year && !isNaN(yearNumber)) {
      loadAllReports()
    }
  }, [year])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedMonth])

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

  // Filter reports by year
  const reportsForYear = useMemo(() => {
    return allReports.filter((report) => {
      if (!report.date_received) return false
      return new Date(report.date_received).getFullYear() === yearNumber
    })
  }, [allReports, yearNumber])

  // Months that have at least one report in this year
  const monthsWithData = useMemo(() => {
    const months = new Set<number>()
    reportsForYear.forEach((report) => {
      if (report.date_received) {
        months.add(new Date(report.date_received).getMonth() + 1) // 1-12
      }
    })
    return Array.from(months).sort((a, b) => a - b)
  }, [reportsForYear])

  // Filter by selected month
  const reportsForYearAndMonth = useMemo(() => {
    if (selectedMonth === null) return reportsForYear
    return reportsForYear.filter((report) => {
      if (!report.date_received) return false
      return new Date(report.date_received).getMonth() + 1 === selectedMonth
    })
  }, [reportsForYear, selectedMonth])

  // Client-side filtering
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reportsForYearAndMonth

    const query = searchQuery.toLowerCase()
    return reportsForYearAndMonth.filter((report) => {
      return (
        report.name.toLowerCase().includes(query) ||
        (report.description && report.description.toLowerCase().includes(query))
      )
    })
  }, [reportsForYearAndMonth, searchQuery])

  // Client-side pagination
  const paginatedReports = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredReports.slice(startIndex, endIndex)
  }, [filteredReports, page, pageSize])

  const totalPages = Math.ceil(filteredReports.length / pageSize)
  const totalCount = filteredReports.length

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (!year || isNaN(yearNumber)) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Invalid year parameter</p>
            <Link href="/resources/reports-briefs" className="text-[#2d5016] hover:underline mt-2 inline-block">
              Back to Reports & Briefs
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (loading && allReports.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
            <p className="mt-4 text-gray-600">Loading reports for {year}...</p>
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
          <Link href="/resources/reports-briefs" className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] mb-4 transition-colors">
            <ArrowLeft className="mr-2" size={20} />
            Back to Reports & Briefs
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Reports & Briefs - {year}</h1>
          <p className="text-gray-600 text-lg">Research reports, policy briefs, and analysis documents for {year}</p>
        </div>

        <div className="bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm">
          {/* Month filter */}
          {monthsWithData.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Filter by month</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMonth(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMonth === null
                      ? 'bg-[#2d5016] text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-[#f5f0e8]'
                  }`}
                >
                  All
                </button>
                {monthsWithData.map((monthNum) => (
                  <button
                    key={monthNum}
                    type="button"
                    onClick={() => setSelectedMonth(monthNum)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedMonth === monthNum
                        ? 'bg-[#2d5016] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-[#f5f0e8]'
                    }`}
                  >
                    {MONTH_NAMES[monthNum - 1]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search through ${totalCount} reports...`}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-gray-400"
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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fafaf8]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      Document Name
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date Received
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedReports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <FileText size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">No reports found for {year}</p>
                        {searchQuery && (
                          <p className="text-sm">Try adjusting your search query</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-[#fafaf8] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{report.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="max-w-md">
                          {report.description || 'No description available'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {report.date_received ? formatDate(report.date_received) : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {report.file ? (
                          <a
                            href={report.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#2d5016] text-white px-4 py-2 rounded-md hover:bg-[#1b3d26] transition-colors text-sm"
                          >
                            <Download size={16} />
                            Download
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">No file</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredReports.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} reports
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 rounded-md text-gray-600 hover:bg-[#fafaf8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="First page"
                >
                  <ChevronsLeft size={20} />
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-md text-gray-600 hover:bg-[#fafaf8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600 px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-md text-gray-600 hover:bg-[#fafaf8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="p-2 rounded-md text-gray-600 hover:bg-[#fafaf8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Last page"
                >
                  <ChevronsRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">About Reports & Briefs</h3>
          <p className="text-gray-600">
            In-depth research reports, policy briefs, and analytical documents covering parliamentary activities and governance issues.
          </p>
        </div>
      </main>
    </div>
  )
}
