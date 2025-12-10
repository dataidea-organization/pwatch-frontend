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
