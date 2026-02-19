import { fetchCommittee } from '@/lib/api'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Users, User, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function CommitteeDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let committee
  try {
    committee = await fetchCommittee(id)
  } catch (error) {
    console.error('Failed to fetch committee:', error)
    notFound()
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatTerm = (beginDate: string | null, endDate: string | null): string => {
    if (!beginDate && !endDate) return 'Term not specified'
    if (!beginDate) return `Until ${formatDate(endDate)}`
    if (!endDate) return `From ${formatDate(beginDate)}`
    return `${formatDate(beginDate)} - ${formatDate(endDate)}`
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href="/resources/committees" 
            className="inline-flex items-center gap-2 text-[#2d5016] hover:text-[#1b3d26] mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Committees
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{committee.title}</h1>
          {committee.description && (
            <p className="text-gray-600 mt-2">{committee.description}</p>
          )}
        </div>

        {/* Committee Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-gray-600 text-sm mb-1">Term</p>
                <p className="text-gray-900 font-semibold text-sm">{formatTerm(committee.begin_date, committee.end_date)}</p>
              </div>
            </div>
          </div>

          {committee.chairperson && (
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <User className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">Chairperson</p>
                  <p className="text-gray-900 font-semibold text-sm truncate">{committee.chairperson}</p>
                </div>
              </div>
            </div>
          )}

          {committee.deputy_chairperson && (
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <User className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">Deputy Chairperson</p>
                  <p className="text-gray-900 font-semibold text-sm truncate">{committee.deputy_chairperson}</p>
                </div>
              </div>
            </div>
          )}

          <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
              <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                  <Users className="w-6 h-6 text-[#2d5016]" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-sm mb-1">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{committee.members.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Members Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2d5016]" />
                Members of Parliament
              </h2>
            </div>
            <div className="overflow-x-auto">
              {committee.members.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No members assigned to this committee.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#fafaf8]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Party
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Constituency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {committee.members.map((member) => (
                      <tr key={member.id} className="hover:bg-[#fafaf8] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/trackers/mps/${member.id}`}
                            className="text-[#2d5016] hover:text-[#1b3d26] font-medium hover:underline"
                          >
                            {member.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {member.party || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {member.constituency || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2d5016]" />
                Committee Documents
              </h2>
            </div>
            <div className="overflow-x-auto">
              {committee.documents.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No documents available for this committee.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#fafaf8]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {committee.documents.map((document) => (
                      <tr key={document.id} className="hover:bg-[#fafaf8] transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {document.title}
                            </p>
                            {document.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {document.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {document.document_date ? formatDate(document.document_date) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {document.file && (
                            <a
                              href={document.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-[#2d5016] text-white px-4 py-2 rounded-md hover:bg-[#1b3d26] transition-colors text-sm"
                            >
                              <Download size={16} />
                              Download
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
