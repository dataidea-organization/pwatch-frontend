'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, FileText, FolderOpen, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchPageHeroImage } from '@/lib/api'

interface Budget {
  id: number
  name: string
  financial_year: string
  file: string
  budget_total_amount: string | null
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Budget[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function BudgetsPage() {
  // Store all budgets loaded from the server
  const [allBudgets, setAllBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<'name' | 'financial_year' | 'budget_total_amount' | 'created_at' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const pageSize = 15
  const [heroImage, setHeroImage] = useState<string>('/images/budget.jpg')

  useEffect(() => {
    loadAllBudgets()
    // Fetch dynamic hero image
    fetchPageHeroImage('budgets').then((data) => {
      if (data?.image) {
        setHeroImage(data.image)
      }
    })
  }, [])

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const loadAllBudgets = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all budgets by requesting a large page size
      // The backend max_page_size is 100, so we'll fetch in chunks if needed
      let allResults: Budget[] = []
      let currentPage = 1
      let hasMore = true

      while (hasMore) {
      const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: '100', // Use max page size
      })

        const response = await fetch(`${API_BASE_URL}/trackers/budgets/?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch budgets')
      }

      const data: PaginatedResponse = await response.json()
        allResults = [...allResults, ...data.results]
        hasMore = data.next !== null
        currentPage++
      }

      setAllBudgets(allResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Client-side filtering - filter allBudgets based on search query
  const filteredBudgets = useMemo(() => {
    if (!searchQuery.trim()) return allBudgets

    const query = searchQuery.toLowerCase()
    return allBudgets.filter((budget) => {
      return (
        budget.name.toLowerCase().includes(query) ||
        budget.financial_year.toLowerCase().includes(query)
      )
    })
  }, [allBudgets, searchQuery])

  // Client-side sorting - sort the filtered budgets array
  const sortedBudgets = useMemo(() => {
    if (!sortField) return filteredBudgets

    const sorted = [...filteredBudgets].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'financial_year':
          aValue = a.financial_year.toLowerCase()
          bValue = b.financial_year.toLowerCase()
          break
        case 'budget_total_amount':
          aValue = a.budget_total_amount ? parseFloat(a.budget_total_amount) : 0
          bValue = b.budget_total_amount ? parseFloat(b.budget_total_amount) : 0
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
  }, [filteredBudgets, sortField, sortDirection])

  // Client-side pagination - paginate the sorted results
  const paginatedBudgets = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedBudgets.slice(startIndex, endIndex)
  }, [sortedBudgets, page, pageSize])

  const handleSort = (field: 'name' | 'financial_year' | 'budget_total_amount' | 'created_at') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to ascending
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const totalPages = Math.ceil(sortedBudgets.length / pageSize)
  const totalCount = sortedBudgets.length

  const formatCurrency = (amount: string | null): string => {
    if (!amount) return 'N/A'
    const num = parseFloat(amount)
    if (num >= 1e12) {
      return `UGX ${(num / 1e12).toFixed(2)} Trillion`
    }
    return `UGX ${num.toLocaleString()}`
  }

  if (loading && allBudgets.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016]"></div>
            <p className="text-gray-600">Loading budgets...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2">Error Loading Budgets</h2>
            <p className="mb-4">{error}</p>
            <Button
              onClick={loadAllBudgets}
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
        </div>

        {/* Hero Section - full-cover image with text on dark overlay at bottom (height matches home page hero) */}
        <div className="relative mb-10 h-[400px] overflow-hidden rounded-2xl shadow-xl">
          <Image
            src={heroImage}
            alt="Budgets - national budget documents and financial plans"
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
                <FolderOpen className="w-4 h-4 text-white" aria-hidden />
                <span className="text-sm font-medium text-white/90">National budget</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-3">
                Budgets
              </h1>
              <p className="text-base text-white/90 leading-relaxed sm:text-lg">
                Browse national budget documents and financial plans by financial year. Search and
                download budget documents to stay informed about government spending and fiscal plans.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {!loading && allBudgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Budgets */}
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <FolderOpen className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">Total Budgets</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredBudgets.length}</p>
                </div>
              </div>
            </div>

            {/* Unique Years */}
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
                  <p className="text-gray-600 text-sm mb-1">Financial Years</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(filteredBudgets.map(b => b.financial_year)).size}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Amount */}
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
                  <p className="text-gray-600 text-sm mb-1">Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredBudgets.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search through ${totalCount} budget records...`}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400"
                  style={{ color: '#111827' }}
                />
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="bg-white text-gray-700 hover:bg-[#f5f0e8] border-gray-300"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8]">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors group"
                    onClick={() => handleSort('name')}
                    title="Click to sort"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      Document Name
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
                    onClick={() => handleSort('financial_year')}
                    title="Click to sort"
                  >
                    <div className="flex items-center gap-2">
                    Financial Year
                      <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                        sortField === 'financial_year' ? 'text-[#2d5016]' : ''
                      }`}>
                        {sortField === 'financial_year' 
                          ? (sortDirection === 'asc' ? '↑' : '↓')
                          : '↕'
                        }
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors group"
                    onClick={() => handleSort('budget_total_amount')}
                    title="Click to sort"
                  >
                    <div className="flex items-center gap-2">
                    Total Amount
                      <span className={`text-gray-400 group-hover:text-[#2d5016] transition-colors text-xs ${
                        sortField === 'budget_total_amount' ? 'text-[#2d5016]' : ''
                      }`}>
                        {sortField === 'budget_total_amount' 
                          ? (sortDirection === 'asc' ? '↑' : '↓')
                          : '↕'
                        }
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBudgets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <FileText size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">No budgets found</p>
                        {searchQuery && (
                          <p className="text-sm">Try adjusting your search query</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedBudgets.map((budget) => (
                    <tr key={budget.id} className="hover:bg-[#fafaf8] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{budget.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 font-medium">{budget.financial_year}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[#2d5016]">
                          {formatCurrency(budget.budget_total_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={budget.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#2d5016] text-white px-4 py-2 rounded-lg hover:bg-[#1b3d26] transition-colors text-sm shadow-sm hover:shadow-md"
                        >
                          <Download size={16} />
                          Download
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {sortedBudgets.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} budgets
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  <ChevronsLeft size={20} />
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  <ChevronsRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About Budget Documents</h2>
          <p className="text-gray-600 text-sm">
            Access official national budget documents and supplementary budgets. These documents provide detailed
            information on government revenue, expenditure, and financial planning for each fiscal year.
          </p>
        </div>
      </main>
    </div>
  )
}