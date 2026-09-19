import React, { useState, useMemo } from 'react';
import {
  X,
  Network,
  Search,
  Filter,
  Users,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { Person } from '../types';
import { getRelationshipHealth } from '../lib/utils';

interface NetworkGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  onSelectPerson: (person: Person) => void;
}

export const NetworkGraphModal: React.FC<NetworkGraphModalProps> = ({
  isOpen,
  onClose,
  people,
  onSelectPerson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCircle, setSelectedCircle] = useState<string>('all');
  const [selectedRelationship, setSelectedRelationship] = useState<string>('all');
  const [zoom, setZoom] = useState(1);
  const [hoveredPerson, setHoveredPerson] = useState<Person | null>(null);

  if (!isOpen) return null;

  // Filter people
  const filteredPeople = people.filter((p) => {
    if (p.isArchived) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const orgMatch = (p.organization || '').toLowerCase().includes(q);
      const roleMatch = (p.jobTitle || '').toLowerCase().includes(q);
      if (!nameMatch && !orgMatch && !roleMatch) return false;
    }
    if (selectedCircle !== 'all') {
      if (!p.circles || !p.circles.includes(selectedCircle)) return false;
    }
    if (selectedRelationship !== 'all') {
      if (p.relationshipType.toLowerCase() !== selectedRelationship.toLowerCase()) return false;
    }
    return true;
  });

  // Extract all unique circles
  const allCircles = Array.from(
    new Set(people.flatMap((p) => p.circles || []).filter(Boolean))
  );

  // Group nodes by angle for radial network graph
  const width = 800;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodes = filteredPeople.map((person, index) => {
    const total = (filteredPeople || []).length || 1;
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;

    // Radius varies slightly by relationship health / favorite
    const baseRadius = person.isFavorite ? 170 : 230;
    const x = centerX + baseRadius * Math.cos(angle);
    const y = centerY + baseRadius * Math.sin(angle);

    const health = getRelationshipHealth(person);

    return {
      person,
      x,
      y,
      health,
      angle,
    };
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl h-[90vh] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Personal Network & Relationship Graph</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {nodes.length} Nodes
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Radial visualization of circles, connections, and relationship health
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-semibold px-1 text-slate-600 dark:text-slate-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1 border-l border-slate-200 dark:border-slate-700"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search contact, company, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Circle:</span>
            <select
              value={selectedCircle}
              onChange={(e) => setSelectedCircle(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="all">All Circles</option>
              {allCircles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedRelationship}
              onChange={(e) => setSelectedRelationship(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Colleague">Colleague</option>
              <option value="Friend">Friend</option>
              <option value="Client">Client</option>
              <option value="Mentor">Mentor</option>
              <option value="Teacher">Teacher</option>
              <option value="Classmate">Classmate</option>
              <option value="Professional Contact">Professional Contact</option>
            </select>
          </div>

          {/* Legend */}
          <div className="ml-auto hidden md:flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Strong / Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Due Touchpoint
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Overdue Cadence
            </span>
          </div>
        </div>

        {/* Graph Canvas Container */}
        <div className="flex-1 relative overflow-hidden bg-radial from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full max-h-full select-none cursor-grab active:cursor-grabbing transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Background concentric orbit rings */}
            <circle
              cx={centerX}
              cy={centerY}
              r={170}
              fill="none"
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-slate-300 dark:text-slate-800"
              strokeWidth="1"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={230}
              fill="none"
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-slate-300 dark:text-slate-800"
              strokeWidth="1"
            />

            {/* Connecting Edges */}
            {nodes.map(({ person, x, y, health }) => {
              const isHovered = hoveredPerson?.id === person.id;
              const strokeColor =
                health.status === 'strong'
                  ? 'rgba(16, 185, 129, 0.45)'
                  : health.status === 'nurture'
                  ? 'rgba(245, 158, 11, 0.45)'
                  : 'rgba(244, 63, 94, 0.45)';

              return (
                <line
                  key={`edge-${person.id}`}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={isHovered ? '#6366f1' : strokeColor}
                  strokeWidth={isHovered ? 2.5 : 1.2}
                  strokeDasharray={person.isArchived ? '3 3' : undefined}
                />
              );
            })}

            {/* Center Node (You / Personal CRM Hub) */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <circle
                r={28}
                className="fill-indigo-600 dark:fill-indigo-500 shadow-xl"
              />
              <circle
                r={34}
                fill="none"
                stroke="#818cf8"
                strokeWidth={2}
                strokeDasharray="3 3"
                className="animate-spin"
                style={{ transformOrigin: '0 0', animationDuration: '20s' }}
              />
              <text
                textAnchor="middle"
                dy="4"
                fill="#ffffff"
                fontSize="11"
                fontWeight="bold"
              >
                YOU
              </text>
            </g>

            {/* Contact Nodes */}
            {nodes.map(({ person, x, y, health }) => {
              const isHovered = hoveredPerson?.id === person.id;
              const nodeRadius = person.isFavorite ? 18 : 15;

              const healthColor =
                health.status === 'strong'
                  ? '#10b981'
                  : health.status === 'nurture'
                  ? '#f59e0b'
                  : '#f43f5e';

              return (
                <g
                  key={`node-${person.id}`}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredPerson(person)}
                  onMouseLeave={() => setHoveredPerson(null)}
                  onClick={() => {
                    onSelectPerson(person);
                    onClose();
                  }}
                >
                  {/* Outer health indicator ring */}
                  <circle
                    r={nodeRadius + 4}
                    fill="none"
                    stroke={healthColor}
                    strokeWidth={isHovered ? 3 : 2}
                  />

                  {/* Inner Node Circle */}
                  <circle
                    r={nodeRadius}
                    className="fill-white dark:fill-slate-800 transition-colors"
                  />

                  {/* Initials Text */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="currentColor"
                    className="text-slate-800 dark:text-slate-100 font-bold"
                    fontSize={nodeRadius > 16 ? '10' : '9'}
                  >
                    {person.name.substring(0, 2).toUpperCase()}
                  </text>

                  {/* Contact Name Label below node */}
                  <text
                    textAnchor="middle"
                    dy={nodeRadius + 14}
                    fill="currentColor"
                    className={`font-semibold text-slate-800 dark:text-slate-200 transition-all ${
                      isHovered ? 'text-[11px] font-bold fill-indigo-600' : 'text-[9.5px]'
                    }`}
                  >
                    {(person.name || '').length > 14 ? (person.name || '').substring(0, 13) + '…' : (person.name || '')}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hovered Person Quick Popup Box */}
          {hoveredPerson && (
            <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                  {hoveredPerson.photo ? (
                    <img
                      src={hoveredPerson.photo}
                      alt={hoveredPerson.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    hoveredPerson.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {hoveredPerson.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {hoveredPerson.jobTitle || hoveredPerson.occupation || hoveredPerson.relationshipType}
                  </p>
                </div>
              </div>

              {hoveredPerson.organization && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-1.5">
                  🏢 {hoveredPerson.organization}
                </p>
              )}

              {hoveredPerson.circles && hoveredPerson.circles.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {(hoveredPerson.circles || []).map((c) => (
                    <span
                      key={c}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  onSelectPerson(hoveredPerson);
                  onClose();
                }}
                className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
              >
                Open Full Contact Profile →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
