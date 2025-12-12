'use client';

import Header from '@/components/Header';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { submitContactForm } from '@/lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
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
      const response = await submitContactForm(formData);
      setSubmitStatus({
        type: 'success',
        message: response.message || 'Thank you for contacting us! We will respond within 48 hours.',
      });
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit your message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-600 mt-2">Get in touch with the Centre for Policy Analysis team</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Send us a Message</h2>
            <p className="text-gray-600 mb-6">
              Fill out the form below and we will get back to you within 48 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#085e29] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#085e29] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#085e29] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="What is this regarding?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={isSubmitting}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#085e29] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#085e29] text-white py-3 rounded-md hover:bg-[#064920] transition-colors font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information Cards - Vertical */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Mail className="text-[#085e29]" size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <a href="mailto:info@cepa.or.ug" className="text-gray-600 hover:text-[#085e29] transition-colors text-sm">
                    info@cepa.or.ug
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Phone className="text-[#085e29]" size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                  <a href="tel:+256414237498" className="text-gray-600 hover:text-[#085e29] transition-colors text-sm block">
                    +256 414 237 498
                </a>
                  <a href="tel:+256772626266" className="text-gray-600 hover:text-[#085e29] transition-colors text-sm block">
                    +256 772 626 266
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="text-[#085e29]" size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-600 text-sm">
                    Plot 18, Kanjokya Street,<br />
                    Kamwokya, Kampala<br />
                    Uganda
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Clock className="text-[#085e29]" size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Office Hours</h3>
                  <p className="text-gray-600 text-sm">
                    Monday - Friday<br />
                    8:00 AM - 5:00 PM<br />
                    EAT (UTC+3)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}