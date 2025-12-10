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

export async function fetchBills(): Promise<BillList[]> {
  const response = await fetch(`${API_BASE_URL}/trackers/bills/`);
  if (!response.ok) {
    throw new Error('Failed to fetch bills');
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

export async function fetchMPs(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    party?: string;
    district?: string;
    constituency?: string;
    search?: string;
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

  const response = await fetch(`${API_BASE_URL}/trackers/mps/?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch MPs');
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
