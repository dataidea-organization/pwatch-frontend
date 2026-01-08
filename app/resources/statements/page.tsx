'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Statement {
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
  results: Statement[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function StatementsPage() {
  const [statements, setStatements] = useState<Statement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 15

  useEffect(() => {
    fetchStatements()
  }, [page, searchQuery])

  const fetchStatements = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const response = await fetch(`${API_BASE_URL}/resources/statements/?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch statements')
      }

      const data: PaginatedResponse = await response.json()
      setStatements(data.results)
      setTotalCount(data.count)
      setTotalPages(Math.ceil(data.count / pageSize))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching statements:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchStatements()
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading && statements.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-[#f3eed4] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016]"></div>
            <p className="text-gray-600">Loading statements...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-[#f3eed4] flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2">Error Loading Statements</h2>
            <p className="mb-4">{error}</p>
            <Button
              onClick={fetchStatements}
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
    <div className="min-h-screen bg-[#f3eed4]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/resources" className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] mb-4 transition-colors">
            <ArrowLeft className="mr-2" size={20} />
            Back to Resources
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Statements</h1>
          <p className="text-gray-600 mt-2">Official statements and position papers from CEPA</p>
        </div>

        <div className="bg-[#f3eed4] rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search through ${totalCount} statements...`}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400"
                  style={{ color: '#111827' }}
                />
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="bg-[#d2c4b0] text-gray-700 hover:bg-[#c4b5a0] border-gray-300"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#ddd0b8]">
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
                    Date Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {statements.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <FileText size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">No statements found</p>
                        {searchQuery && (
                          <p className="text-sm">Try adjusting your search query</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  statements.map((statement) => (
                    <tr key={statement.id} className="hover:bg-[#f3eed4] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{statement.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="max-w-md">
                          {statement.description || 'No description available'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(statement.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {statement.file ? (
                          <a
                            href={statement.file}
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

          {statements.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} statements
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 rounded-md text-gray-600 hover:bg-[#ddd0b8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="First page"
                >
                  <ChevronsLeft size={20} />
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-md text-gray-600 hover:bg-[#ddd0b8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="p-2 rounded-md text-gray-600 hover:bg-[#ddd0b8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="p-2 rounded-md text-gray-600 hover:bg-[#ddd0b8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Last page"
                >
                  <ChevronsRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-[#f3eed4] rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">About Statements</h3>
          <p className="text-gray-600">
            Official statements, position papers, and policy positions from CEPA on key governance and parliamentary issues.
          </p>
        </div>
      </main>
    </div>
  )
}