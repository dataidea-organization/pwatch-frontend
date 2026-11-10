import { fetchLoan } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileDown } from 'lucide-react';
import { publicDocumentUrl } from '@/lib/media';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let loan;
  try {
    loan = await fetchLoan(id);
  } catch (error) {
    console.error('Failed to fetch loan:', error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/trackers/loans"
            className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] font-medium transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Loans Tracker
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{loan.label}</h1>
          <p className="text-gray-600 mt-2">Loan details, lender, amount, and documents</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Loan information table (1/3) */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Loan information</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 w-48">Label</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{loan.label}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 w-48">Sector</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{loan.sector_display}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 w-48">Lender</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{loan.lender_display || loan.source_display || '—'}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 w-48">Currency</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{loan.currency_display}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 w-48">Amount</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(Number(loan.approved_amount), loan.currency)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 w-48">Approval date</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(loan.approval_date)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Details and documents (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Details</h2>
              </div>
              <div className="p-6">
                {loan.description ? (
                  <div
                    className="blog-content prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#2d5016] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-xl prose-img:shadow-md"
                    dangerouslySetInnerHTML={{ __html: loan.description }}
                  />
                ) : (
                  <p className="text-gray-600">No description available.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
              </div>
              <div className="p-6">
                {loan.documents && loan.documents.length > 0 ? (
                  <div className="space-y-2">
                    {loan.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={publicDocumentUrl(doc.file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-[#2d5016] rounded-md border border-gray-200 hover:border-[#2d5016]/30 transition-colors"
                      >
                        <FileDown className="w-4 h-4 flex-shrink-0" />
                        <span>{doc.label}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No documents attached yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/trackers/loans">
            <button
              type="button"
              className="px-8 py-3 bg-[#2d5016] text-white rounded-lg hover:bg-[#1b3d26] transition-colors font-medium shadow-sm hover:shadow-md"
            >
              View All Loans
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
