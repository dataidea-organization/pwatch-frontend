'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, FileText, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrderPaper {
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
  results: OrderPaper[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function OrderPaperPage() {
  const [allOrderPapers, setAllOrderPapers] = useState<OrderPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllOrderPapers()
  }, [])

  const loadAllOrderPapers = async () => {
    setLoading(true)
    setError(null)

    try {
      let allResults: OrderPaper[] = []
      let currentPage = 1
      let hasMore = true

      while (hasMore) {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: '100',
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

  // Extract unique years from order papers
  const years = useMemo(() => {
    const yearSet = new Set<number>()
    
    allOrderPapers.forEach((orderPaper) => {
      if (orderPaper.date_received) {
        const year = new Date(orderPaper.date_received).getFullYear()
        if (!isNaN(year)) {
          yearSet.add(year)
        }
      }
    })

    return Array.from(yearSet).sort((a, b) => b - a)
  }, [allOrderPapers])

  // Count order papers per year
  const getOrderPaperCountForYear = (year: number) => {
    return allOrderPapers.filter((orderPaper) => {
      if (!orderPaper.date_received) return false
      return new Date(orderPaper.date_received).getFullYear() === year
    }).length
  }

  // Count order papers without dates
  const undatedCount = useMemo(() => {
    return allOrderPapers.filter((orderPaper) => !orderPaper.date_received).length
  }, [allOrderPapers])

  // Statistics calculations
  const stats = useMemo(() => {
    const totalOrderPapers = allOrderPapers.length
    const totalYears = years.length
    
    // Helper function to count order papers per year
    const countForYear = (year: number) => {
      return allOrderPapers.filter((orderPaper) => {
        if (!orderPaper.date_received) return false
        return new Date(orderPaper.date_received).getFullYear() === year
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
    const recentCount = allOrderPapers.filter((orderPaper) => {
      if (!orderPaper.created_at) return false
      return new Date(orderPaper.created_at) >= thirtyDaysAgo
    }).length

    return {
      totalOrderPapers,
      totalYears,
      mostActiveYear,
      maxCount,
      recentCount,
    }
  }, [allOrderPapers, years])

  if (loading && allOrderPapers.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
            <p className="mt-4 text-gray-600">Loading order papers...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error && allOrderPapers.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button
              onClick={() => loadAllOrderPapers()}
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
            src="/images/order-papers.jpg"
            alt="Parliament building - home of legislative business and order papers"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 z-10 px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 mb-3">
                <FileText className="w-4 h-4 text-white" aria-hidden />
                <span className="text-sm font-medium text-white/90">Parliamentary business</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-3">
                Order Papers
              </h1>
              <p className="text-base text-white/90 leading-relaxed sm:text-lg">
                Order Papers outline the business to be conducted during parliamentary sessions. Browse by year
                and month, and download documents listing questions, motions, bills, and other items scheduled
                for debate and consideration by Members of Parliament.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {!loading && allOrderPapers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Order Papers */}
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
                  <p className="text-gray-600 text-sm mb-1">Total Order Papers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrderPapers.toLocaleString()}</p>
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
                      {stats.maxCount} {stats.maxCount === 1 ? 'order paper' : 'order papers'}
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
                  <p className="text-xs text-gray-500 mt-1">New order papers</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-600 text-lg">Select a year to view parliamentary order papers outlining daily business and proceedings</p>
        </div>

        {/* Year Cards Grid */}
        {(years.length > 0 || undatedCount > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {years.map((year) => {
              const count = getOrderPaperCountForYear(year)
              return (
                <Link
                  key={year}
                  href={`/trackers/order-paper/${year}`}
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
                        {count} {count === 1 ? 'order paper' : 'order papers'}
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
                href="/trackers/order-paper/undated"
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
                      {undatedCount} {undatedCount === 1 ? 'order paper' : 'order papers'}
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
            <p className="text-gray-500 text-lg">No order papers available</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for new order papers</p>
          </div>
        )}

        <div className="mt-8 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About Order Papers</h2>
          <p className="text-gray-600 text-sm">
            Order Papers outline the business to be conducted during parliamentary sessions. They include questions,
            motions, bills, and other items scheduled for debate and consideration by Members of Parliament.
          </p>
        </div>
      </main>
    </div>
  )
}
