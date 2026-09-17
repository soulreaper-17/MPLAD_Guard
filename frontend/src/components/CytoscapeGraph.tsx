'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GraphNode, GraphEdge } from '@/lib/api';
import { ZoomIn, ZoomOut, Maximize2, Info, Compass, RotateCcw } from 'lucide-react';

interface CytoscapeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  height?: string;
}

export default function CytoscapeGraph({
  nodes,
  edges,
  height = '540px',
}: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const cytoscape = require('cytoscape');

    // Semantic node normalization & default hierarchy construction
    const elements: any[] = [];

    nodes.forEach((n) => {
      elements.push({
        group: 'nodes',
        data: {
          id: n.id,
          label: n.label,
          type: n.type || 'project',
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
          label: e.label || (e.type === 'proximity_overlap' ? 'PROXIMITY OVERLAP' : 'IMPLEMENTED BY'),
          type: e.type || 'direct',
        },
      });
    });

    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    // 3D Light Spatial Cytoscape Canvas Theme
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#182027',
            'font-size': '10px',
            'font-family': 'JetBrains Mono, monospace',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'background-color': '#285C7A',
            'width': '38px',
            'height': '38px',
            'border-width': 3,
            'border-color': '#FFFFFF',
            'shadow-blur': 16,
            'shadow-color': 'rgba(24,32,39,0.12)',
            'shadow-offset-y': 4,
            'transition-property': 'background-color, border-color, width, height, opacity, transform',
            'transition-duration': 300,
          },
        },
        /* PROJECT — Central Primary 3D Ceramic Node */
        {
          selector: 'node[type = "subject_project"], node[type = "project"]',
          style: {
            'background-color': '#173F58',
            'border-color': '#C88A25',
            'border-width': 5,
            'width': '52px',
            'height': '52px',
            'color': '#182027',
            'font-size': '12px',
            'shadow-color': 'rgba(200,138,37,0.3)',
            'shadow-blur': 22,
          },
        },
        /* AGENCY — Rounded Institutional Node */
        {
          selector: 'node[type = "agency"]',
          style: {
            'background-color': '#285C7A',
            'border-color': '#94C0E6',
            'border-width': 3.5,
            'width': '44px',
            'height': '44px',
          },
        },
        /* CONTRACTOR — Precision Node */
        {
          selector: 'node[type = "contractor"], node[type = "agency_sibling"]',
          style: {
            'background-color': '#173F58',
            'border-color': '#FFFFFF',
            'border-width': 3,
            'width': '38px',
            'height': '38px',
          },
        },
        /* LOCATION — Geographic Node */
        {
          selector: 'node[type = "location"]',
          style: {
            'background-color': '#398265',
            'border-color': '#FFFFFF',
            'border-width': 3,
            'width': '40px',
            'height': '40px',
          },
        },
        /* FUND — Financial Circular Node */
        {
          selector: 'node[type = "fund"]',
          style: {
            'background-color': '#C88A25',
            'border-color': '#FFFFFF',
            'border-width': 3,
            'width': '38px',
            'height': '38px',
          },
        },
        /* RISK SIGNAL — Analytical Red Node */
        {
          selector: 'node[type = "risk_signal"], node[type = "overlapping_project"]',
          style: {
            'background-color': '#C45145',
            'border-color': '#FFFFFF',
            'border-width': 4,
            'width': '44px',
            'height': '44px',
            'shadow-color': 'rgba(196,81,69,0.3)',
          },
        },
        /* SPATIAL EDGE CONNECTIONS */
        {
          selector: 'edge',
          style: {
            'width': 2.5,
            'line-color': '#C3DAF0',
            'target-arrow-color': '#285C7A',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.9,
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8.5px',
            'font-family': 'JetBrains Mono, monospace',
            'font-weight': 'bold',
            'color': '#667078',
            'text-background-color': '#FFFFFF',
            'text-background-opacity': 0.95,
            'text-background-padding': 3,
            'text-rotation': 'autorotate',
            'opacity': 0.85,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': 300,
          },
        },
        {
          selector: 'edge[type = "proximity_overlap"]',
          style: {
            'line-color': '#C45145',
            'line-style': 'dashed',
            'target-arrow-color': '#C45145',
            'width': 3,
          },
        },
        {
          selector: 'edge[type = "semantically_similar"]',
          style: {
            'line-color': '#C88A25',
            'line-style': 'dotted',
            'target-arrow-color': '#C88A25',
            'width': 2.5,
          },
        },
        /* SELECTED & FOCUSED STATES */
        {
          selector: 'node:selected',
          style: {
            'border-color': '#C88A25',
            'border-width': 6,
            'shadow-blur': 30,
            'shadow-color': 'rgba(200,138,37,0.4)',
          },
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.25,
          },
        },
        {
          selector: '.highlighted-edge',
          style: {
            'line-color': '#285C7A',
            'width': 4,
            'opacity': 1,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 500,
        padding: 50,
        nodeRepulsion: 550000,
        idealEdgeLength: 110,
      },
    });

    cyRef.current = cy;

    // Camera Focus & Node Highlight Interaction
    cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      const connectedEdges = node.connectedEdges();
      const connectedNodes = connectedEdges.connectedNodes();

      // Dim non-connected elements
      cy.elements().addClass('dimmed');
      node.removeClass('dimmed');
      connectedNodes.removeClass('dimmed');
      connectedEdges.removeClass('dimmed').addClass('highlighted-edge');

      // Smooth 3D camera move toward node
      cy.animate(
        {
          center: node.position(),
          zoom: Math.min(cy.zoom() * 1.35, 1.8),
        },
        { duration: 400, easing: 'ease-out-cubic' }
      );

      setSelectedNodeData(node.data());
    });

    // Clear focus on background tap
    cy.on('tap', (evt: any) => {
      if (evt.target === cy) {
        cy.elements().removeClass('dimmed').removeClass('highlighted-edge');
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

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.elements().removeClass('dimmed').removeClass('highlighted-edge');
      cyRef.current.fit();
      setSelectedNodeData(null);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#E4E7E1] bg-[#ECEFEA] shadow-[0_18px_45px_rgba(40,50,55,0.06)]">
      {/* Cytoscape canvas container */}
      <div ref={containerRef} style={{ height, width: '100%' }} />

      {/* Graph Spatial Controls Toolbar */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-[#E4E7E1] shadow-md z-10 font-mono">
        <button
          onClick={handleZoomIn}
          className="tactile-light-switch p-1.5 rounded-full text-[#182027]"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="tactile-light-switch p-1.5 rounded-full text-[#182027]"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="tactile-light-switch p-1.5 rounded-full text-[#182027]"
          title="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Node Inspector Floating Drawer */}
      {selectedNodeData && (
        <div className="absolute top-4 right-4 w-80 floating-slab p-5 z-10 space-y-3 font-mono animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#E4E7E1] pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#285C7A]">
              <Info className="w-4 h-4" />
              <span>SPATIAL ENTITY INSPECTOR</span>
            </div>
            <button
              onClick={() => {
                if (cyRef.current) cyRef.current.elements().removeClass('dimmed').removeClass('highlighted-edge');
                setSelectedNodeData(null);
              }}
              className="text-xs text-[#667078] hover:text-[#182027]"
            >
              [CLOSE]
            </button>
          </div>
          <div className="text-xs space-y-2 text-[#182027]">
            <div>
              <span className="text-[#667078] text-[9px] uppercase font-bold block">ENTITY IDENTIFIER</span>
              <span className="font-bold text-[#285C7A] text-sm">{selectedNodeData.id}</span>
            </div>
            <div>
              <span className="text-[#667078] text-[9px] uppercase font-bold block">SEMANTIC CLASS</span>
              <span className="font-semibold text-[#173F58] uppercase">{selectedNodeData.type}</span>
            </div>
            {selectedNodeData.name && (
              <div>
                <span className="text-[#667078] text-[9px] uppercase font-bold block">LABEL / TITLE</span>
                <span className="text-[#182027] font-sans">{selectedNodeData.name}</span>
              </div>
            )}
            {selectedNodeData.cost && (
              <div>
                <span className="text-[#667078] text-[9px] uppercase font-bold block">FINANCIAL OUTLAY</span>
                <span className="font-bold text-[#182027]">{selectedNodeData.cost}</span>
              </div>
            )}
            {selectedNodeData.priority !== undefined && (
              <div>
                <span className="text-[#667078] text-[9px] uppercase font-bold block">RISK SCORE</span>
                <span className="font-bold text-[#C45145]">{selectedNodeData.priority.toFixed(1)} / 100</span>
              </div>
            )}
            {selectedNodeData.delay_rate && (
              <div>
                <span className="text-[#667078] text-[9px] uppercase font-bold block">HISTORICAL DELAY</span>
                <span className="font-semibold text-[#C88A25]">{selectedNodeData.delay_rate}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D Semantic Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-[#E4E7E1] text-[10px] font-mono shadow-md flex items-center gap-4 text-[#182027]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#173F58] border-2 border-[#C88A25]" />
          <span>PROJECT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#285C7A] border-2 border-[#94C0E6]" />
          <span>AGENCY</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#398265] border-2 border-white" />
          <span>LOCATION</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#C88A25] border-2 border-white" />
          <span>FUND</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#C45145] border-2 border-white" />
          <span>RISK SIGNAL</span>
        </div>
      </div>
    </div>
  );
}

