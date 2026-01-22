'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Users, Calendar, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchCommittees, Committee } from '@/lib/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function CommitteesPage() {
  const [committees, setCommittees] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 12

  useEffect(() => {
    fetchCommitteesData()
  }, [page, searchQuery])

  const fetchCommitteesData = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await fetchCommittees(page, pageSize, {
        search: searchQuery.trim() || undefined,
        ordering: 'title',
      })
      
      setCommittees(data.results)
      setTotalCount(data.count)
      setTotalPages(Math.ceil(data.count / pageSize))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching committees:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchCommitteesData()
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatTerm = (beginDate: string | null, endDate: string | null): string => {
    if (!beginDate && !endDate) return 'Term not specified'
    if (!beginDate) return `Until ${formatDate(endDate)}`
    if (!endDate) return `From ${formatDate(beginDate)}`
    return `${formatDate(beginDate)} - ${formatDate(endDate)}`
  }

  if (loading && committees.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3eed4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016]"></div>
          <p className="text-gray-600">Loading committees...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f3eed4] flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-lg font-semibold mb-2">Error Loading Committees</h2>
          <p className="mb-4">{error}</p>
          <Button
            onClick={fetchCommitteesData}
            variant="green"
          >
            Try Again
          </Button>
        </div>
      </div>
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Parliamentary Committees</h1>
          <p className="text-gray-600 mt-2">Explore committees, their members, and documents</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search through ${totalCount} committees...`}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400"
                  style={{ color: '#111827' }}
                />
              </div>
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setPage(1)
                  }}
                  className="bg-[#d2c4b0] text-gray-700 hover:bg-[#c4b5a0] border-gray-300"
                >
                  Clear
                </Button>
              )}
              <Button
                type="submit"
                variant="green"
                className="bg-[#2d5016] text-white hover:bg-[#1b3d26]"
              >
                Search
              </Button>
            </form>
          </div>
        </div>

        {committees.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg">No committees found.</p>
            {searchQuery && (
              <p className="text-gray-500 mt-2">Try adjusting your search query.</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {committees.map((committee) => (
                <Link
                  key={committee.id}
                  href={`/resources/committees/${committee.id}`}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 block"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {committee.title}
                  </h2>
                  
                  {committee.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {committee.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                      <span className="flex-1">
                        <span className="font-medium">Term: </span>
                        {formatTerm(committee.begin_date, committee.end_date)}
                      </span>
                    </div>

                    {committee.chairperson_name && (
                      <div className="flex items-start gap-2 text-gray-700">
                        <User className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                        <span className="flex-1">
                          <span className="font-medium">Chairperson: </span>
                          {committee.chairperson_name}
                        </span>
                      </div>
                    )}

                    {committee.deputy_chairperson_name && (
                      <div className="flex items-start gap-2 text-gray-700">
                        <User className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                        <span className="flex-1">
                          <span className="font-medium">Deputy Chairperson: </span>
                          {committee.deputy_chairperson_name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-4 h-4 flex-shrink-0 text-gray-500" />
                      <span>
                        <span className="font-medium">{committee.member_count}</span> member{committee.member_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="text-sm text-gray-600">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} committees
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="bg-[#d2c4b0] text-gray-700 hover:bg-[#c4b5a0] border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="bg-[#d2c4b0] text-gray-700 hover:bg-[#c4b5a0] border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <span className="text-sm text-gray-700 px-3">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="bg-[#d2c4b0] text-gray-700 hover:bg-[#c4b5a0] border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="bg-[#d2c4b0] text-gray-700 hover:bg-[#c4b5a0] border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
