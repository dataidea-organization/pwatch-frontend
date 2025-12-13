'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { submitDonationForm } from '@/lib/api';
import { CheckCircle, AlertCircle, Building2, CreditCard, Smartphone, Banknote } from 'lucide-react';

export default function DonatePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: 'Uganda',
    address: '',
    donationMethod: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Convert camelCase to snake_case for API
      const apiData = {
        name: formData.name,
        email: formData.email,
        country: formData.country,
        address: formData.address || undefined,
        donation_method: formData.donationMethod || undefined,
        message: formData.message || undefined,
      };
      const response = await submitDonationForm(apiData);
      setSubmitStatus({
        type: 'success',
        message: response.message || 'Thank you for your donation! We will process your submission shortly.',
      });
      // Reset form
      setFormData({
        name: '',
        email: '',
        country: 'Uganda',
        address: '',
        donationMethod: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit your donation. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Support Our Mission</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The Centre for Policy Analysis (CEPA) is dedicated to monitoring and tracking the Ugandan Parliament, 
            providing relevant data and expert insights to promote transparency, accountability, and good governance.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Donation Information</h2>
                <p className="text-gray-600">
                  Please provide your details below. All information will be kept confidential and secure.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Status Messages */}
                {submitStatus.type && (
                  <div
                    className={`p-4 rounded-md flex items-start gap-3 ${
                      submitStatus.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {submitStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <p
                      className={`text-sm ${
                        submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {submitStatus.message}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-gray-300 focus-visible:ring-[#085e29] focus-visible:border-[#085e29]"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="border-gray-300 focus-visible:ring-[#085e29] focus-visible:border-[#085e29]"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#085e29] focus-visible:border-[#085e29]"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="Uganda">Uganda</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="border-gray-300 focus-visible:ring-[#085e29] focus-visible:border-[#085e29]"
                      placeholder="Street address, City, Postal code"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Preferred Donation Method
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#085e29] hover:bg-gray-50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        id="mobile-money"
                        name="donationMethod"
                        value="mobile-money"
                        checked={formData.donationMethod === 'mobile-money'}
                        onChange={(e) => setFormData({ ...formData, donationMethod: e.target.value })}
                        className="mt-1 h-4 w-4 text-[#085e29] focus:ring-[#085e29] border-gray-300"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="mobile-money" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Smartphone className="w-5 h-5 text-[#085e29]" />
                          <span className="font-medium text-gray-900">Mobile Money</span>
                        </div>
                        <p className="text-sm text-gray-600">MTN: 0755588080 (UGX)</p>
                      </label>
                    </div>

                    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#085e29] hover:bg-gray-50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        id="bank-transfer"
                        name="donationMethod"
                        value="bank-transfer"
                        checked={formData.donationMethod === 'bank-transfer'}
                        onChange={(e) => setFormData({ ...formData, donationMethod: e.target.value })}
                        className="mt-1 h-4 w-4 text-[#085e29] focus:ring-[#085e29] border-gray-300"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="bank-transfer" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-5 h-5 text-[#085e29]" />
                          <span className="font-medium text-gray-900">Bank Transfer</span>
                        </div>
                        <p className="text-sm text-gray-600">Account details will be provided upon submission</p>
                      </label>
                    </div>

                    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#085e29] hover:bg-gray-50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        id="other"
                        name="donationMethod"
                        value="other"
                        checked={formData.donationMethod === 'other'}
                        onChange={(e) => setFormData({ ...formData, donationMethod: e.target.value })}
                        className="mt-1 h-4 w-4 text-[#085e29] focus:ring-[#085e29] border-gray-300"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="other" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Banknote className="w-5 h-5 text-[#085e29]" />
                          <span className="font-medium text-gray-900">Other Method</span>
                        </div>
                        <p className="text-sm text-gray-600">Please specify in the message field below</p>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#085e29] focus-visible:border-[#085e29] resize-none"
                    placeholder="Any additional information or special instructions..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    type="submit" 
                    variant="green" 
                    size="lg" 
                    className="w-full md:w-auto px-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Donation Request'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-3">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">

            {/* Contact Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-900">Email:</span><br />
                  info@parliamentwatch.ug
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Phone:</span><br />
                  +256 755 588 080
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Secure & Confidential</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                All donation information is encrypted and securely processed. We respect your privacy 
                and will never share your personal information with third parties.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
