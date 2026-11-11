'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, DollarSign, TrendingUp } from 'lucide-react';
import { fetchPageHeroImage } from '@/lib/api';

interface DebtData {
  id: number;
  year: number;
  national_debt: number;
  gdp: number;
  interest: number;
  total_expenditure: number;
  debt_per_citizen: number;
  gdp_per_capita: number;
  per_capita_income: number;
  population: number;
  created_at: string;
  updated_at: string;
}

export default function DebtTrackerPage() {
  const [debtData, setDebtData] = useState<DebtData[]>([]);
  const [latestData, setLatestData] = useState<DebtData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string>('/images/debt.jpg');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    fetchPageHeroImage('debt').then((data) => {
      if (data?.image) {
        setHeroImage(data.image);
      }
    });
  }, []);

  useEffect(() => {
    const fetchDebtData = async () => {
      try {
        setLoading(true);

        // Fetch all debt data
        const response = await fetch(`${API_BASE_URL}/trackers/debt/`);
        if (!response.ok) {
          throw new Error('Failed to fetch debt data');
        }
        const data = await response.json();
        setDebtData(data);

        // Fetch latest data
        const latestResponse = await fetch(`${API_BASE_URL}/trackers/debt/latest/`);
        if (!latestResponse.ok) {
          throw new Error('Failed to fetch latest debt data');
        }
        const latest = await latestResponse.json();
        setLatestData(latest);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching debt data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDebtData();
  }, []);

  const millionsToUGX = (millions: number) => Number(millions) * 1_000_000;

  const formatCompactUGX = (ugx: number) => {
    const abs = Math.abs(ugx);
    const format = (value: number) =>
      value.toLocaleString(undefined, { maximumFractionDigits: 2 });

    if (abs >= 1_000_000_000_000) {
      return `${format(ugx / 1_000_000_000_000)}T`;
    }
    if (abs >= 1_000_000_000) {
      return `${format(ugx / 1_000_000_000)}B`;
    }
    if (abs >= 1_000_000) {
      return `${format(ugx / 1_000_000)}M`;
    }
    if (abs >= 1_000) {
      return `${format(ugx / 1_000)}K`;
    }
    return ugx.toLocaleString();
  };

  const formatMillionsUGX = (millions: number) => `UGX ${formatCompactUGX(millionsToUGX(millions))}`;
  const formatUGX = (ugx: number) => `UGX ${formatCompactUGX(ugx)}`;

  const perCapitaMetrics = (() => {
    if (!latestData) {
      return null;
    }
    const population = Number(latestData.population) || 0;
    const debtPerCitizen = population
      ? millionsToUGX(latestData.national_debt) / population
      : Number(latestData.debt_per_citizen) || 0;
    const gdpPerCapita = population
      ? millionsToUGX(latestData.gdp) / population
      : Number(latestData.gdp_per_capita) || 0;
    const perCapitaIncome = Number(latestData.per_capita_income) || 0;
    const scale = Math.max(debtPerCitizen, gdpPerCapita, perCapitaIncome);
    const barWidth = (value: number) => {
      if (!scale || value <= 0) return '0%';
      return `${Math.min(100, (value / scale) * 100)}%`;
    };
    return { population, debtPerCitizen, gdpPerCapita, perCapitaIncome, barWidth };
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
            <p className="mt-4 text-gray-600">Loading debt tracker data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#2d5016] text-white px-6 py-2 rounded-md hover:bg-[#1b3d26] transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href="/trackers"
            className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trackers
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-10 h-[400px] overflow-hidden rounded-2xl shadow-xl">
          <Image
            src={heroImage}
            alt="National Debt Tracker - Uganda debt and economic indicators"
            fill
            className="object-cover"
            sizes="100vw"
            priority
            unoptimized={heroImage.startsWith('http')}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 z-10 px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 mb-3">
                <DollarSign className="w-4 h-4 text-white" aria-hidden />
                <span className="text-sm font-medium text-white/90">Economic indicators</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-3">
                National Debt Tracker
              </h1>
              <p className="text-base text-white/90 leading-relaxed sm:text-lg">
                Track Uganda&apos;s national debt and GDP over time. Explore per capita metrics and trends.
              </p>
            </div>
          </div>
        </div>

        {/* Top Stats Cards */}
        {latestData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* National Debt */}
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <DollarSign className="w-6 h-6 text-[#2d5016]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-1">National Debt</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatMillionsUGX(latestData.national_debt)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">As of {latestData.year}</p>
                </div>
              </div>
            </div>

            {/* GDP */}
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
                  <p className="text-gray-600 text-sm mb-1">GDP</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatMillionsUGX(latestData.gdp)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">As of {latestData.year}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Chart and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">GDP and National Debt Trends</h2>
            </div>
            <div className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={debtData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis
                  label={{ value: 'UGX', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => formatCompactUGX(millionsToUGX(value))}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip
                  formatter={(value: number) => formatMillionsUGX(value)}
                  labelFormatter={(label) => `Year: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area
                  type="monotone"
                  dataKey="gdp"
                  stroke="#2d5016"
                  fill="#c6ecd6"
                  name="GDP"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="national_debt"
                  stroke="#dc2626"
                  fill="#fecaca"
                  name="National Debt"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Sidebar Metrics */}
          {latestData && perCapitaMetrics && (
            <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Per Capita Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Debt Per Citizen</span>
                    <span className="text-sm font-bold text-[#2d5016]">
                      {perCapitaMetrics.debtPerCitizen > 0
                        ? formatUGX(perCapitaMetrics.debtPerCitizen)
                        : '—'}
                    </span>
                  </div>
                  <div className="w-full bg-[#f5f0e8] rounded-full h-3">
                    <div
                      className="bg-[#2d5016] h-3 rounded-full transition-all duration-500"
                      style={{ width: perCapitaMetrics.barWidth(perCapitaMetrics.debtPerCitizen) }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">GDP Per Capita</span>
                    <span className="text-sm font-bold text-[#2d5016]">
                      {perCapitaMetrics.gdpPerCapita > 0
                        ? formatUGX(perCapitaMetrics.gdpPerCapita)
                        : '—'}
                    </span>
                  </div>
                  <div className="w-full bg-[#f5f0e8] rounded-full h-3">
                    <div
                      className="bg-[#2d5016] h-3 rounded-full transition-all duration-500"
                      style={{ width: perCapitaMetrics.barWidth(perCapitaMetrics.gdpPerCapita) }}
                    ></div>
                  </div>
                </div>

                {perCapitaMetrics.perCapitaIncome > 0 && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Per Capita Income</span>
                      <span className="text-sm font-bold text-[#2d5016]">
                        {formatUGX(perCapitaMetrics.perCapitaIncome)}
                      </span>
                    </div>
                    <div className="w-full bg-[#f5f0e8] rounded-full h-3">
                      <div
                        className="bg-[#2d5016] h-3 rounded-full transition-all duration-500"
                        style={{ width: perCapitaMetrics.barWidth(perCapitaMetrics.perCapitaIncome) }}
                      ></div>
                    </div>
                  </div>
                )}

                {perCapitaMetrics.population > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Population ({latestData.year}):</span>
                      <span className="ml-2 font-bold text-gray-900">
                        {perCapitaMetrics.population.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Data Source Footer */}
        <div className="mt-8 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About This Data</h3>
          <p className="text-sm text-gray-600">
            National debt and economic data is collected from official government sources and updated annually.
            All figures are in Uganda Shillings (UGX). Data covers fiscal years from {debtData[0]?.year} to {debtData[debtData.length - 1]?.year}.
          </p>
        </div>
      </main>
    </div>
  );
}