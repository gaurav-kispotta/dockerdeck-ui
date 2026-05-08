import { useNodes, useEdges, useReactFlow, Panel } from '@xyflow/react';
import { useMemo } from 'react';
import { useAppSelector } from '../../hooks/useReduxHooks';
import { T } from '../../styles/tokens';

/**
 * Computes topological rank (0-based boot stage) for each service node
 * from depends_on edges. Roots (no dependencies) = rank 0.
 */
function computeBootRanks(
  nodeIds: string[],
  depEdges: { source: string; target: string }[]
): Map<string, number> {
  // inDegree[svc] = number of services it depends on
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>(); // target -> services that depend on it

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    dependents.set(id, []);
  }

  for (const e of depEdges) {
    if (inDegree.has(e.source) && inDegree.has(e.target)) {
      // source depends on target → source's rank must be > target's rank
      inDegree.set(e.source, (inDegree.get(e.source) ?? 0) + 1);
      dependents.get(e.target)!.push(e.source);
    }
  }

  const ranks = new Map<string, number>();
  const queue: string[] = [];

  for (const id of nodeIds) {
    if ((inDegree.get(id) ?? 0) === 0) queue.push(id);
  }

  while (queue.length > 0) {
    const id = queue.shift()!;
    const r = ranks.get(id) ?? 0;
    for (const dep of dependents.get(id) ?? []) {
      const newRank = r + 1;
      if (newRank > (ranks.get(dep) ?? 0)) ranks.set(dep, newRank);
      const remaining = (inDegree.get(dep) ?? 1) - 1;
      inDegree.set(dep, remaining);
      if (remaining === 0) queue.push(dep);
    }
    if (!ranks.has(id)) ranks.set(id, 0);
  }

  // Fallback: any unranked node (cycle or isolated) gets rank 0
  for (const id of nodeIds) {
    if (!ranks.has(id)) ranks.set(id, 0);
  }

  return ranks;
}

const NODE_W = 200;
const NODE_H = 80;
const RANK_GAP = 320; // horizontal spacing between ranks
const NODE_V_GAP = 120; // vertical spacing within same rank

/**
 * Positions service nodes in a left-to-right timeline layout by boot rank.
 * Returns a map of nodeId → { x, y }.
 */
export function computeTimelinePositions(
  serviceNodeIds: string[],
  depEdges: { source: string; target: string }[]
): Map<string, { x: number; y: number }> {
  const ranks = computeBootRanks(serviceNodeIds, depEdges);

  // Group nodes by rank
  const byRank = new Map<number, string[]>();
  for (const [id, rank] of ranks) {
    if (!byRank.has(rank)) byRank.set(rank, []);
    byRank.get(rank)!.push(id);
  }

  const maxRank = Math.max(...ranks.values(), 0);
  const positions = new Map<string, { x: number; y: number }>();

  for (let r = 0; r <= maxRank; r++) {
    const group = byRank.get(r) ?? [];
    const totalH = group.length * NODE_H + (group.length - 1) * (NODE_V_GAP - NODE_H);
    const startY = -totalH / 2;

    group.forEach((id, i) => {
      positions.set(id, {
        x: r * RANK_GAP,
        y: startY + i * NODE_V_GAP,
      });
    });
  }

  return positions;
}

/** Returns the boot rank label (Step 1, Step 2, …) */
function rankLabel(rank: number): string {
  if (rank === 0) return 'Step 1  ·  boots first';
  return `Step ${rank + 1}`;
}

const LANE_PAD = 28;   // extra vertical padding for the lane band
const LANE_W   = NODE_W + 40; // width of each rank's lane column
const RAIL_Y_OFFSET = 40; // how far above the first node the rail starts

/**
 * BootTimelineOverlay renders:
 *  • A horizontal timeline rail (SVG line)
 *  • Per-rank vertical lane bands with step labels
 *  • A ▶ "START" annotation at the left
 *  • A ⏹ "READY" annotation at the right
 *
 * Uses useReactFlow().project() to convert flow coords → screen coords,
 * so it stays aligned regardless of pan/zoom.
 */
