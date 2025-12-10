'use client';

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function DonatePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: 'United States',
    address: '',
    donationMethod: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Donation form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant="donate" />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative h-96 lg:h-auto rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">CSBAG Meeting Image</span>
            </div>
          </div>

          <div>
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                The Civil Society Budget Advocacy Group (CSBAG) is a non for Profit coalition formed in 2004 to bring together CSOs at national and district levels to influence Government decisions on resource mobilization and utilization for equitable and sustainable development. CSBAG was created out of a desire to collectively influence government and effectively participate in setting national budget priorities. Your donation is highly appreciated.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-[#085e29] focus-visible:ring-[#085e29]"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-[#085e29] focus-visible:ring-[#085e29]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full h-9 rounded-md border border-[#085e29] bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#085e29]"
                  >
                    <option value="United States">United States</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="border-[#085e29] focus-visible:ring-[#085e29]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How do you want to donate?
                </label>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="mobile-money"
                    checked={formData.donationMethod === 'mobile-money'}
                    onChange={(e) => setFormData({ ...formData, donationMethod: e.target.checked ? 'mobile-money' : '' })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#085e29] focus:ring-[#085e29]"
                  />
                  <label htmlFor="mobile-money" className="text-sm text-gray-700 cursor-pointer">
                    Mobile Money (075558808) Ushs
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-[#085e29] bg-transparent px-3 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#085e29] resize-none"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" variant="green" size="lg" className="w-full md:w-auto px-12">
                  Submit Donation
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}