import { NodeProps } from '@xyflow/react';
import { useAppSelector } from '../../../../hooks/useReduxHooks';
import { T } from '../../../../styles/tokens';

export interface BootLaneBandData {
    rank: number;
    stepLabel: string;
    width: number;
    height: number;
    isFirst: boolean;
    connectorLen: number; // px upward from top of lane to the rail tick
}

/**
 * Annotation node: the frosted column band behind each boot-rank group.
 * Renders a step label at the top and a dashed vertical connector going
 * upward toward the timeline rail.
 * Non-interactive — pointer events disabled.
 */
export default function BootLaneBandNode({ data }: NodeProps) {
    const { stepLabel, width, height, isFirst, connectorLen } = data as unknown as BootLaneBandData;
    const isDark = useAppSelector(s => s.theme.isDark);

    const bg     = isDark ? 'rgba(17,21,29,0.60)' : 'rgba(246,247,249,0.72)';
    const border = isDark ? T.line : T.lline;
    const accent = isDark ? T.cyan : T.violet;
    const text   = isDark ? T.textDim : '#5C6577';

    return (
        <div style={{ pointerEvents: 'none', userSelect: 'none', position: 'relative' }}>
            {/* Vertical dashed connector going up to the timeline rail */}
            {connectorLen > 0 && (
                <svg
                    width={2}
                    height={connectorLen}
                    style={{
                        position: 'absolute',
                        top: -connectorLen,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        overflow: 'visible',
                        pointerEvents: 'none',
                    }}
                >
                    <line
                        x1={1}
                        y1={0}
                        x2={1}
                        y2={connectorLen}
                        stroke={isFirst ? accent : (isDark ? T.line : '#CBD0D9')}
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        opacity={0.65}
                    />
                </svg>
            )}

            {/* Lane band */}
            <div style={{
                width,
                height,
                background: bg,
                border: `1px solid ${isFirst ? `${accent}55` : border}`,
                borderRadius: 14,
                position: 'relative',
                overflow: 'visible',
            }}>
                {/* Step label */}
                <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontSize: 10,
                    fontFamily: 'ui-monospace,Menlo,monospace',
                    color: isFirst ? accent : text,
                    fontWeight: isFirst ? 700 : 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                }}>
                    {stepLabel}
                </div>
            </div>
        </div>
    );
}
