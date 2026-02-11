import { fetchPublication } from '@/lib/api'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Tag, FileText, ExternalLink, Download } from 'lucide-react'

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let publication
  try {
    publication = await fetchPublication(id)
  } catch (error) {
    console.error('Failed to fetch publication:', error)
    notFound()
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-[#f5f0e8] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/resources/publications"
            className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Publications
          </Link>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[#2d5016] bg-[#2d5016]/10 px-2.5 py-1 rounded">
              {publication.type}
            </span>
            {publication.category && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                <Tag className="w-4 h-4" />
                {publication.category}
              </span>
            )}
            {publication.featured && (
              <span className="text-xs font-medium bg-[#2d5016] text-white px-2 py-0.5 rounded">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{publication.title}</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(publication.date)}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {publication.image && (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                <Image
                  src={publication.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  unoptimized={publication.image.startsWith('http')}
                />
              </div>
            )}

            <div className="bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-wrap">
                {publication.description}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#fafaf8] rounded-lg border border-gray-200 shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Download & links</h2>
              <div className="space-y-3">
                {publication.pdf && (
                  <a
                    href={publication.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-[#f5f0e8] text-gray-900 transition-colors"
                  >
                    <Download className="w-5 h-5 text-[#2d5016] flex-shrink-0" />
                    <span className="font-medium">Download PDF</span>
                  </a>
                )}
                {publication.url && (
                  <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-[#f5f0e8] text-gray-900 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-[#2d5016] flex-shrink-0" />
                    <span className="font-medium">View external link</span>
                  </a>
                )}
                {!publication.pdf && !publication.url && (
                  <p className="text-sm text-gray-500">No download or external link available.</p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Type</dt>
                    <dd className="font-medium text-gray-900">{publication.type}</dd>
                  </div>
                  {publication.category && (
                    <div>
                      <dt className="text-gray-500">Category</dt>
                      <dd className="font-medium text-gray-900">{publication.category}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-500">Date</dt>
                    <dd className="font-medium text-gray-900">{formatDate(publication.date)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
