'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GraphNode, GraphEdge } from '@/lib/api';
import { ZoomIn, ZoomOut, Maximize2, Info, Layers } from 'lucide-react';

interface CytoscapeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  height?: string;
}

export default function CytoscapeGraph({
  nodes,
  edges,
  height = '520px',
}: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const cytoscape = require('cytoscape');

    // Build Cytoscape elements
    const elements: any[] = [];

    nodes.forEach((n) => {
      elements.push({
        group: 'nodes',
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          ...n.data,
        },
      });
    });

    edges.forEach((e) => {
      elements.push({
        group: 'edges',
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          type: e.type,
        },
      });
    });

    // Clean up
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#1e293b',
            'font-size': '11px',
            'font-family': 'Inter, sans-serif',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'background-color': '#94a3b8',
            'width': '36px',
            'height': '36px',
            'border-width': 2,
            'border-color': '#ffffff',
            'shadow-blur': 4,
            'shadow-color': 'rgba(0,0,0,0.15)',
          },
        },
        {
          selector: 'node[type = "subject_project"]',
          style: {
            'background-color': '#0f294a',
            'border-color': '#f59e0b',
            'border-width': 4,
            'width': '48px',
            'height': '48px',
            'font-weight': 'bold',
            'font-size': '12px',
          },
        },
        {
          selector: 'node[type = "agency"]',
          style: {
            'background-color': '#7c3aed',
            'width': '42px',
            'height': '42px',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'node[type = "location"]',
          style: {
            'background-color': '#0284c7',
            'width': '38px',
            'height': '38px',
          },
        },
        {
          selector: 'node[type = "overlapping_project"]',
          style: {
            'background-color': '#ef4444',
            'border-color': '#fee2e2',
            'border-width': 3,
            'width': '40px',
            'height': '40px',
          },
        },
        {
          selector: 'node[type = "similar_project"], node[type = "agency_sibling"]',
          style: {
            'background-color': '#3b82f6',
            'width': '36px',
            'height': '36px',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#cbd5e1',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'color': '#64748b',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.9,
            'text-background-padding': 2,
            'text-rotation': 'autorotate',
          },
        },
        {
          selector: 'edge[type = "proximity_overlap"]',
          style: {
            'line-color': '#ef4444',
            'line-style': 'dashed',
            'target-arrow-color': '#ef4444',
            'width': 3,
          },
        },
        {
          selector: 'edge[type = "semantically_similar"]',
          style: {
            'line-color': '#8b5cf6',
            'line-style': 'dotted',
            'target-arrow-color': '#8b5cf6',
            'width': 2.5,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 40,
        nodeRepulsion: 450000,
        idealEdgeLength: 100,
      },
    });

    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      setSelectedNodeData(node.data());
    });

    // Background click handler
    cy.on('tap', (evt: any) => {
      if (evt.target === cy) {
        setSelectedNodeData(null);
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [nodes, edges]);

  const handleZoomIn = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    if (cyRef.current) cyRef.current.fit();
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-50 shadow-sm">
      {/* Cytoscape canvas container */}
      <div ref={containerRef} style={{ height, width: '100%' }} />

      {/* Graph Toolbar Controls */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs z-10">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Node Inspector Floating Drawer */}
      {selectedNodeData && (
        <div className="absolute top-3 right-3 w-80 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-slate-300 shadow-lg z-10 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Info className="w-4 h-4 text-gov-600" />
              <span>Entity Inspector</span>
            </div>
            <button
              onClick={() => setSelectedNodeData(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              &times; Close
            </button>
          </div>
          <div className="text-xs space-y-1.5">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Entity ID / Label</span>
              <span className="font-mono font-bold text-slate-800">{selectedNodeData.id}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Type</span>
              <span className="font-semibold text-gov-700">{selectedNodeData.type}</span>
            </div>
            {selectedNodeData.name && (
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Name / Description</span>
                <span className="text-slate-700">{selectedNodeData.name}</span>
              </div>
            )}
            {selectedNodeData.cost && (
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Sanctioned Cost</span>
                <span className="font-mono font-bold text-slate-900">{selectedNodeData.cost}</span>
              </div>
            )}
            {selectedNodeData.priority !== undefined && (
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Priority Score</span>
                <span className="font-mono font-bold text-red-600">{selectedNodeData.priority.toFixed(1)} / 100</span>
              </div>
            )}
            {selectedNodeData.delay_rate && (
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Historical Delay Rate</span>
                <span className="font-semibold text-amber-600">{selectedNodeData.delay_rate}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Graph Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 text-[11px] shadow-xs flex items-center gap-4 text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0f294a]" />
          <span>Subject</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
          <span>Agency</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
          <span>Location</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span>Spatial Overlap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
          <span>Peers</span>
        </div>
      </div>
    </div>
  );
}
