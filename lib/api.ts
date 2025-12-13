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

// Home page news summary - optimized and cached
export interface HomeNewsSummaryResponse {
  results: NewsArticle[];
}

export async function fetchHomeNewsSummary(): Promise<HomeNewsSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/news/home-summary/`);
  if (!response.ok) {
    throw new Error('Failed to fetch home news summary');
  }
  return response.json();
}

// Blog API
export interface BlogPost {
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

export interface BlogDetail extends BlogPost {
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogPost[];
}

export async function fetchBlogs(
  page: number = 1,
  pageSize: number = 12,
  filters?: {
    category?: string;
    status?: string;
    search?: string;
    ordering?: string;
  }
): Promise<BlogPaginatedResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.ordering) params.append('ordering', filters.ordering);

  const response = await fetch(`${API_BASE_URL}/blog/?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch blogs');
  }
  return response.json();
}

export async function fetchBlog(slug: string): Promise<BlogDetail> {
  const response = await fetch(`${API_BASE_URL}/blog/${slug}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch blog post');
  }
  return response.json();
}

export interface HomeBlogSummaryResponse {
  results: BlogPost[];
}

export async function fetchHomeBlogSummary(): Promise<HomeBlogSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/blog/home-summary/`);
  if (!response.ok) {
    throw new Error('Failed to fetch home blog summary');
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

// Home page trackers summary
export interface HomeTrackersSummary {
  mps: Array<{
    id: number;
    name: string;
    party: string;
    constituency: string;
  }>;
  bills: Array<{
    id: number;
    title: string;
  }>;
  loans: Array<{
    id: number;
    label: string;
    sector_display: string;
    source_display: string;
  }>;
  budgets: Array<{
    id: number;
    name: string;
    financial_year: string;
    file: string | null;
  }>;
  hansards: Array<{
    id: number;
    name: string;
    date: string | null;
    file: string | null;
  }>;
  order_papers: Array<{
    id: number;
    name: string;
    file: string | null;
  }>;
}

export async function fetchHomeTrackersSummary(): Promise<HomeTrackersSummary> {
  const response = await fetch(`${API_BASE_URL}/trackers/home-summary/`);
  if (!response.ok) {
    throw new Error('Failed to fetch home trackers summary');
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

// Podcasts API
export interface Podcast {
  id: number;
  title: string;
  description: string;
  host: string;
  guest: string;
  youtube_url: string;
  thumbnail: string | null;
  duration: number | null;
  published_date: string;
  episode_number: number | null;
  category: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export interface PodcastPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Podcast[];
}

export async function fetchPodcasts(
  page: number = 1,
  pageSize: number = 12,
  filters?: {
    category?: string;
    search?: string;
    ordering?: string;
  }
): Promise<PodcastPaginatedResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (filters?.category) params.append('category', filters.category);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.ordering) params.append('ordering', filters.ordering);

  const response = await fetch(`${API_BASE_URL}/multimedia/podcasts/?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch podcasts');
  }
  return response.json();
}

export async function fetchPodcast(id: string): Promise<Podcast> {
  const response = await fetch(`${API_BASE_URL}/multimedia/podcasts/${id}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch podcast');
  }
  return response.json();
}

// Gallery API
export interface GalleryImage {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  event_date: string | null;
  photographer: string;
  tags: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GalleryImage[];
}

export async function fetchGalleryImages(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    category?: string;
    featured?: boolean;
    search?: string;
    ordering?: string;
  }
): Promise<GalleryPaginatedResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (filters?.category) params.append('category', filters.category);
  if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.ordering) params.append('ordering', filters.ordering);

  const response = await fetch(`${API_BASE_URL}/multimedia/gallery/?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch gallery images');
  }
  return response.json();
}

export async function fetchGalleryImage(id: string): Promise<GalleryImage> {
  const response = await fetch(`${API_BASE_URL}/multimedia/gallery/${id}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch gallery image');
  }
  return response.json();
}

// Polls API
export interface PollOption {
  id: number;
  text: string;
  order: number;
  vote_count: number;
  vote_percentage: number;
  created_at: string;
}

export interface Poll {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'active' | 'closed';
  status_display: string;
  start_date: string | null;
  end_date: string | null;
  allow_multiple_votes: boolean;
  show_results_before_voting: boolean;
  featured: boolean;
  options: PollOption[];
  total_votes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PollPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Poll[];
}

export interface PollResults {
  poll_id: number;
  poll_title: string;
  total_votes: number;
  results: {
    option_id: number;
    text: string;
    vote_count: number;
    percentage: number;
  }[];
}

export async function fetchPolls(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    status?: string;
    category?: string;
    featured?: boolean;
    search?: string;
    ordering?: string;
  }
): Promise<PollPaginatedResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.ordering) params.append('ordering', filters.ordering);

  const response = await fetch(`${API_BASE_URL}/multimedia/polls/?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch polls');
  }
  return response.json();
}

export async function fetchPoll(id: string): Promise<Poll> {
  const response = await fetch(`${API_BASE_URL}/multimedia/polls/${id}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch poll');
  }
  return response.json();
}

