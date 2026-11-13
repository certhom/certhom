import React, { useMemo, useState } from 'react';
import { WHEEL_DIMENSIONS } from '../data/wheelData';
import { DimensionScores, WheelDimensionId } from '../types';

interface RadarChartProps {
  scores: DimensionScores;
  previousScores?: DimensionScores | null;
  selectedDimensionId: WheelDimensionId;
  onSelectDimension: (id: WheelDimensionId) => void;
  showComparison: boolean;
  showTargetRing: boolean;
}

const SIZE = 520;
const CENTER = SIZE / 2;
const MAX_RADIUS = 166;
const RINGS = [2, 4, 6, 8, 10];

function polarToCartesian(angleRad: number, value: number, maxVal = 10) {
  const r = (Math.max(0, Math.min(maxVal, value)) / maxVal) * MAX_RADIUS;
  return {
    x: CENTER + r * Math.cos(angleRad),
    y: CENTER + r * Math.sin(angleRad),
  };
}

export const RadarChart: React.FC<RadarChartProps> = ({
  scores,
  previousScores,
  selectedDimensionId,
  onSelectDimension,
  showComparison,
  showTargetRing,
}) => {
  const [hoveredId, setHoveredId] = useState<WheelDimensionId | null>(null);

  const count = WHEEL_DIMENSIONS.length;

  const axes = useMemo(() => {
    return WHEEL_DIMENSIONS.map((dim, idx) => {
      const angle = (Math.PI * 2 * idx) / count - Math.PI / 2;
      const outer = polarToCartesian(angle, 10);
      const labelPos = polarToCartesian(angle, 12.1);
      const currentVal = scores[dim.id] ?? 5;
      const prevVal = previousScores ? previousScores[dim.id] ?? 5 : null;
      const point = polarToCartesian(angle, currentVal);
      const prevPoint = prevVal !== null ? polarToCartesian(angle, prevVal) : null;
      return {
        dim,
        angle,
        outer,
        labelPos,
        currentVal,
        prevVal,
        point,
        prevPoint,
      };
    });
  }, [scores, previousScores, count]);

  const currentPolygonPoints = axes
    .map((a) => `${a.point.x.toFixed(1)},${a.point.y.toFixed(1)}`)
    .join(' ');

  const previousPolygonPoints = previousScores
    ? axes
        .map((a) =>
          a.prevPoint
            ? `${a.prevPoint.x.toFixed(1)},${a.prevPoint.y.toFixed(1)}`
            : `${CENTER},${CENTER}`
        )
        .join(' ')
    : '';

  const activeDimId = hoveredId ?? selectedDimensionId;
  const activeAxis = axes.find((a) => a.dim.id === activeDimId) ?? axes[0];
  const activeDelta =
    activeAxis.prevVal !== null
      ? Number((activeAxis.currentVal - activeAxis.prevVal).toFixed(1))
      : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[520px] aspect-square">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full h-full select-none overflow-visible"
          role="img"
          aria-label="Interactive Wheel of Life radar chart"
        >
          <defs>
            <radialGradient id="sweetspotWheelFill" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#2D6A5E" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#2D6A5E" stopOpacity="0.28" />
            </radialGradient>
          </defs>

          {/* Concentric ring guides */}
          {RINGS.map((ringVal) => {
            const r = (ringVal / 10) * MAX_RADIUS;
            const isTarget = showTargetRing && ringVal === 8;
            return (
              <g key={ringVal}>
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={r}
                  fill="none"
                  stroke={isTarget ? '#4B6382' : '#DCE4E0'}
                  strokeWidth={isTarget ? 1.4 : 1}
                  strokeDasharray={isTarget ? '4 4' : undefined}
                  opacity={isTarget ? 0.65 : 0.9}
                />
                {ringVal % 2 === 0 && (
                  <text
                    x={CENTER + 5}
                    y={CENTER - r + 11}
                    className="fill-[#7D8F89] text-[10px] font-mono tabular-nums"
                  >
                    {ringVal}
                  </text>
                )}
              </g>
            );
          })}

          {/* Axis spokes */}
          {axes.map(({ dim, outer }) => {
            const isActive = dim.id === activeDimId;
            return (
              <line
                key={dim.id}
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                stroke={isActive ? '#2D6A5E' : '#DCE4E0'}
                strokeWidth={isActive ? 1.5 : 1}
                className="transition-colors duration-200"
              />
            );
          })}

          {/* Previous Snapshot Comparison Polygon */}
          {showComparison && previousScores && (
            <polygon
              points={previousPolygonPoints}
              fill="#4B6382"
              fillOpacity={0.08}
              stroke="#4B6382"
              strokeWidth={1.75}
              strokeDasharray="5 4"
              className="transition-all duration-300 ease-out"
            />
          )}

          {/* Live Current Polygon */}
          <polygon
            points={currentPolygonPoints}
            fill="url(#sweetspotWheelFill)"
            stroke="#2D6A5E"
            strokeWidth={2.25}
            strokeLinejoin="round"
            className="transition-all duration-200 ease-out"
          />

          {/* Interactive Vertex Nodes & Dimension Labels */}
          {axes.map(({ dim, labelPos, point, currentVal }) => {
            const isSelected = dim.id === selectedDimensionId;
            const isHovered = dim.id === hoveredId;
            const isHighlighted = isSelected || isHovered;

            // Text anchor alignment based on horizontal angle position
            const dx = labelPos.x - CENTER;
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (dx > 20) textAnchor = 'start';
            else if (dx < -20) textAnchor = 'end';

            return (
              <g
                key={dim.id}
                className="cursor-pointer group"
                onClick={() => onSelectDimension(dim.id)}
                onMouseEnter={() => setHoveredId(dim.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button"
                tabIndex={0}
                aria-label={`${dim.label}: ${currentVal} out of 10. Select to answer questions.`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDimension(dim.id);
                  }
                }}
              >
                {/* Invisible generous hit target around vertex */}
                <circle cx={point.x} cy={point.y} r={18} fill="transparent" />

                {/* Selection halo */}
                {isHighlighted && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={10}
                    fill="#2D6A5E"
                    fillOpacity={0.14}
                  />
                )}

                {/* Vertex point */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHighlighted ? 6.5 : 5}
                  fill={isSelected ? '#2D6A5E' : '#FFFFFF'}
                  stroke="#2D6A5E"
                  strokeWidth={2.25}
                  className="transition-all duration-150"
                />

                {/* Dimension Label + Score */}
                <text
                  x={labelPos.x}
                  y={labelPos.y - 4}
                  textAnchor={textAnchor}
                  className={`text-[12px] font-medium transition-colors duration-150 ${
                    isHighlighted ? 'fill-[#1C2825] font-semibold' : 'fill-[#4E615B]'
                  }`}
                >
                  {dim.shortLabel}
                </text>
                <text
                  x={labelPos.x}
                  y={labelPos.y + 11}
                  textAnchor={textAnchor}
                  className={`text-[11px] font-mono tabular-nums ${
                    isHighlighted ? 'fill-[#2D6A5E] font-medium' : 'fill-[#73857F]'
                  }`}
                >
                  {currentVal.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Quiet Live Focus Bar under chart */}
      <div className="w-full border-t border-[#E6ECE9] pt-4 mt-2 flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-[#647771]">
            <span>Focused Dimension</span>
            <span aria-hidden="true">·</span>
            <span>Click any spoke to jump to its questions</span>
          </div>
          <p className="mt-1 font-medium text-[#1C2825] truncate">
            {activeAxis.dim.label}
          </p>
          <p className="text-xs text-[#596C66] mt-0.5 line-clamp-1">
            {activeAxis.dim.description}
          </p>
        </div>

        <div className="flex items-baseline gap-4 shrink-0">
          <div className="text-right">
            <span className="block text-xs text-[#647771]">Current Score</span>
            <span className="text-xl font-mono font-medium tabular-nums text-[#2D6A5E]">
              {activeAxis.currentVal.toFixed(1)}
              <span className="text-xs text-[#7D8F89]">/10</span>
            </span>
          </div>
          {showComparison && activeDelta !== null && (
            <div className="text-right">
              <span className="block text-xs text-[#647771]">vs. Prior</span>
              <span
                className={`text-sm font-mono font-medium tabular-nums ${
                  activeDelta > 0
                    ? 'text-[#2D6A5E]'
                    : activeDelta < 0
                      ? 'text-[#94625A]'
                      : 'text-[#596C66]'
                }`}
              >
                {activeDelta > 0 ? `+${activeDelta.toFixed(1)}` : activeDelta.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
