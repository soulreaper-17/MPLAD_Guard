'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface MapMarker {
  project_id: string;
  project_name: string;
  work_type: string;
  status: string;
  agency_name: string;
  sanctioned_amount: number;
  latitude: number;
  longitude: number;
  priority_score: number;
  is_anomaly?: boolean;
}

interface LeafletMapProps {
  markers: MapMarker[];
  selectedProjectId?: string;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showProximityCircle?: boolean;
  proximityRadiusKm?: number;
}

export default function LeafletMap({
  markers,
  selectedProjectId,
  center = [25.1982, 85.5149], // Nalanda (Bihar Sharif) default center
  zoom = 12,
  height = '500px',
  showProximityCircle = false,
  proximityRadiusKm = 0.5,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically require Leaflet
    const L = require('leaflet');

    // Clean up previous instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Map
    const map = L.map(mapContainerRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add Tile Layer (OpenStreetMap CartoDB Positron clean map)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    // Selected project coordinates for circle/focus
    let selectedCoords: [number, number] | null = null;

    // Add Markers
    markers.forEach((m) => {
      const isSelected = m.project_id === selectedProjectId;
      if (isSelected) {
        selectedCoords = [m.latitude, m.longitude];
      }

      // Marker Color
      let markerColor = '#10b981'; // green
      if (m.priority_score >= 75) markerColor = '#ef4444'; // red
      else if (m.priority_score >= 45) markerColor = '#f59e0b'; // amber

      if (isSelected) markerColor = '#7c3aed'; // Purple highlight for selected

      // Custom SVG icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${markerColor};
            width: ${isSelected ? '28px' : '20px'};
            height: ${isSelected ? '28px' : '20px'};
            border-radius: 50%;
            border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'};
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${isSelected ? '11px' : '9px'};
            font-weight: bold;
            font-family: monospace;
          ">
            ${Math.round(m.priority_score)}
          </div>
        `,
        iconSize: [isSelected ? 28 : 20, isSelected ? 28 : 20],
        iconAnchor: [isSelected ? 14 : 10, isSelected ? 14 : 10],
      });

      const marker = L.marker([m.latitude, m.longitude], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 220px; font-size: 12px; line-height: 1.4;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-family: monospace; font-weight: bold; color: #1e293b;">${m.project_id}</span>
            <span style="background: ${markerColor}; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;">
              ${m.priority_score.toFixed(1)} / 100
            </span>
          </div>
          <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">${m.project_name}</div>
          <div style="color: #64748b; margin-bottom: 2px;"><strong>Type:</strong> ${m.work_type}</div>
          <div style="color: #64748b; margin-bottom: 2px;"><strong>Agency:</strong> ${m.agency_name}</div>
          <div style="color: #64748b; margin-bottom: 8px;"><strong>Cost:</strong> ₹${m.sanctioned_amount.toFixed(2)} Lakhs</div>
          <a href="/projects/${m.project_id}" onclick="window.location.href='/projects/${m.project_id}'; return false;" style="
            display: block;
            text-align: center;
            background: #0f294a;
            color: white;
            text-decoration: none;
            padding: 5px 8px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 11px;
          ">
            Open Investigation Workspace &rarr;
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // If selected coords exist, pan to it and draw radius circle
    if (selectedCoords) {
      map.setView(selectedCoords, 14);

      if (showProximityCircle) {
        L.circle(selectedCoords, {
          color: '#ef4444',
          fillColor: '#f87171',
          fillOpacity: 0.15,
          radius: proximityRadiusKm * 1000,
        }).addTo(map);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [markers, selectedProjectId, center, zoom, showProximityCircle, proximityRadiusKm]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      {/* Legend overlay */}
      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg shadow-md border border-slate-200 text-xs z-1000 space-y-1.5">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Priority Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          <span className="text-slate-700">High Priority (75–100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span className="text-slate-700">Medium Priority (45–74)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-700">Low Priority (&lt;45)</span>
        </div>
      </div>
    </div>
  );
}
