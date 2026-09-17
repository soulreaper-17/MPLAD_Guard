const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface ProjectSummary {
  project_id: string;
  project_name: string;
  work_type: string;
  status: string;
  constituency: string;
  district: string;
  agency_id: string;
  agency_name: string;
  sanctioned_amount: number;
  released_amount: number;
  expenditure: number;
  sanction_date: string;
  start_date?: string;
  expected_completion_date?: string;
  actual_completion_date?: string;
  latitude: number;
  longitude: number;
  priority_score: number;
  is_anomaly: boolean;
  investigation_status: string;
}

export interface RiskDetail {
  priority_score: number;
  financial_risk: number;
  timeline_risk: number;
  agency_risk: number;
  geographic_risk: number;
  similarity_risk: number;
  is_anomaly: boolean;
  financial_explanation: string;
  timeline_explanation: string;
  agency_explanation: string;
  geographic_explanation: string;
  similarity_explanation: string;
  overall_explanation: string;
  recommended_verification: string[];
}

export interface EvidenceItem {
  evidence_id: string;
  project_id: string;
  title: string;
  source: string;
  evidence_type: string;
  content: string;
  relevance: string;
  created_at?: string;
}

export interface InvestigationDetail {
  investigation_id: number;
  project_id: string;
  investigator: string;
  status: string;
  notes: string;
  findings: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends ProjectSummary {
  description: string;
  location_id: string;
  block_name?: string;
  gram_panchayat_or_ward?: string;
  data_source_label: string;
  risk?: RiskDetail;
  investigation?: InvestigationDetail;
  evidence_items: EvidenceItem[];
}

export interface PeerMetric {
  project_id: string;
  project_name: string;
  agency_name: string;
  work_type: string;
  sanctioned_amount: number;
  expenditure: number;
  duration_days: number;
  delay_days: number;
  cost_per_km_or_unit?: number;
  status: string;
  similarity_score: number;
  is_subject: boolean;
}

export interface PeerComparisonResponse {
  subject_project_id: string;
  peer_group_name: string;
  selection_rationale: string;
  peer_count: number;
  benchmarks: Record<string, any>;
  peers: PeerMetric[];
}

export interface AgencySummary {
  agency_id: string;
  agency_name: string;
  agency_type: string;
  district: string;
  state: string;
  project_count: number;
  completed_count: number;
  delayed_count: number;
  completion_rate: number;
  delay_rate: number;
  average_cost: number;
  average_delay: number;
  risk_profile_level: string;
}

export interface AgencyDetail extends AgencySummary {
  work_type_distribution: Record<string, number>;
  associated_projects: ProjectSummary[];
  historical_risk_signals: string[];
}

export interface DashboardStats {
  constituency: string;
  total_projects: number;
  high_priority_count: number;
  medium_priority_count: number;
  low_priority_count: number;
  under_investigation_count: number;
  resolved_count: number;
  total_sanctioned_amount: number;
  total_expenditure: number;
  total_agencies: number;
  average_priority_score: number;
  risk_distribution: Record<string, number>;
  work_type_distribution: Record<string, number>;
  top_priority_projects: ProjectSummary[];
  recent_investigations: Array<{
    project_id: string;
    project_name: string;
    work_type: string;
    priority_score: number;
    status: string;
    notes: string;
    updated_at: string;
  }>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  data: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  weight: number;
}

export interface GraphResponse {
  project_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AssistantAnswer {
  answer: string;
  evidence_citations: Array<{
    evidence_id: string;
    title: string;
    source: string;
    type: string;
    relevance: string;
  }>;
  confidence: string;
  mode: string;
  timestamp: string;
}

// Helper fetch wrapper
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText}`);
  }
  return res.json();
}

const getActiveConstituencyId = (): string => {
  if (typeof window === 'undefined') return 'nalanda';
  try {
    const saved = localStorage.getItem('selected_constituency');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id) return parsed.id;
    }
  } catch (e) {}
  return 'nalanda';
};

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch<{ email: string; name: string; role: string; agency: string; token: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  sendOtp: (phone_number: string) =>
    apiFetch<{ success: boolean; masked_phone: string; message: string; expires_in: number; dev_otp?: string }>(
      '/auth/send-otp',
      { method: 'POST', body: JSON.stringify({ phone_number }) }
    ),

  verifyOtp: (phone_number: string, otp: string) =>
    apiFetch<{ email: string; name: string; role: string; agency: string; token: string; phone?: string }>(
      '/auth/verify-otp',
      { method: 'POST', body: JSON.stringify({ phone_number, otp }) }
    ),

  sendEmailOtp: (email: string) =>
    apiFetch<{ success: boolean; masked_email: string; message: string; expires_in: number; dev_otp?: string }>(
      '/auth/send-email-otp',
      { method: 'POST', body: JSON.stringify({ email }) }
    ),

  verifyEmailOtp: (email: string, otp: string) =>
    apiFetch<{ success: boolean; verification_token: string; message: string }>(
      '/auth/verify-email-otp',
      { method: 'POST', body: JSON.stringify({ email, otp }) }
    ),

  register: (data: { email: string; password: string; name: string; role?: string; agency?: string; state?: string; verification_token?: string }) =>
    apiFetch<{ email: string; name: string; role: string; agency: string; token: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  // Dashboard
  getDashboardStats: (constituencyId?: string) => {
    const cId = constituencyId || getActiveConstituencyId();
    return apiFetch<DashboardStats>(`/dashboard/stats?constituency=${encodeURIComponent(cId)}`);
  },

  // Projects
  getProjects: (params?: {
    constituency?: string;
    status?: string;
    work_type?: string;
    agency_id?: string;
    min_priority?: number;
    max_priority?: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const q = new URLSearchParams();
    const cId = params?.constituency || getActiveConstituencyId();
    if (cId) q.append('constituency', cId);
    if (params?.status) q.append('status', params.status);
    if (params?.work_type) q.append('work_type', params.work_type);
    if (params?.agency_id) q.append('agency_id', params.agency_id);
    if (params?.min_priority !== undefined) q.append('min_priority', params.min_priority.toString());
    if (params?.max_priority !== undefined) q.append('max_priority', params.max_priority.toString());
    if (params?.search) q.append('search', params.search);
    if (params?.sort_by) q.append('sort_by', params.sort_by);
    if (params?.sort_order) q.append('sort_order', params.sort_order);
    return apiFetch<ProjectSummary[]>(`/projects?${q.toString()}`);
  },

  getProjectById: (projectId: string) =>
    apiFetch<ProjectDetail>(`/projects/${projectId}`),

  getProjectPeers: (projectId: string) =>
    apiFetch<PeerComparisonResponse>(`/projects/${projectId}/peers`),

  updateInvestigation: (projectId: string, data: { status: string; notes?: string; findings?: string[] }) =>
    apiFetch<InvestigationDetail>(`/projects/${projectId}/investigation`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Agencies
  getAgencies: (constituencyId?: string) => {
    const cId = constituencyId || getActiveConstituencyId();
    return apiFetch<AgencySummary[]>(`/agencies?constituency=${encodeURIComponent(cId)}`);
  },

  getAgencyById: (agencyId: string) => apiFetch<AgencyDetail>(`/agencies/${agencyId}`),

  // Map
  getMapMarkers: (params?: { constituency?: string; min_priority?: number; work_type?: string; agency_id?: string }) => {
    const q = new URLSearchParams();
    const cId = params?.constituency || getActiveConstituencyId();
    if (cId) q.append('constituency', cId);
    if (params?.min_priority !== undefined) q.append('min_priority', params.min_priority.toString());
    if (params?.work_type) q.append('work_type', params.work_type);
    if (params?.agency_id) q.append('agency_id', params.agency_id);
    return apiFetch<any[]>(`/map/markers?${q.toString()}`);
  },

  getNearbyProjects: (projectId: string, radiusKm: number = 3.0) =>
    apiFetch<{ project_id: string; subject_latitude: number; subject_longitude: number; count: number; nearby: any[] }>(
      `/map/nearby/${projectId}?radius_km=${radiusKm}`
    ),

  // Graph
  getProjectGraph: (projectId: string, depth: number = 2) =>
    apiFetch<GraphResponse>(`/graph/project/${projectId}?depth=${depth}`),

  // AI Assistant
  askAssistant: (question: string, projectId?: string) =>
    apiFetch<AssistantAnswer>('/assistant/ask', {
      method: 'POST',
      body: JSON.stringify({ question, project_id: projectId }),
    }),

  // Reports
  getProjectReport: (projectId: string) =>
    apiFetch<any>(`/reports/project/${projectId}`),

  submitPublicReport: (projectId: string, data: { complaint_text: string; user_email?: string; user_name?: string }) =>
    apiFetch<any>(`/reports/project/${projectId}/public-report`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPublicReports: (projectId: string, userEmail?: string) => {
    const email = userEmail || 'citizen@mpladguard.gov.in';
    return apiFetch<{
      project_id: string;
      total_reports_count: number;
      max_capacity: number;
      user_can_submit_today: boolean;
      reports: Array<{
        report_id: number;
        project_id: string;
        user_email: string;
        user_name: string;
        complaint_text: string;
        ai_critical_points: string[];
        ai_urgency: string;
        status: string;
        created_at: string;
      }>;
    }>(`/reports/project/${projectId}/public-reports?user_email=${encodeURIComponent(email)}`);
  },
};

