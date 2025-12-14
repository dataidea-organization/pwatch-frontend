'use client'

import Link from 'next/link'
import { Home, FileX, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-[#085e29] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
              <FileX className="w-12 h-12 text-[#085e29]" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
            <p className="text-gray-600 max-w-md mb-8">
              Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or the URL might be incorrect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/">
                <Button variant="green" size="lg" className="w-full sm:w-auto">
                  <Home className="w-5 h-5" />
                  Go to Homepage
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