export function BootTimelineOverlay() {
  const viewMode = useAppSelector(s => s.settings.viewMode);
  const isDark   = useAppSelector(s => s.theme.isDark);
  const rfNodes  = useNodes();
  const rfEdges  = useEdges();
  const { flowToScreenPosition } = useReactFlow();

  const serviceNodes = useMemo(
    () => rfNodes.filter(n => n.data?.nodeType === 'service'),
    [rfNodes]
  );
  const depEdges = useMemo(
    () => rfEdges.filter(e => e.data?.connectionType === 'depends_on'),
    [rfEdges]
  );

  const ranks = useMemo(
    () => computeBootRanks(serviceNodes.map(n => n.id), depEdges),
    [serviceNodes, depEdges]
  );

  if (viewMode !== 'boot-order' || serviceNodes.length === 0) return null;

  const maxRank = Math.max(...ranks.values(), 0);

  // Build per-rank info: find the min/max screen Y of nodes in that rank,
  // and the screen X of the rank column
  const rankInfos = Array.from({ length: maxRank + 1 }, (_, r) => {
    const groupNodes = serviceNodes.filter(n => ranks.get(n.id) === r);
    if (groupNodes.length === 0) return null;

    const screenPositions = groupNodes.map(n => {
      const pos = n.position ?? { x: 0, y: 0 };
      return flowToScreenPosition({ x: pos.x, y: pos.y });
    });

    const minY = Math.min(...screenPositions.map(p => p.y));
    const maxY = Math.max(...screenPositions.map(p => p.y));
    // Use the representative X (first node's position)
    const screenX = screenPositions[0].x;

    return { rank: r, screenX, minY, maxY };
  }).filter(Boolean) as { rank: number; screenX: number; minY: number; maxY: number }[];

  if (rankInfos.length === 0) return null;

  const overallMinY = Math.min(...rankInfos.map(r => r.minY)) - LANE_PAD - RAIL_Y_OFFSET;
  const overallMaxY = Math.max(...rankInfos.map(r => r.maxY)) + NODE_H + LANE_PAD;
  const laneHeight  = overallMaxY - overallMinY;

  // Rail sits at overallMinY + RAIL_Y_OFFSET
  const railY = overallMinY + RAIL_Y_OFFSET;
  const firstX = rankInfos[0].screenX + NODE_W / 2;
  const lastX  = rankInfos[rankInfos.length - 1].screenX + NODE_W / 2;

  const bg      = isDark ? 'rgba(17,21,29,0.85)'  : 'rgba(246,247,249,0.88)';
  const border  = isDark ? T.line                  : T.lline;
  const text    = isDark ? T.textDim               : '#5C6577';
  const accent  = isDark ? T.cyan                  : T.violet;
  const railCol = isDark ? T.line                  : '#CBD0D9';

  return (
    <Panel position="top-left" style={{ pointerEvents: 'none', inset: 0, width: '100%', height: '100%', zIndex: 1 }}>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}
      >
        {/* Per-rank lane bands */}
        {rankInfos.map(({ rank, screenX }) => (
          <g key={rank}>
            <rect
              x={screenX - 20}
              y={overallMinY}
              width={LANE_W}
              height={laneHeight}
              rx={10}
              fill={bg}
              stroke={border}
              strokeWidth={1}
              opacity={0.7}
            />
            {/* Step label at top of lane */}
            <text
              x={screenX + NODE_W / 2}
              y={overallMinY + 18}
              textAnchor="middle"
              fontSize={10}
              fontFamily="ui-monospace,Menlo,monospace"
              fill={rank === 0 ? accent : text}
              fontWeight={rank === 0 ? 700 : 400}
            >
              {rankLabel(rank).toUpperCase()}
            </text>
          </g>
        ))}

        {/* Horizontal timeline rail */}
        <line
          x1={firstX - 60}
          y1={railY}
          x2={lastX + 60}
          y2={railY}
          stroke={railCol}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        {/* Rail tick marks at each rank */}
        {rankInfos.map(({ rank, screenX }) => (
          <g key={`tick-${rank}`}>
            <circle
              cx={screenX + NODE_W / 2}
              cy={railY}
              r={4}
              fill={rank === 0 ? accent : railCol}
              stroke={isDark ? T.bg1 : '#fff'}
              strokeWidth={1.5}
            />
          </g>
        ))}

        {/* ▶ START annotation */}
        <g transform={`translate(${firstX - 58}, ${railY - 7})`}>
          <rect x={-2} y={-1} width={46} height={16} rx={4} fill={accent} opacity={0.15} />
          <text
            fontSize={9}
            fontFamily="ui-monospace,Menlo,monospace"
            fill={accent}
            fontWeight={700}
            letterSpacing={0.5}
          >
            ▶ START
          </text>
        </g>

        {/* ⏹ READY annotation */}
        <g transform={`translate(${lastX + 16}, ${railY - 7})`}>
          <rect x={-2} y={-1} width={46} height={16} rx={4} fill={isDark ? T.green : '#059669'} opacity={0.12} />
          <text
            fontSize={9}
            fontFamily="ui-monospace,Menlo,monospace"
            fill={isDark ? T.green : '#059669'}
            fontWeight={700}
            letterSpacing={0.5}
          >
            ✓ READY
          </text>
        </g>

        {/* Vertical connector from rail tick to first node in each rank */}
        {rankInfos.map(({ rank, screenX, minY }) => (
          <line
            key={`connector-${rank}`}
            x1={screenX + NODE_W / 2}
            y1={railY}
            x2={screenX + NODE_W / 2}
            y2={minY - 4}
            stroke={rank === 0 ? accent : railCol}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.6}
          />
        ))}
      </svg>
    </Panel>
  );
}
