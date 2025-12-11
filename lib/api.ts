const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface BillReading {
  id: number;
  stage: string;
  stage_display: string;
  date: string;
  details: string;
  document: string | null;
  committee_report: string | null;
  analysis: string | null;
  mp_photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: number;
  title: string;
  bill_type: string;
  bill_type_display: string;
  year_introduced: string;
  mover: string;
  assigned_to: string;
  status: string;
  status_display: string;
  description: string;
  video_url: string | null;
  likes: number;
  comments: number;
  shares: number;
  readings: BillReading[];
  created_at: string;
  updated_at: string;
}

export interface BillList {
  id: number;
  title: string;
  bill_type: string;
  bill_type_display: string;
  year_introduced: string;
  mover: string;
  status: string;
  status_display: string;
  created_at: string;
}

export async function fetchBills(
  search?: string,
  ordering?: string
): Promise<BillList[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (ordering) params.append('ordering', ordering);

  const url = `${API_BASE_URL}/trackers/bills/${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch bills');
  }
  return response.json();
}

export interface BillSummary {
  '1st_reading': number;
  '2nd_reading': number;
  '3rd_reading': number;
  passed: number;
  assented: number;
  withdrawn: number;
  total: number;
}

export async function fetchBillSummary(): Promise<BillSummary> {
  const response = await fetch(`${API_BASE_URL}/trackers/bills/summary/`);
  if (!response.ok) {
    throw new Error('Failed to fetch bills summary');
  }
  return response.json();
}

export async function fetchBill(id: string): Promise<Bill> {
  const response = await fetch(`${API_BASE_URL}/trackers/bills/${id}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch bill');
  }
  return response.json();
}

export async function likeBill(id: number): Promise<{ likes: number }> {
  const response = await fetch(`${API_BASE_URL}/trackers/bills/${id}/like/`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to like bill');
  }
  return response.json();
}

export async function commentBill(id: number): Promise<{ comments: number }> {
  const response = await fetch(`${API_BASE_URL}/trackers/bills/${id}/comment/`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to comment on bill');
  }
  return response.json();
}

export async function shareBill(id: number): Promise<{ shares: number }> {
  const response = await fetch(`${API_BASE_URL}/trackers/bills/${id}/share/`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to share bill');
  }
  return response.json();
}

// News API
export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  author: string;
  category: string;
  category_display: string;
  excerpt: string;
  image: string | null;
  published_date: string;
}

export interface NewsDetail extends NewsArticle {
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NewsPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NewsArticle[];
}

export async function fetchNews(page: number = 1, pageSize: number = 12): Promise<NewsPaginatedResponse> {
  const response = await fetch(`${API_BASE_URL}/news/?page=${page}&page_size=${pageSize}`);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
}

export async function fetchNewsArticle(slug: string): Promise<NewsDetail> {
  const response = await fetch(`${API_BASE_URL}/news/${slug}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch news article');
  }
  return response.json();
}

// MPs API
export interface MP {
  id: number;
  name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  party: string;
  constituency: string;
  district: string;
  photo: string | null;
  phone_no?: string;
  email?: string;
}

export interface MPDetail extends MP {
  phone_no: string;
  email: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface MPPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MP[];
}

export interface MPSummary {
  total_mps: number;
  total_parties: number;
  total_districts: number;
  party_distribution: {
    party: string;
    count: number;
    percentage: number;
  }[];
}

export async function fetchMPs(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    party?: string;
    district?: string;
    constituency?: string;
    search?: string;
    ordering?: string;
  }
): Promise<MPPaginatedResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (filters?.party) params.append('party', filters.party);
  if (filters?.district) params.append('district', filters.district);
  if (filters?.constituency) params.append('constituency', filters.constituency);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.ordering) params.append('ordering', filters.ordering);

  const response = await fetch(`${API_BASE_URL}/trackers/mps/?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch MPs');
  }
  return response.json();
}

export async function fetchMPSummary(
  filters?: {
    party?: string;
    district?: string;
    constituency?: string;
    search?: string;
  }
): Promise<MPSummary> {
  const params = new URLSearchParams();

  if (filters?.party) params.append('party', filters.party);
  if (filters?.district) params.append('district', filters.district);
  if (filters?.constituency) params.append('constituency', filters.constituency);
  if (filters?.search) params.append('search', filters.search);

  const query = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/trackers/mps/summary/${query ? `?${query}` : ''}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch MPs summary');
  }
  return response.json();
}

export async function fetchMP(id: string): Promise<MPDetail> {
  const response = await fetch(`${API_BASE_URL}/trackers/mps/${id}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch MP');
  }
  return response.json();
}

// X Spaces API
export interface XSpace {
  id: number;
  title: string;
  description: string;
  host: string;
  scheduled_date: string;
  duration: number | null;
  x_space_url: string;
  recording_url: string | null;
  thumbnail: string | null;
  status: string;
  status_display: string;
  topics: string;
  speakers: string;
  created_at: string;
  updated_at: string;
}

export interface XSpacePaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: XSpace[];
}

export async function fetchXSpaces(
  page: number = 1,
  pageSize: number = 12,
  filters?: {
    status?: string;
    search?: string;
    ordering?: string;
  }
): Promise<XSpacePaginatedResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.ordering) params.append('ordering', filters.ordering);

  const response = await fetch(`${API_BASE_URL}/multimedia/x-spaces/?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch X Spaces');
  }
  return response.json();
}

export async function fetchXSpace(id: string): Promise<XSpace> {
  const response = await fetch(`${API_BASE_URL}/multimedia/x-spaces/${id}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch X Space');
  }
  return response.json();
}
