'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, Clock } from 'lucide-react'

export default function ParliamentPerformancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Parliament Performance Tracker</h1>
          <p className="text-gray-600 mt-2">Track and analyze parliamentary performance metrics</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-[#085e29] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-12 h-12 text-[#085e29]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h2>
            <p className="text-gray-600 max-w-md">
              We're working on bringing you comprehensive parliament performance indicators and analytics.
              This feature will help you track and understand parliamentary activities and effectiveness.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

