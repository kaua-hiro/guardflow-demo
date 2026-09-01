import type { RiskTrendPoint } from "../types";

interface Props {
  points: RiskTrendPoint[];
  width?: number;
  height?: number;
}

/** Lightweight hand-rolled SVG line chart — no charting library. Plots the
 * compliance score trend over time with a gradient fill under the line. */
export default function RiskTrendChart({ points, width = 640, height = 200 }: Props) {
  if (points.length === 0) return null;

  const padX = 8;
  const padY = 14;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const minScore = 0;
  const maxScore = 100;

  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1 || 1)) * innerW;
    const y = padY + innerH - ((p.score - minScore) / (maxScore - minScore)) * innerH;
    return { x, y, ...p };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padY + innerH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Tendência do score de compliance">
      <defs>
        <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridLines.map((g) => {
        const y = padY + innerH - (g / 100) * innerH;
        return (
          <g key={g}>
            <line x1={padX} x2={width - padX} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" />
            <text x={0} y={y - 3} fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">
              {g}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#riskFill)" />
      <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />

      {coords.map((c) => (
        <g key={c.label}>
          <circle cx={c.x} cy={c.y} r="3.2" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2" />
          <text x={c.x} y={height - 1} fontSize="9.5" textAnchor="middle" fill="var(--text-faint)" fontFamily="var(--font-mono)">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
