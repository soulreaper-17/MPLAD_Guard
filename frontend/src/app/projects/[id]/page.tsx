'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  api,
  ProjectDetail,
  PeerComparisonResponse,
  AgencyDetail,
  GraphResponse,
  InvestigationDetail,
} from '@/lib/api';
import { formatCurrency, getStatusBadge, getInvestigationStatusBadge } from '@/lib/utils';
import RiskBadge from '@/components/RiskBadge';
import RiskRadar from '@/components/RiskRadar';
import PeerComparisonTable from '@/components/PeerComparisonTable';
import AgencyFingerprint from '@/components/AgencyFingerprint';
import LeafletMap from '@/components/LeafletMap';
import CytoscapeGraph from '@/components/CytoscapeGraph';
import EvidenceDossier from '@/components/EvidenceDossier';
import AiChatDrawer from '@/components/AiChatDrawer';
import InvestigationModal from '@/components/InvestigationModal';
import FloatingReasons from '@/components/FloatingReasons';
import PublicReportTab from '@/components/PublicReportTab';
import {
  ShieldAlert,
  ArrowLeft,
  FileText,
  Building2,
  MapPin,
  Share2,
  FileCheck,
  Bot,
  Layers,
  Scale,
  Calendar,
  AlertTriangle,
  Printer,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectInvestigationPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [peers, setPeers] = useState<PeerComparisonResponse | null>(null);
  const [agency, setAgency] = useState<AgencyDetail | null>(null);
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [nearbyData, setNearbyData] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<string>('risk');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<'OFFICER' | 'CITIZEN' | 'GUEST'>('GUEST');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mplad_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.user_role === 'OFFICER' || parsed.role?.includes('Officer') || parsed.role?.includes('Auditor')) {
            setUserRole('OFFICER');
          } else if (parsed.user_role === 'CITIZEN' || parsed.role?.includes('Public') || parsed.role?.includes('Citizen')) {
            setUserRole('CITIZEN');
          } else {
            setUserRole('GUEST');
          }
        } else {
          setUserRole('GUEST');
        }
      } catch (e) {
        setUserRole('GUEST');
      }
    }
  }, []);

  useEffect(() => {
    async function loadAllProjectData() {
      if (!projectId) return;
      setLoading(true);
      setError('');

      try {
        const [projRes, peerRes, graphRes, nearbyRes] = await Promise.all([
          api.getProjectById(projectId),
          api.getProjectPeers(projectId).catch(() => null),
          api.getProjectGraph(projectId).catch(() => null),
          api.getNearbyProjects(projectId, 3.0).catch(() => null),
        ]);

        setProject(projRes);
        setPeers(peerRes);
        setGraphData(graphRes);
        setNearbyData(nearbyRes);

        if (projRes.agency_id) {
          try {
            const agyRes = await api.getAgencyById(projRes.agency_id);
            setAgency(agyRes);
          } catch (e) {
            console.error('Agency fetch error', e);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load project investigation dossier');
      } finally {
        setLoading(false);
      }
    }

    loadAllProjectData();
  }, [projectId]);

  const handleInvestigationUpdate = (updated: InvestigationDetail) => {
    if (project) {
      setProject({
        ...project,
        investigation: updated,
        investigation_status: updated.status,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4 font-mono">
        <div className="w-10 h-10 border-4 border-[#285C7A] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#667078]">ASSEMBLING SPATIAL INVESTIGATION DOSSIER...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="floating-slab bg-[#C45145]/10 border border-[#C45145]/30 p-6 text-xs text-[#C45145] font-mono space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>CASE DOSSIER NOT FOUND</span>
        </div>
        <p>{error || `Project ID ${projectId} does not exist.`}</p>
        <Link
          href="/queue"
          className="tactile-light-switch inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO QUEUE</span>
        </Link>
      </div>
    );
  }

  const baseTabs = [
    { id: 'risk', label: '1. RISK & EXPLAINABILITY', icon: ShieldAlert },
    { id: 'overview', label: '2. OVERVIEW', icon: Layers },
    { id: 'peers', label: '3. PEER COMPARISON', icon: Scale },
    { id: 'agency', label: '4. AGENCY PROFILE', icon: Building2 },
    { id: 'map', label: '5. GIS SPATIAL', icon: MapPin },
    { id: 'graph', label: '6. GRAPH BOARD', icon: Share2 },
    { id: 'evidence', label: '7. EVIDENCE LOCKER', icon: FileText },
    { id: 'assistant', label: '8. AI WORKSTATION', icon: Bot },
    { id: 'decision', label: '9. OFFICER LOG', icon: FileCheck },
  ];

  const tabs = userRole === 'GUEST'
    ? baseTabs
    : [...baseTabs, { id: 'report', label: '10. REPORT INACCURACY', icon: AlertTriangle }];

  const statusBadge = getStatusBadge(project.status);
  const invBadge = getInvestigationStatusBadge(project.investigation_status);

  return (
    <div className="space-y-8 font-mono pb-12">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#667078]">
          <Link href="/queue" className="hover:text-[#285C7A] flex items-center gap-1 font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>INVESTIGATION QUEUE</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#9AA3AB]" />
          <span className="font-bold text-[#285C7A]">{project.project_id}</span>
        </div>

        <Link
          href={`/reports?projectId=${project.project_id}`}
          className="tactile-light-switch flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold text-[#182027]"
        >
          <Printer className="w-3.5 h-3.5 text-[#C88A25]" />
          <span>GENERATE OFFICIAL REPORT</span>
        </Link>
      </div>

      {/* LARGE FLOATING 3D CASE DOSSIER HEADER */}
      <div className="floating-slab p-8 space-y-6 shadow-[0_24px_60px_rgba(40,50,55,0.08)]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm font-black text-[#285C7A] bg-[#285C7A]/10 px-3.5 py-1 rounded-full border border-[#285C7A]/20">
                {project.project_id}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.bg}`}>
                {statusBadge.text}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${invBadge.bg}`}>
                STATUS: {invBadge.text}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#182027] font-sans leading-snug">
              {project.project_name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#667078] font-sans pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#285C7A]" />
                <span>
                  {project.block_name || 'Nalanda'}, {project.gram_panchayat_or_ward} &bull; {project.district}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>{project.agency_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#667078]" />
                <span>Sanction: {project.sanction_date?.split('T')[0]}</span>
              </div>
            </div>
          </div>

          {/* Priority Score Ceramic Callout */}
          {project.risk && (
            <div className="recessed-light-display p-6 flex flex-col items-center justify-center shrink-0 min-w-[220px] text-center space-y-2 border-[#C88A25]/30">
              <span className="text-[9px] font-bold text-[#667078] uppercase tracking-widest">
                INVESTIGATION PRIORITY
              </span>
              <RiskBadge
                score={project.risk.priority_score}
                isAnomaly={project.risk.is_anomaly}
                size="lg"
                showLabel={true}
              />
              <span className="text-[9px] text-[#667078] font-mono block mt-1 uppercase">
                AI Prioritizes &bull; Human Verifies
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tactile 3D Tab Rail */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E7E1] pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tactile-light-switch flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono font-bold transition ${
                isActive
                  ? 'tactile-light-switch-active text-white'
                  : 'text-[#667078] hover:text-[#182027]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#9AA3AB]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB WORKSPACES */}
      <div className="transition-all">
        {/* TAB 1: Risk Signals & Explainability */}
        {activeTab === 'risk' && project.risk && (
          <div className="space-y-8">
            {/* Floating Semantic Reasons for Prioritization */}
            <FloatingReasons overallExplanation={project.risk.overall_explanation} />

            {/* 5-Dimension Radar Component */}
            <RiskRadar risk={project.risk} />

            {/* Recommended Verification Checklist */}
            <div className="floating-slab p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#182027] font-bold text-xs uppercase tracking-wider border-b border-[#E4E7E1] pb-3">
                <FileCheck className="w-4 h-4 text-[#285C7A]" />
                <span>RECOMMENDED VERIFICATION PROTOCOL (HUMAN INVESTIGATOR ACTIONS)</span>
              </div>
              <div className="space-y-3">
                {project.risk.recommended_verification.map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAFAF7] border border-[#E4E7E1] text-xs text-[#182027] font-sans"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#285C7A]/10 text-[#285C7A] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="floating-slab p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#285C7A] uppercase tracking-wider border-b border-[#E4E7E1] pb-3">
                PROJECT FINANCIAL PROFILE
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-[#F5F6F3]">
                  <span className="text-[#667078]">Sanctioned Amount</span>
                  <span className="font-mono font-extrabold text-[#182027]">
                    {formatCurrency(project.sanctioned_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F5F6F3]">
                  <span className="text-[#667078]">Released Amount</span>
                  <span className="font-mono font-semibold text-[#182027]">
                    {formatCurrency(project.released_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F5F6F3]">
                  <span className="text-[#667078]">Recorded Expenditure</span>
                  <span className="font-mono font-extrabold text-[#182027]">
                    {formatCurrency(project.expenditure)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F5F6F3]">
                  <span className="text-[#667078]">Utilization Ratio</span>
                  <span className="font-mono font-extrabold text-[#398265]">
                    {((project.expenditure / project.sanctioned_amount) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="floating-slab p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#285C7A] uppercase tracking-wider border-b border-[#E4E7E1] pb-3">
                EXECUTION TIMELINE &amp; SCOPE
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-[#F5F6F3]">
                  <span className="text-[#667078]">Sanction Date</span>
                  <span className="font-mono text-[#182027]">
                    {project.sanction_date?.split('T')[0]}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F5F6F3]">
                  <span className="text-[#667078]">Start Date</span>
                  <span className="font-mono text-[#182027]">
                    {project.start_date?.split('T')[0] || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F5F6F3]">
                  <span className="text-[#667078]">Expected Completion</span>
                  <span className="font-mono text-[#182027]">
                    {project.expected_completion_date?.split('T')[0] || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F5F6F3]">
                  <span className="text-[#667078]">Actual Completion</span>
                  <span className="font-mono text-[#182027]">
                    {project.actual_completion_date?.split('T')[0] || 'Ongoing'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 floating-slab p-6 space-y-3">
              <h3 className="text-xs font-bold text-[#285C7A] uppercase tracking-wider">
                FULL SCOPE DESCRIPTION
              </h3>
              <p className="text-xs text-[#182027] leading-relaxed font-sans recessed-light-display p-5">
                {project.description}
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Peer Comparison */}
        {activeTab === 'peers' && peers && <PeerComparisonTable data={peers} />}

        {/* TAB 4: Agency Profile */}
        {activeTab === 'agency' && agency && <AgencyFingerprint agency={agency} />}

        {/* TAB 5: GIS Spatial Map */}
        {activeTab === 'map' && nearbyData && (
          <div className="space-y-6">
            <div className="floating-slab p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#285C7A] uppercase tracking-wider flex items-center gap-2 border-b border-[#E4E7E1] pb-3">
                <MapPin className="w-4 h-4 text-[#285C7A]" />
                <span>GEOGRAPHIC PROXIMITY RADIUS (500M POTENTIAL OVERLAP INSPECTION)</span>
              </h3>
              <LeafletMap
                markers={[
                  {
                    project_id: project.project_id,
                    project_name: project.project_name,
                    work_type: project.work_type,
                    status: project.status,
                    agency_name: project.agency_name,
                    sanctioned_amount: project.sanctioned_amount,
                    latitude: project.latitude,
                    longitude: project.longitude,
                    priority_score: project.priority_score,
                  },
                  ...nearbyData.nearby.map((n: any) => ({
                    project_id: n.project_id,
                    project_name: n.project_name,
                    work_type: n.work_type,
                    status: 'Completed',
                    agency_name: n.agency_name,
                    sanctioned_amount: n.sanctioned_amount,
                    latitude: n.latitude,
                    longitude: n.longitude,
                    priority_score: n.priority_score,
                  })),
                ]}
                selectedProjectId={project.project_id}
                center={[project.latitude, project.longitude]}
                zoom={14}
                height="480px"
                showProximityCircle={true}
                proximityRadiusKm={0.5}
              />
            </div>

            {/* Nearby Projects List */}
            <div className="floating-slab p-6 space-y-3">
              <h4 className="text-xs font-bold text-[#182027] uppercase">
                NEARBY SANCTIONED WORKS WITHIN 3.0 KM ({nearbyData.count})
              </h4>
              <div className="divide-y divide-[#E4E7E1] text-xs">
                {nearbyData.nearby.map((item: any) => (
                  <div key={item.project_id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#285C7A]">{item.project_id}</span>
                        {item.is_same_work_type && (
                          <span className="bg-[#C45145]/10 text-[#C45145] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#C45145]/30 uppercase">
                            SAME WORK CATEGORY
                          </span>
                        )}
                      </div>
                      <div className="text-[#182027] font-sans text-xs truncate max-w-lg mt-0.5">
                        {item.project_name}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-[#182027] block">
                        {item.distance_meters}m away
                      </span>
                      <span className="text-[10px] text-[#667078]">
                        {formatCurrency(item.sanctioned_amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Investigation Graph */}
        {activeTab === 'graph' && graphData && (
          <div className="space-y-6">
            <div className="floating-slab p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E7E1] pb-3">
                <h3 className="text-xs font-bold text-[#285C7A] uppercase tracking-wider flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#285C7A]" />
                  <span>INTERACTIVE CROSS-PROJECT ENTITY INVESTIGATION GRAPH</span>
                </h3>
                <span className="text-xs text-[#667078] font-mono">
                  {graphData.nodes.length} CONNECTED NODES &bull; {graphData.edges.length} EDGES
                </span>
              </div>
              <CytoscapeGraph nodes={graphData.nodes} edges={graphData.edges} height="520px" />
            </div>
          </div>
        )}

        {/* TAB 7: Evidence Locker */}
        {activeTab === 'evidence' && (
          <EvidenceDossier evidenceItems={project.evidence_items} projectId={project.project_id} />
        )}

        {/* TAB 8: AI Assistant Terminal */}
        {activeTab === 'assistant' && <AiChatDrawer projectId={project.project_id} />}

        {/* TAB 9: Officer Log */}
        {activeTab === 'decision' && (
          <InvestigationModal
            projectId={project.project_id}
            currentStatus={project.investigation_status}
            currentNotes={project.investigation?.notes || ''}
            onUpdate={handleInvestigationUpdate}
            readOnly={userRole !== 'OFFICER'}
          />
        )}

        {/* TAB 10: Public Report / Complaint Filing */}
        {activeTab === 'report' && (
          <PublicReportTab projectId={project.project_id} />
        )}
      </div>
    </div>
  );
}
