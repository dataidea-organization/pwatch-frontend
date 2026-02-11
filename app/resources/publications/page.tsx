'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search, ChevronLeft, ChevronRight, FileText, Calendar, Tag, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchPublications, Publication, fetchPageHeroImage } from '@/lib/api'

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 12
  const [heroImage, setHeroImage] = useState<string>('/images/reports.jpg')

  useEffect(() => {
    fetchPageHeroImage('publications').then((data) => {
      if (data?.image) {
        setHeroImage(data.image)
      }
    })
  }, [])

  useEffect(() => {
    fetchPublicationsData()
  }, [page, searchQuery, typeFilter])

  const fetchPublicationsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await fetchPublications(page, pageSize, {
        search: searchQuery.trim() || undefined,
        type: typeFilter || undefined,
        ordering: '-date',
      })

      setPublications(data.results)
      setTotalCount(data.count)
      setTotalPages(Math.ceil(data.count / pageSize))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching publications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPublicationsData()
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const publicationTypes = [
    { value: '', label: 'All types' },
    { value: 'Policy Brief', label: 'Policy Brief' },
    { value: 'Policy Paper', label: 'Policy Paper' },
    { value: 'Research Report', label: 'Research Report' },
    { value: 'Analysis', label: 'Analysis' },
  ]

  if (loading && publications.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016]"></div>
          <p className="text-gray-600">Loading publications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-lg font-semibold mb-2">Error Loading Publications</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={fetchPublicationsData} variant="green">
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

        <div className="relative mb-10 h-[400px] overflow-hidden rounded-2xl shadow-xl">
          <Image
            src={heroImage}
            alt="Publications - research, policy briefs, and reports"
            fill
            className="object-cover"
            sizes="100vw"
            priority
            unoptimized={heroImage.startsWith('http')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 z-10 px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 mb-3">
                <FileText className="w-4 h-4 text-white" aria-hidden />
                <span className="text-sm font-medium text-white/90">Research & policy</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-3">
                Publications
              </h1>
              <p className="text-base text-white/90 leading-relaxed sm:text-lg">
                Browse research publications, policy briefs, and reports. Search by title or category and filter by type.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search through ${totalCount} publications...`}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-gray-400"
                  style={{ color: '#111827' }}
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 min-w-[160px]"
              >
                {publicationTypes.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
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
              <Button type="submit" variant="green" className="bg-[#2d5016] text-white hover:bg-[#1b3d26]">
                Search
              </Button>
            </form>
          </div>
        </div>

        {publications.length === 0 ? (
          <div className="bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg">No publications found.</p>
            {(searchQuery || typeFilter) && (
              <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {publications.map((pub) => (
                <Link
                  key={pub.id}
                  href={`/resources/publications/${pub.id}`}
                  className="bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden block group"
                >
                  <div className="relative aspect-[16/10] bg-gray-100">
                    {pub.image ? (
                      <Image
                        src={pub.image}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized={pub.image.startsWith('http')}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2d5016]/10 to-[#1b3d26]/5">
                        <FileText className="w-16 h-16 text-[#2d5016]/40" />
                      </div>
                    )}
                    {pub.featured && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-[#2d5016] text-white rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2d5016] bg-[#2d5016]/10 px-2 py-0.5 rounded">
                        {pub.type}
                      </span>
                      {pub.category && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <Tag className="w-3 h-3" />
                          {pub.category}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#2d5016] transition-colors">
                      {pub.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pub.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      {formatDate(pub.date)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="text-sm text-gray-600">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount}{' '}
                  publications
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
