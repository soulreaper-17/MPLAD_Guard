'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ProjectSummary } from '@/lib/api';
import { formatCurrency, getStatusBadge, getInvestigationStatusBadge } from '@/lib/utils';
import RiskBadge from '@/components/RiskBadge';
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

export default function InvestigationQueuePage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // ALL, HIGH, MEDIUM, LOW
  const [workTypeFilter, setWorkTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('priority_score');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      let min_p: number | undefined = undefined;
      let max_p: number | undefined = undefined;

      if (priorityFilter === 'HIGH') min_p = 75;
      else if (priorityFilter === 'MEDIUM') {
        min_p = 45;
        max_p = 74.9;
      } else if (priorityFilter === 'LOW') {
        max_p = 44.9;
      }

      const data = await api.getProjects({
        search: search.trim() || undefined,
        work_type: workTypeFilter !== 'ALL' ? workTypeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        min_priority: min_p,
        max_priority: max_p,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch investigation queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [priorityFilter, workTypeFilter, statusFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-gov-700" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Prioritized Investigation Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Projects dynamically ranked from 0–100 based on multi-dimensional risk signals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProjects}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, project name, agency..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-gov-600 focus:outline-hidden"
            />
          </form>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-gov-600 focus:outline-hidden"
          >
            <option value="ALL">All Priority Tiers</option>
            <option value="HIGH">High Priority (Score &ge; 75)</option>
            <option value="MEDIUM">Medium Priority (45–74)</option>
            <option value="LOW">Low Priority (&lt; 45)</option>
          </select>

          {/* Work Type Filter */}
          <select
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-gov-600 focus:outline-hidden"
          >
            <option value="ALL">All Work Categories</option>
            <option value="PCC Road & Drainage">PCC Road & Drainage</option>
            <option value="Community Hall / Center">Community Hall / Center</option>
            <option value="Solar Street Lights Installation">Solar Street Lights</option>
            <option value="High School Science Lab & Classrooms">School Classrooms / Labs</option>
            <option value="Drinking Water & RO Plant">Drinking Water & RO</option>
            <option value="Primary Health Center Upgrade">Health Center Upgrade</option>
            <option value="Rural Culvert & Small Bridge">Culverts & Bridges</option>
            <option value="Anganwadi Center Building">Anganwadi Buildings</option>
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('_');
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-gov-600 focus:outline-hidden"
          >
            <option value="priority_score_desc">Priority Score: High to Low</option>
            <option value="priority_score_asc">Priority Score: Low to High</option>
            <option value="sanctioned_amount_desc">Cost: Highest First</option>
            <option value="sanctioned_amount_asc">Cost: Lowest First</option>
            <option value="sanction_date_desc">Sanction: Newest First</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gov-600 mb-2" />
            <span>Loading investigation queue...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-600 font-semibold">{error}</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No projects matched the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Investigation Priority</th>
                  <th className="px-4 py-3">Project ID & Name</th>
                  <th className="px-4 py-3">Work Type</th>
                  <th className="px-4 py-3">Implementing Agency</th>
                  <th className="px-4 py-3 text-right">Sanctioned Cost</th>
                  <th className="px-4 py-3 text-right">Expenditure</th>
                  <th className="px-4 py-3 text-center">Inv. Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((proj) => {
                  const invBadge = getInvestigationStatusBadge(proj.investigation_status);
                  const isGolden = proj.project_id === 'MPLAD-NAL-2023-042';
                  return (
                    <tr
                      key={proj.project_id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isGolden ? 'bg-amber-50/60 font-medium' : ''
                      }`}
                    >
                      <td className="px-4 py-3 shrink-0">
                        <RiskBadge
                          score={proj.priority_score}
                          isAnomaly={proj.is_anomaly}
                          size="sm"
                          showLabel={false}
                        />
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/projects/${proj.project_id}`}
                            className="font-mono font-bold text-gov-800 hover:underline hover:text-gov-900"
                          >
                            {proj.project_id}
                          </Link>
                          {isGolden && (
                            <span className="bg-amber-400 text-slate-950 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded">
                              DEMO CASE
                            </span>
                          )}
                        </div>
                        <div className="text-slate-700 font-medium truncate mt-0.5" title={proj.project_name}>
                          {proj.project_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {proj.work_type}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={proj.agency_name}>
                        {proj.agency_name}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(proj.sanctioned_amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {formatCurrency(proj.expenditure)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${invBadge.bg}`}>
                          {invBadge.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/projects/${proj.project_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gov-900 hover:bg-gov-800 text-white rounded text-[11px] font-semibold transition shadow-2xs"
                        >
                          <span>Investigate</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
