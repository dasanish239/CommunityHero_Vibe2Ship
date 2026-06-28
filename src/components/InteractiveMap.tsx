import React, { useState } from 'react';
import { CommunityIssue, IssueCategory, IssueStatus } from '../types';
import { MapPin, Navigation, Info, Eye, Layers, Flame } from 'lucide-react';

interface InteractiveMapProps {
  issues: CommunityIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: CommunityIssue) => void;
  isPlacingPin: boolean;
  placementCoords: { x: number; y: number } | null;
  onMapClick: (x: number, y: number) => void;
  activeCategoryFilter: string;
  activeStatusFilter: string;
}

export default function InteractiveMap({
  issues,
  selectedIssueId,
  onSelectIssue,
  isPlacingPin,
  placementCoords,
  onMapClick,
  activeCategoryFilter,
  activeStatusFilter,
}: InteractiveMapProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);

  // Filter issues based on dashboard filters
  const filteredIssues = issues.filter((issue) => {
    const matchesCategory = activeCategoryFilter === 'all' || issue.category === activeCategoryFilter;
    const matchesStatus = activeStatusFilter === 'all' || issue.status === activeStatusFilter;
    return matchesCategory && matchesStatus;
  });

  // Category Color Map
  const getCategoryColor = (category: IssueCategory) => {
    switch (category) {
      case 'Roads & Sidewalks':
        return '#ef4444'; // Red
      case 'Water & Sanitation':
        return '#3b82f6'; // Blue
      case 'Waste Management':
        return '#8b5cf6'; // Purple
      case 'Public Lighting':
        return '#f59e0b'; // Amber
      case 'Parks & Public Spaces':
        return '#10b981'; // Emerald
      default:
        return '#6b7280';
    }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    
    if (isPlacingPin || true) {
      onMapClick(x, y);
    }
  };

  // Predefined Landmarks for district atmosphere
  const landmarks = [
    { name: 'Oakhaven Park & Trails', x: 68, y: 30, r: 16, color: 'rgba(16, 185, 129, 0.15)', textX: 68, textY: 20 },
    { name: 'Community Center Plaza', x: 82, y: 56, r: 8, color: 'rgba(107, 114, 128, 0.15)', textX: 82, textY: 51 },
    { name: 'Valley High School', x: 18, y: 22, r: 10, color: 'rgba(59, 130, 246, 0.12)', textX: 18, textY: 15 },
    { name: 'District Commercial Hub', x: 28, y: 78, r: 12, color: 'rgba(245, 158, 11, 0.1)', textX: 28, textY: 72 },
  ];

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl" id="district-interactive-map-container">
      {/* Map Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 justify-between items-center pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 shadow-lg text-xs font-mono text-slate-300 flex items-center gap-2 pointer-events-auto">
          <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Evergreen Valley District</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{filteredIssues.length} pin{filteredIssues.length !== 1 && 's'} showing</span>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            id="toggle-heatmap-button"
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all shadow-md ${
              showHeatmap
                ? 'bg-red-500/20 border-red-500 text-red-300'
                : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap Overlay</span>
          </button>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <svg
        className="w-full h-full min-h-[480px] select-none cursor-crosshair transition-all"
        onClick={handleSvgClick}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        id="district-map-svg"
      >
        {/* Grids / Coordinates background */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#334155" strokeWidth="0.1" strokeOpacity="0.4" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        <rect width="100" height="100" fill="#0f172a" fillOpacity="0.6" />

        {/* The Blue River (Evergreen Creek) */}
        <path
          d="M 0 50 Q 25 40, 45 60 T 100 70"
          fill="none"
          stroke="#1e3a8a"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />
        <path
          d="M 0 50 Q 25 40, 45 60 T 100 70"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />

        {/* Landmarks Areas */}
        {landmarks.map((landmark, idx) => (
          <g key={idx}>
            <circle
              cx={landmark.x}
              cy={landmark.y}
              r={landmark.r}
              fill={landmark.color}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="0.2"
              onMouseEnter={() => setHoveredLandmark(landmark.name)}
              onMouseLeave={() => setHoveredLandmark(null)}
              className="transition-colors duration-200 cursor-help"
            />
            <text
              x={landmark.textX}
              y={landmark.textY}
              fill="#94a3b8"
              fontSize="2"
              fontWeight="600"
              textAnchor="middle"
              className="opacity-75 font-sans pointer-events-none uppercase tracking-wider"
            >
              {landmark.name}
            </text>
          </g>
        ))}

        {/* Streets network (Road Lines) */}
        {/* Maple Avenue (Horizontal Major) */}
        <line x1="0" y1="45" x2="100" y2="45" stroke="#334155" strokeWidth="1.8" strokeOpacity="0.7" />
        <line x1="0" y1="45" x2="100" y2="45" stroke="#475569" strokeWidth="0.4" strokeDasharray="1,1" strokeOpacity="0.9" />
        <text x="5" y="43" fill="#64748b" fontSize="1.8" className="font-mono uppercase">Maple Avenue</text>

        {/* Broadway Close (Vertical Major) */}
        <line x1="22" y1="0" x2="22" y2="100" stroke="#334155" strokeWidth="1.8" strokeOpacity="0.7" />
        <line x1="22" y1="0" x2="22" y2="100" stroke="#475569" strokeWidth="0.4" strokeDasharray="1,1" strokeOpacity="0.9" />
        <text x="24" y="95" fill="#64748b" fontSize="1.8" className="font-mono uppercase origin-center rotate-90">Broadway Close</text>

        {/* Oak Lane (Diagonals) */}
        <line x1="22" y1="45" x2="90" y2="0" stroke="#334155" strokeWidth="1.2" strokeOpacity="0.6" />
        <line x1="22" y1="45" x2="90" y2="0" stroke="#475569" strokeWidth="0.2" strokeDasharray="0.8,0.8" strokeOpacity="0.8" />
        <text x="55" y="21" fill="#64748b" fontSize="1.6" className="font-mono uppercase transform rotate-[-25deg]">Oak Lane</text>

        {/* Pine Crescent */}
        <path d="M 22 45 Q 60 75, 82 55" fill="none" stroke="#334155" strokeWidth="1.2" strokeOpacity="0.6" />
        <text x="45" y="65" fill="#64748b" fontSize="1.6" className="font-mono uppercase">Pine Crescent</text>

        {/* River Street */}
        <path d="M 0 53 Q 25 43, 45 63 T 100 73" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeOpacity="0.5" />

        {/* HEATMAP LAYER */}
        {showHeatmap &&
          issues
            .filter((i) => i.status !== 'Resolved')
            .map((issue) => (
              <circle
                key={`heat-${issue.id}`}
                cx={issue.x}
                cy={issue.y}
                r={issue.severity === 'critical' ? 14 : issue.severity === 'high' ? 10 : 7}
                fill="url(#heatGradient)"
                className="animate-pulse-slow"
                pointerEvents="none"
              />
            ))}

        {/* Def for Heatmap radial gradient */}
        <defs>
          <radialGradient id="heatGradient">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Placement target pin (flashing and glowing when active) */}
        {isPlacingPin && placementCoords && (
          <g>
            <circle
              cx={placementCoords.x}
              cy={placementCoords.y}
              r="4"
              fill="rgba(34, 197, 94, 0.15)"
              stroke="#22c55e"
              strokeWidth="0.2"
              className="animate-ping"
            />
            <circle cx={placementCoords.x} cy={placementCoords.y} r="0.8" fill="#22c55e" />
            <path
              d={`M ${placementCoords.x} ${placementCoords.y - 4} L ${placementCoords.x} ${placementCoords.y + 4} M ${placementCoords.x - 4} ${placementCoords.y} L ${placementCoords.x + 4} ${placementCoords.y}`}
              stroke="#22c55e"
              strokeWidth="0.2"
            />
          </g>
        )}

        {/* ISSUE PINS */}
        {filteredIssues.map((issue) => {
          const isSelected = selectedIssueId === issue.id;
          const pinColor = getCategoryColor(issue.category);
          
          return (
            <g
              key={issue.id}
              onClick={(e) => {
                e.stopPropagation(); // Prevent map coordinate selection
                onSelectIssue(issue);
              }}
              className="cursor-pointer group"
              id={`map-pin-${issue.id}`}
            >
              {/* Pulse effect for selected pin */}
              {isSelected && (
                <circle
                  cx={issue.x}
                  cy={issue.y}
                  r="5"
                  fill="none"
                  stroke={pinColor}
                  strokeWidth="0.5"
                  className="animate-ping"
                />
              )}

              {/* Glowing outer aura on hover */}
              <circle
                cx={issue.x}
                cy={issue.y}
                r={isSelected ? 2.5 : 1.8}
                fill={pinColor}
                fillOpacity={isSelected ? 0.3 : 0.15}
                stroke={pinColor}
                strokeWidth={isSelected ? 0.6 : 0.2}
                className="group-hover:scale-150 transition-transform duration-200"
              />

              {/* Core solid center node */}
              <circle
                cx={issue.x}
                cy={issue.y}
                r={isSelected ? 1.2 : 0.9}
                fill={issue.status === 'Resolved' ? '#10b981' : pinColor}
                stroke="#0f172a"
                strokeWidth="0.2"
              />

              {/* Status indicator ring inside */}
              {issue.status === 'Resolved' && (
                <circle
                  cx={issue.x}
                  cy={issue.y}
                  r="0.4"
                  fill="#ffffff"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover Landmark Guide */}
      {hoveredLandmark && (
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 pointer-events-none flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Area: <strong>{hoveredLandmark}</strong></span>
        </div>
      )}

      {/* Map Guidelines Panel */}
      <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 max-w-[200px] shadow-lg pointer-events-none">
        <div className="font-semibold mb-1 text-slate-200 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>District Map Legends</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 font-mono mt-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span>Roads</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
            <span>Water</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
            <span>Waste</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span>Lighting</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>Parks</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ffffff] border border-slate-500" />
            <span>Resolved</span>
          </div>
        </div>
        {isPlacingPin && (
          <div className="mt-2 text-emerald-400 font-medium border-t border-slate-800 pt-1.5 animate-pulse text-center">
            Click map to set hazard location!
          </div>
        )}
      </div>
    </div>
  );
}
