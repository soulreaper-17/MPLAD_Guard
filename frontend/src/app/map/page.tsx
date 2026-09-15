'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import LeafletMap from '@/components/LeafletMap';
import { MapPin, Filter, Layers, RefreshCw } from 'lucide-react';

export default function MapExplorerPage() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [minPriority, setMinPriority] = useState<number | undefined>(undefined);
  const [workType, setWorkType] = useState<string>('ALL');

  const fetchMarkers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMapMarkers({
        min_priority: minPriority,
        work_type: workType !== 'ALL' ? workType : undefined,
      });
      setMarkers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load map markers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, [minPriority, workType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gov-700" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Constituency GIS Spatial Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Geospatial distribution, proximity clustering, and potential spatial duplicate detection in Nalanda.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={minPriority === 75 ? 'HIGH' : minPriority === 45 ? 'MED' : 'ALL'}
            onChange={(e) => {
              if (e.target.value === 'HIGH') setMinPriority(75);
              else if (e.target.value === 'MED') setMinPriority(45);
              else setMinPriority(undefined);
            }}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">All Priority Tiers</option>
            <option value="HIGH">High Priority Only (&ge;75)</option>
            <option value="MED">Medium & High (&ge;45)</option>
          </select>

          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">All Work Categories</option>
            <option value="PCC Road & Drainage">PCC Road & Drainage</option>
            <option value="Community Hall / Center">Community Hall / Center</option>
            <option value="Solar Street Lights Installation">Solar Street Lights</option>
            <option value="Drinking Water & RO Plant">Drinking Water & RO</option>
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {loading ? (
          <div className="h-[600px] flex flex-col items-center justify-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-gov-600" />
            <span>Rendering spatial intelligence map ({markers.length} points)...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-600 font-semibold">{error}</div>
        ) : (
          <LeafletMap
            markers={markers}
            center={[25.1982, 85.5149]}
            zoom={11}
            height="620px"
          />
        )}
      </div>
    </div>
  );
}
