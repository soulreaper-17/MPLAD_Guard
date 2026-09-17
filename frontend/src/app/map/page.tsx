'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import LeafletMap from '@/components/LeafletMap';
import { MapPin, RefreshCw } from 'lucide-react';

export default function MapExplorerPage() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [minPriority, setMinPriority] = useState<number | undefined>(undefined);
  const [workType, setWorkType] = useState<string>('ALL');

  const [constituencyName, setConstituencyName] = useState<string>('Nalanda Lok Sabha Constituency');

  const updateConstituencyTitle = () => {
    try {
      const saved = localStorage.getItem('selected_constituency');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          setConstituencyName(parsed.name);
        }
      }
    } catch (e) {}
  };

  const fetchMarkers = async () => {
    setLoading(true);
    setError('');
    updateConstituencyTitle();
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

    const handleConstituencyChange = () => {
      fetchMarkers();
    };
    window.addEventListener('constituency-changed', handleConstituencyChange);
    return () => {
      window.removeEventListener('constituency-changed', handleConstituencyChange);
    };
  }, [minPriority, workType]);

  const mapCenter: [number, number] =
    markers.length > 0
      ? [
          markers.reduce((sum, m) => sum + m.latitude, 0) / markers.length,
          markers.reduce((sum, m) => sum + m.longitude, 0) / markers.length,
        ]
      : [25.1982, 85.5149];

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="floating-slab p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-[#285C7A]" />
            <h1 className="text-lg font-black text-[#182027] tracking-wider uppercase">
              3D GEOSPATIAL SPATIAL TERRAIN TABLE &bull; {constituencyName}
            </h1>
          </div>
          <p className="text-xs text-[#667078] font-sans mt-1">
            Spatial distribution, proximity clustering, and duplicate asset detection across constituency infrastructure works.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={minPriority === 75 ? 'HIGH' : minPriority === 45 ? 'MED' : 'ALL'}
            onChange={(e) => {
              if (e.target.value === 'HIGH') setMinPriority(75);
              else if (e.target.value === 'MED') setMinPriority(45);
              else setMinPriority(undefined);
            }}
            className="bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl px-4 py-2 text-xs font-bold text-[#285C7A] focus:outline-hidden"
          >
            <option value="ALL">All Priority Tiers</option>
            <option value="HIGH">High Priority Only (&ge;75)</option>
            <option value="MED">Medium &amp; High (&ge;45)</option>
          </select>

          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl px-4 py-2 text-xs font-bold text-[#182027] focus:outline-hidden"
          >
            <option value="ALL">All Work Categories</option>
            <option value="PCC Road & Drainage">PCC Road &amp; Drainage</option>
            <option value="Community Hall / Center">Community Hall / Center</option>
            <option value="Solar Street Lights Installation">Solar Street Lights</option>
            <option value="Drinking Water & RO Plant">Drinking Water &amp; RO</option>
          </select>
        </div>
      </div>

      {/* Map Platform */}
      <div className="floating-slab p-5 space-y-4">
        {loading ? (
          <div className="h-[640px] flex flex-col items-center justify-center text-xs text-[#667078] space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#285C7A]" />
            <span>RENDERING SPATIAL TERRAIN MODEL ({markers.length} POINTS)...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-[#C45145] font-bold">{error}</div>
        ) : (
          <LeafletMap
            markers={markers}
            center={mapCenter}
            zoom={11}
            height="650px"
          />
        )}
      </div>
    </div>
  );
}
