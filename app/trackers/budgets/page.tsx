'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, FileText } from 'lucide-react'

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

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 15

  useEffect(() => {
    fetchBudgets()
  }, [page, searchQuery])

  const fetchBudgets = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`http://localhost:8000/api/trackers/budgets/?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch budgets')
      }

      const data: PaginatedResponse = await response.json()
      setBudgets(data.results)
      setTotalCount(data.count)
      setTotalPages(Math.ceil(data.count / pageSize))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const formatCurrency = (amount: string | null): string => {
    if (!amount) return 'N/A'
    const num = parseFloat(amount)
    if (num >= 1e12) {
      return `UGX ${(num / 1e12).toFixed(2)} Trillion`
    }
    return `UGX ${num.toLocaleString()}`
  }

  if (loading && page === 1) {
    return (
      <>
        <Header variant="support" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#085e29]"></div>
            <p className="text-gray-600">Loading budgets...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header variant="support" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2">Error Loading Budgets</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={fetchBudgets}
              className="bg-[#085e29] text-white px-4 py-2 rounded-md hover:bg-[#064920] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header variant="support" />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/trackers"
            className="inline-flex items-center gap-2 text-[#085e29] hover:text-[#064920] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Trackers
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-2">National budget documents and financial plans</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search through ${totalCount} budget records...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#085e29] focus:border-transparent"
              />
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      Document Name
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Financial Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {budgets.length === 0 ? (
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
                  budgets.map((budget) => (
                    <tr key={budget.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-[#085e29] bg-opacity-10 rounded-full flex items-center justify-center">
                            <FileText className="text-[#085e29]" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{budget.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {budget.financial_year}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="font-semibold text-[#085e29]">
                          {formatCurrency(budget.budget_total_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`http://localhost:8000${budget.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#085e29] text-white px-4 py-2 rounded-md hover:bg-[#064920] transition-colors text-sm"
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

          {budgets.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} budgets
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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About Budget Documents</h2>
          <p className="text-gray-600">
            Access official national budget documents and supplementary budgets. These documents provide detailed
            information on government revenue, expenditure, and financial planning for each fiscal year.
          </p>
        </div>
      </main>
    </>
  )
}