export async function voteOnPoll(pollId: number, optionId: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/multimedia/polls/${pollId}/vote/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ option_id: optionId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit vote');
  }
  return response.json();
}

export async function fetchPollResults(pollId: number): Promise<PollResults> {
  const response = await fetch(`${API_BASE_URL}/multimedia/polls/${pollId}/results/`);
  if (!response.ok) {
    throw new Error('Failed to fetch poll results');
  }
  return response.json();
}

// Contact API
export interface ContactSubmission {
  id?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  id?: number;
}

export async function submitContactForm(data: ContactSubmission): Promise<ContactSubmissionResponse> {
  const response = await fetch(`${API_BASE_URL}/contact/submissions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.detail || 'Failed to submit contact form');
  }

  return response.json();
}

// About API
export interface Objective {
  id: number;
  title: string;
  description: string;
  order: number;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  title: string;
  bio: string;
  photo: string | null;
  email: string;
  phone: string;
  linkedin_url: string;
  twitter_url: string;
  facebook_url: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchObjectives(): Promise<Objective[]> {
  const response = await fetch(`${API_BASE_URL}/about/objectives/`);
  if (!response.ok) {
    throw new Error('Failed to fetch objectives');
  }
  const data = await response.json();
  // Handle both array response and paginated response
  return Array.isArray(data) ? data : data.results || [];
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const response = await fetch(`${API_BASE_URL}/about/team-members/`);
  if (!response.ok) {
    throw new Error('Failed to fetch team members');
  }
  const data = await response.json();
  // Handle both array response and paginated response
  return Array.isArray(data) ? data : data.results || [];
}

// Home API
export interface HeroImage {
  id: number;
  title: string;
  image: string;
  order: number;
  is_active: boolean;
  alt_text: string;
  created_at: string;
  updated_at: string;
}

export interface Headline {
  id: number;
  text: string;
  is_bold: boolean;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchHeroImages(): Promise<HeroImage[]> {
  const response = await fetch(`${API_BASE_URL}/home/hero-images/`);
  if (!response.ok) {
    throw new Error('Failed to fetch hero images');
  }
  const data = await response.json();
  // Handle both array response and paginated response
  return Array.isArray(data) ? data : data.results || [];
}

export async function fetchHeadlines(): Promise<Headline[]> {
  const response = await fetch(`${API_BASE_URL}/home/headlines/`);
  if (!response.ok) {
    throw new Error('Failed to fetch headlines');
  }
  const data = await response.json();
  // Handle both array response and paginated response
  return Array.isArray(data) ? data : data.results || [];
}

// Home page resources summary
export interface HomeResourcesSummary {
  explainers: Array<{
    id: number;
    name: string;
    file: string | null;
  }>;
  reports: Array<{
    id: number;
    name: string;
    file: string | null;
  }>;
  partner_publications: Array<{
    id: number;
    name: string;
    file: string | null;
  }>;
  statements: Array<{
    id: number;
    name: string;
    file: string | null;
  }>;
}

export async function fetchHomeResourcesSummary(): Promise<HomeResourcesSummary> {
  const response = await fetch(`${API_BASE_URL}/resources/home-summary/`);
  if (!response.ok) {
    throw new Error('Failed to fetch home resources summary');
  }
  return response.json();
}

// Global Search API
export interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  slug?: string;
  author?: string;
  category?: string;
  category_display?: string;
  excerpt?: string;
  image?: string | null;
  published_date?: string;
  [key: string]: any; // Allow additional fields
}

export interface GlobalSearchResponse {
  query: string;
  total_results: number;
  results: {
    news?: SearchResult[];
    blogs?: SearchResult[];
    mps?: SearchResult[];
    bills?: SearchResult[];
    loans?: SearchResult[];
    budgets?: SearchResult[];
    hansards?: SearchResult[];
    order_papers?: SearchResult[];
    explainers?: SearchResult[];
    reports?: SearchResult[];
    partner_publications?: SearchResult[];
    statements?: SearchResult[];
    podcasts?: SearchResult[];
    xspaces?: SearchResult[];
    gallery?: SearchResult[];
    polls?: SearchResult[];
  };
  counts: {
    news?: number;
    blogs?: number;
    mps?: number;
    bills?: number;
    loans?: number;
    budgets?: number;
    hansards?: number;
    order_papers?: number;
    explainers?: number;
    reports?: number;
    partner_publications?: number;
    statements?: number;
    podcasts?: number;
    xspaces?: number;
    gallery?: number;
    polls?: number;
  };
}

export async function searchGlobal(query: string, limit: number = 5): Promise<GlobalSearchResponse> {
  if (!query.trim()) {
    return {
      query: '',
      total_results: 0,
      results: {},
      counts: {}
    };
  }

  const params = new URLSearchParams({
    q: query.trim(),
    limit: limit.toString()
  });

  const response = await fetch(`${API_BASE_URL}/search/?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to perform search');
  }
  return response.json();
}
