import { NodeProps } from '@xyflow/react';
import { useAppSelector } from '../../hooks/useReduxHooks';
import { T } from '../../styles/tokens';

export interface BootTimelineRailData {
    totalWidth: number;       // width of this node in flow units
    railHeight: number;       // height of this node in flow units
    tickPositions: number[];  // x coords of each tick, relative to node origin
    firstTick: number;        // x of the first tick (relative)
    lastTick: number;         // x of the last tick (relative)
}

/**
 * Annotation node: the horizontal timeline rail.
 * Renders a dashed rail line, coloured tick dots, and START / READY badges.
 * Spans across all boot-rank columns in flow space.
 * Non-interactive — pointer events disabled.
 */
export default function BootTimelineRailNode({ data }: NodeProps) {
    const { totalWidth, railHeight, tickPositions, firstTick, lastTick } =
        data as unknown as BootTimelineRailData;
    const isDark = useAppSelector(s => s.theme.isDark);

    const railCol = isDark ? T.line     : '#CBD0D9';
    const accent  = isDark ? T.cyan     : T.violet;
    const green   = isDark ? T.green    : '#059669';
    const midY    = railHeight / 2;

    return (
        <div style={{ pointerEvents: 'none', userSelect: 'none', width: totalWidth, height: railHeight }}>
            <svg
                width={totalWidth}
                height={railHeight}
                style={{ display: 'block', overflow: 'visible' }}
            >
                {/* Dashed rail line */}
                <line
                    x1={firstTick - 56}
                    y1={midY}
                    x2={lastTick + 56}
                    y2={midY}
                    stroke={railCol}
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                />

                {/* Tick dots at each rank */}
                {tickPositions.map((tx, i) => (
                    <circle
                        key={i}
                        cx={tx}
                        cy={midY}
                        r={5}
                        fill={i === 0 ? accent : railCol}
                        stroke={isDark ? T.bg1 : '#fff'}
                        strokeWidth={2}
                    />
                ))}

                {/* ▶ START badge */}
                <g transform={`translate(${firstTick - 66}, ${midY - 9})`}>
                    <rect width={52} height={16} rx={4} fill={accent} opacity={0.12} />
                    <text
                        x={6}
                        y={11}
                        fontSize={9}
                        fontFamily="ui-monospace,Menlo,monospace"
                        fill={accent}
                        fontWeight={700}
                        letterSpacing={0.5}
                    >
                        ▶ START
                    </text>
                </g>

                {/* ✓ READY badge */}
                <g transform={`translate(${lastTick + 14}, ${midY - 9})`}>
                    <rect width={52} height={16} rx={4} fill={green} opacity={0.12} />
                    <text
                        x={6}
                        y={11}
                        fontSize={9}
                        fontFamily="ui-monospace,Menlo,monospace"
                        fill={green}
                        fontWeight={700}
                        letterSpacing={0.5}
                    >
                        ✓ READY
                    </text>
                </g>
            </svg>
        </div>
    );
}
