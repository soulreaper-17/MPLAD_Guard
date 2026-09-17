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

function isValidCoordinate(lat?: number | null, lng?: number | null): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

export default function LeafletMap({
  markers,
  selectedProjectId,
  center = [25.1982, 85.5149],
  zoom = 13,
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
    const initialCenter: [number, number] = isValidCoordinate(center[0], center[1])
      ? center
      : [25.1982, 85.5149];
    const map = L.map(mapContainerRef.current).setView(initialCenter, zoom);
    mapInstanceRef.current = map;

    // Add Clean CartoDB Light Voyager Tile Layer with API Key
    L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_3p48_1_3c3f3e16876bb7baeb042d83', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    let selectedCoords: [number, number] | null = null;
    const validMarkers: MapMarker[] = [];

    // Add Markers (WGS84 [latitude, longitude])
    markers.forEach((m) => {
      if (!isValidCoordinate(m.latitude, m.longitude)) return;
      validMarkers.push(m);

      const isSelected = m.project_id === selectedProjectId;
      if (isSelected) {
        selectedCoords = [m.latitude, m.longitude];
      }

      // Marker Colors for Light Spatial Theme
      let markerColor = '#398265'; // emerald
      let glowColor = 'rgba(57,130,101,0.3)';
      if (m.priority_score >= 75) {
        markerColor = '#C45145'; // red
        glowColor = 'rgba(196,81,69,0.4)';
      } else if (m.priority_score >= 45) {
        markerColor = '#C88A25'; // saffron
        glowColor = 'rgba(200,138,37,0.35)';
      }

      if (isSelected) {
        markerColor = '#285C7A'; // Institutional Blue highlight
        glowColor = 'rgba(40,92,122,0.6)';
      }

      // Custom SVG icon with soft daylight pin shadow
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${markerColor};
            width: ${isSelected ? '32px' : '24px'};
            height: ${isSelected ? '32px' : '24px'};
            border-radius: 50%;
            border: ${isSelected ? '3px solid #FFFFFF' : '2px solid #FFFFFF'};
            box-shadow: 0 0 16px ${glowColor}, 0 6px 12px rgba(24,32,39,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-size: ${isSelected ? '12px' : '10px'};
            font-weight: 900;
            font-family: monospace;
          ">
            ${Math.round(m.priority_score)}
          </div>
        `,
        iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
        iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
      });

      const marker = L.marker([m.latitude, m.longitude], { icon: customIcon }).addTo(map);

      // Popup Content formatted with clean light spatial card theme
      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 230px; font-size: 12px; line-height: 1.4; background: #FFFFFF; color: #182027; padding: 14px; border-radius: 12px; border: 1px solid #E4E7E1; box-shadow: 0 18px 45px rgba(40,50,55,0.12);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-family: monospace;">
            <span style="font-weight: bold; color: #285C7A;">${m.project_id}</span>
            <span style="background: ${markerColor}; color: #FFFFFF; padding: 2px 8px; border-radius: 9999px; font-weight: 900; font-size: 11px;">
              ${m.priority_score.toFixed(1)} / 100
            </span>
          </div>
          <div style="font-weight: font-bold; color: #182027; margin-bottom: 6px; font-size: 12px; line-height: 1.3;">${m.project_name}</div>
          <div style="color: #667078; font-size: 11px; margin-bottom: 2px;"><strong>Type:</strong> ${m.work_type}</div>
          <div style="color: #667078; font-size: 11px; margin-bottom: 2px;"><strong>Agency:</strong> ${m.agency_name}</div>
          <div style="color: #667078; font-size: 11px; margin-bottom: 12px;"><strong>Cost:</strong> ₹${m.sanctioned_amount.toFixed(2)} Lakhs</div>
          <a href="/projects/${m.project_id}" onclick="window.location.href='/projects/${m.project_id}'; return false;" style="
            display: block;
            text-align: center;
            background: #173F58;
            color: #FFFFFF;
            text-decoration: none;
            padding: 7px 12px;
            border-radius: 8px;
            font-weight: bold;
            font-family: monospace;
            font-size: 11px;
            box-shadow: 0 4px 12px rgba(23,63,88,0.25);
          ">
            OPEN CASE DOSSIER &rarr;
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
      map.setView(selectedCoords, zoom || 14);

      if (showProximityCircle) {
        L.circle(selectedCoords, {
          color: '#C45145',
          fillColor: '#C45145',
          fillOpacity: 0.12,
          radius: proximityRadiusKm * 1000,
        }).addTo(map);
      }
    } else if (validMarkers.length > 0) {
      const bounds = L.latLngBounds(validMarkers.map((m: any) => [m.latitude, m.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
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
    <div className="relative rounded-2xl overflow-hidden border border-[#E4E7E1] shadow-[0_18px_45px_rgba(40,50,55,0.08)] bg-[#ECEFEA]">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      {/* Map Legend overlay */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#E4E7E1] text-xs font-mono z-[1000] space-y-2 shadow-lg">
        <div className="text-[10px] font-bold text-[#667078] uppercase tracking-wider">Priority Pin Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#C45145] inline-block shadow-xs" />
          <span className="text-[#182027]">High Priority (75–100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#C88A25] inline-block shadow-xs" />
          <span className="text-[#182027]">Medium Priority (45–74)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#398265] inline-block shadow-xs" />
          <span className="text-[#182027]">Low Priority (&lt;45)</span>
        </div>
      </div>
    </div>
  );
}
