'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface OrderPaper {
  id: number
  name: string
  description: string | null
  file: string | null
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: OrderPaper[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function OrderPaperPage() {
  // Store all order papers loaded from the server
  const [allOrderPapers, setAllOrderPapers] = useState<OrderPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<'name' | 'created_at' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const pageSize = 15

  useEffect(() => {
    loadAllOrderPapers()
  }, [])

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const loadAllOrderPapers = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all order papers by requesting a large page size
      // The backend max_page_size is 100, so we'll fetch in chunks if needed
      let allResults: OrderPaper[] = []
      let currentPage = 1
      let hasMore = true

      while (hasMore) {
      const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: '100', // Use max page size
      })

        const response = await fetch(`${API_BASE_URL}/trackers/order-papers/?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch order papers')
      }

      const data: PaginatedResponse = await response.json()
        allResults = [...allResults, ...data.results]
        hasMore = data.next !== null
        currentPage++
      }

      setAllOrderPapers(allResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Client-side filtering - filter allOrderPapers based on search query
  const filteredOrderPapers = useMemo(() => {
    if (!searchQuery.trim()) return allOrderPapers

    const query = searchQuery.toLowerCase()
    return allOrderPapers.filter((orderPaper) => {
      return (
        orderPaper.name.toLowerCase().includes(query) ||
        (orderPaper.description && orderPaper.description.toLowerCase().includes(query))
      )
    })
  }, [allOrderPapers, searchQuery])

  // Client-side sorting - sort the filtered order papers array
  const sortedOrderPapers = useMemo(() => {
    if (!sortField) return filteredOrderPapers

    const sorted = [...filteredOrderPapers].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredOrderPapers, sortField, sortDirection])

  // Client-side pagination - paginate the sorted results
  const paginatedOrderPapers = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedOrderPapers.slice(startIndex, endIndex)
  }, [sortedOrderPapers, page, pageSize])

  const totalPages = Math.ceil(sortedOrderPapers.length / pageSize)
  const totalCount = sortedOrderPapers.length

  const handleSort = (field: 'name' | 'created_at') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to ascending
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading && allOrderPapers.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#085e29]"></div>
            <p className="text-gray-600">Loading order papers...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2">Error Loading Order Papers</h2>
            <p className="mb-4">{error}</p>
            <Button
              onClick={loadAllOrderPapers}
              variant="green"
            >
              Try Again
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/trackers"
            className="inline-flex items-center gap-2 text-[#085e29] hover:text-[#064920] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Trackers
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Order Papers</h1>
          <p className="text-gray-600 mt-2">Parliamentary order papers outlining daily business and proceedings</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search through ${totalCount} order papers...`}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400"
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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
                    onClick={() => handleSort('name')}
                    title="Click to sort"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      Document Name
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
                    onClick={() => handleSort('created_at')}
                    title="Click to sort"
                  >
                    <div className="flex items-center gap-2">
                    Date Added
                      <span className={`text-gray-400 group-hover:text-[#085e29] transition-colors text-xs ${
                        sortField === 'created_at' ? 'text-[#085e29]' : ''
                      }`}>
                        {sortField === 'created_at' 
                          ? (sortDirection === 'asc' ? '↑' : '↓')
                          : '↕'
                        }
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedOrderPapers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <FileText size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">No order papers found</p>
                        {searchQuery && (
                          <p className="text-sm">Try adjusting your search query</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrderPapers.map((orderPaper) => (
                    <tr key={orderPaper.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{orderPaper.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="max-w-md">
                          {orderPaper.description || 'No description available'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(orderPaper.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {orderPaper.file ? (
                          <a
                            href={`${API_BASE_URL.replace('/api', '')}${orderPaper.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#085e29] text-white px-4 py-2 rounded-md hover:bg-[#064920] transition-colors text-sm"
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

          {sortedOrderPapers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} order papers
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  <ChevronsLeft size={20} />
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  <ChevronsRight size={20} />
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Per Page: {pageSize}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About Order Papers</h2>
          <p className="text-gray-600">
            Order Papers outline the business to be conducted during parliamentary sessions. They include questions,
            motions, bills, and other items scheduled for debate and consideration by Members of Parliament.
          </p>
        </div>
      </main>
    </div>
  )
}