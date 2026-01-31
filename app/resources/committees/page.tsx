'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Users, Calendar, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchCommittees, Committee, fetchPageHeroImage } from '@/lib/api'

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
  const [heroImage, setHeroImage] = useState<string>('/images/committees.jpg')

  useEffect(() => {
    // Fetch dynamic hero image
    fetchPageHeroImage('committees').then((data) => {
      if (data?.image) {
        setHeroImage(data.image)
      }
    })
  }, [])

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
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016]"></div>
          <p className="text-gray-600">Loading committees...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/resources" className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] mb-4 transition-colors">
            <ArrowLeft className="mr-2" size={20} />
            Back to Resources
          </Link>
        </div>

        {/* Hero Section - full-cover image with text on dark overlay at bottom (height matches home page hero) */}
        <div className="relative mb-10 h-[400px] overflow-hidden rounded-2xl shadow-xl">
          <Image
            src={heroImage}
            alt="Parliamentary committees - explore committees, members, and documents"
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
                <Users className="w-4 h-4 text-white" aria-hidden />
                <span className="text-sm font-medium text-white/90">Parliamentary committees</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-3">
                Parliamentary Committees
              </h1>
              <p className="text-base text-white/90 leading-relaxed sm:text-lg">
                Explore parliamentary committees, their members, and documents. Search by name,
                view committee details, and stay informed about committee work and proceedings.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search through ${totalCount} committees...`}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-gray-400"
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
                  className="bg-[#fafaf8] text-gray-700 hover:bg-[#f5f0e8] border-gray-300"
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
          <div className="bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm p-12 text-center">
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
                  className="bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 block"
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
              <div className="flex items-center justify-between bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="text-sm text-gray-600">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} committees
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="bg-[#fafaf8] text-gray-700 hover:bg-[#f5f0e8] border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="bg-[#fafaf8] text-gray-700 hover:bg-[#f5f0e8] border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="bg-[#fafaf8] text-gray-700 hover:bg-[#f5f0e8] border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="bg-[#fafaf8] text-gray-700 hover:bg-[#f5f0e8] border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
