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
import {
  ShieldAlert,
  ArrowLeft,
  FileText,
  DollarSign,
  Clock,
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

        // Fetch agency details if available
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
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
        <div className="w-8 h-8 border-4 border-gov-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Assembling multi-dimensional investigation dossier...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>Case Dossier Not Found</span>
        </div>
        <p className="text-xs">{error || `Project ID ${projectId} does not exist.`}</p>
        <Link
          href="/queue"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gov-900 text-white rounded text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Queue</span>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'risk', label: '1. Risk Signals & Explainability', icon: ShieldAlert },
    { id: 'overview', label: '2. Project Overview', icon: Layers },
    { id: 'peers', label: '3. Peer Comparison', icon: Scale },
    { id: 'agency', label: '4. Agency Profile', icon: Building2 },
    { id: 'map', label: '5. GIS Spatial Context', icon: MapPin },
    { id: 'graph', label: '6. Investigation Graph', icon: Share2 },
    { id: 'evidence', label: '7. Evidence Dossier', icon: FileText },
    { id: 'assistant', label: '8. AI Assistant (RAG)', icon: Bot },
    { id: 'decision', label: '9. Investigator Action', icon: FileCheck },
  ];

  const statusBadge = getStatusBadge(project.status);
  const invBadge = getInvestigationStatusBadge(project.investigation_status);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/queue" className="hover:text-gov-800 flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Investigation Queue</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-mono font-bold text-slate-800">{project.project_id}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/reports?projectId=${project.project_id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 shadow-2xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Generate Official Report</span>
          </Link>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base font-black text-gov-900 bg-gov-50 px-2.5 py-0.5 rounded border border-gov-200">
                {project.project_id}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${statusBadge.bg}`}>
                {statusBadge.text}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${invBadge.bg}`}>
                STATUS: {invBadge.text}
              </span>
              <span className="text-[10px] font-mono text-slate-400 border border-slate-200 px-2 py-0.5 rounded">
                {project.data_source_label}
              </span>
            </div>

            <h1 className="text-base font-black text-slate-900 leading-snug">
              {project.project_name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-sans">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gov-600" />
                <span>
                  {project.block_name || 'Nalanda'}, {project.gram_panchayat_or_ward} &bull; {project.district}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                <span>{project.agency_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Sanction: {project.sanction_date?.split('T')[0]}</span>
              </div>
            </div>
          </div>

          {/* Priority Score Box */}
          {project.risk && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center shrink-0 min-w-[200px] text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Investigation Priority
              </span>
              <RiskBadge
                score={project.risk.priority_score}
                isAnomaly={project.risk.is_anomaly}
                size="lg"
                showLabel={true}
              />
              <span className="text-[10px] text-slate-400 block font-mono mt-1">
                AI Prioritizes &bull; Human Verifies
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-gov-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="transition-all">
        {/* TAB 1: Risk Signals & Explainability */}
        {activeTab === 'risk' && project.risk && (
          <div className="space-y-6">
            {/* Overall Explainability Summary Card */}
            <div className="bg-amber-50/80 border border-amber-300 p-5 rounded-xl shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>WHY WAS THIS CASE PRIORITIZED? (EXPLAINABLE REASONING)</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {project.risk.overall_explanation}
              </p>
            </div>

            {/* 5-Dimension Radar Component */}
            <RiskRadar risk={project.risk} />

            {/* Recommended Verification Checklist */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <FileCheck className="w-4 h-4 text-gov-600" />
                <span>Recommended Verification Protocol (Human Investigator Actions)</span>
              </div>
              <div className="space-y-2">
                {project.risk.recommended_verification.map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-gov-100 text-gov-800 font-bold text-[10px] flex items-center justify-center shrink-0">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Project Financial Profile
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Sanctioned Amount</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(project.sanctioned_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Released Amount</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {formatCurrency(project.released_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Recorded Expenditure</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(project.expenditure)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Utilization Ratio</span>
                  <span className="font-mono font-bold text-slate-800">
                    {((project.expenditure / project.sanctioned_amount) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Execution Timeline & Scope
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Sanction Date</span>
                  <span className="font-mono text-slate-800">
                    {project.sanction_date?.split('T')[0]}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Start Date</span>
                  <span className="font-mono text-slate-800">
                    {project.start_date?.split('T')[0] || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Expected Completion</span>
                  <span className="font-mono text-slate-800">
                    {project.expected_completion_date?.split('T')[0] || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Actual Completion</span>
                  <span className="font-mono text-slate-800">
                    {project.actual_completion_date?.split('T')[0] || 'Ongoing'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Full Scope Description
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-4 rounded-lg border border-slate-200">
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
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gov-600" />
                <span>Geographic Proximity Radius (500m &bull; Potential Overlap Inspection)</span>
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
                height="450px"
                showProximityCircle={true}
                proximityRadiusKm={0.5}
              />
            </div>

            {/* Nearby Projects List */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-800">
                Nearby Sanctioned Works within 3.0 km ({nearbyData.count})
              </h4>
              <div className="divide-y divide-slate-100 text-xs">
                {nearbyData.nearby.map((item: any) => (
                  <div key={item.project_id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gov-900">{item.project_id}</span>
                        {item.is_same_work_type && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-red-200">
                            SAME WORK TYPE
                          </span>
                        )}
                      </div>
                      <div className="text-slate-700 font-medium truncate max-w-lg mt-0.5">
                        {item.project_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-800 block">
                        {item.distance_meters}m away
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
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
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-gov-600" />
                  <span>Interactive Cross-Project Investigation Graph</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {graphData.nodes.length} Connected Nodes &bull; {graphData.edges.length} Edges
                </span>
              </div>
              <CytoscapeGraph nodes={graphData.nodes} edges={graphData.edges} height="520px" />
            </div>
          </div>
        )}

        {/* TAB 7: Evidence Dossier */}
        {activeTab === 'evidence' && (
          <EvidenceDossier evidenceItems={project.evidence_items} projectId={project.project_id} />
        )}

        {/* TAB 8: AI Assistant (RAG) */}
        {activeTab === 'assistant' && <AiChatDrawer projectId={project.project_id} />}

        {/* TAB 9: Investigator Actions & Decision Log */}
        {activeTab === 'decision' && (
          <InvestigationModal
            projectId={project.project_id}
            currentStatus={project.investigation_status}
            currentNotes={project.investigation?.notes || ''}
            onUpdate={handleInvestigationUpdate}
          />
        )}
      </div>
    </div>
  );
}
