import { NodeProps } from '@xyflow/react';
import { useAppSelector } from '../../hooks/useReduxHooks';
import { T } from '../../styles/tokens';

interface BootStageLabelData {
    stage: number;
    serviceCount: number;
    columnHeight: number; // px height of the services column below
}

/**
 * Canvas annotation node rendered at the top of each boot-stage column.
 * Non-interactive — pointer events disabled so it doesn't interfere with panning.
 */
export default function BootStageLabelNode({ data }: NodeProps) {
    const { stage, serviceCount, columnHeight } = data as unknown as BootStageLabelData;
    const isDark = useAppSelector(s => s.theme.isDark);

    const isFirst = stage === 0;
    const accent  = isFirst ? T.green : T.textDim;
    const bg      = isDark ? T.bg1 : T.lbg1;
    const border  = isDark ? T.line : T.lline;
    const textSub = isDark ? T.textFaint : '#A8B0BF';

    return (
        <div style={{ pointerEvents: 'none', userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Stage pill */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '6px 14px',
                background: bg,
                border: `1px solid ${isFirst ? accent : border}`,
                borderRadius: 999,
                boxShadow: isFirst ? `0 0 0 3px ${accent}22` : 'none',
                minWidth: 96,
            }}>
                <span style={{
                    fontSize: 11,
                    fontFamily: 'ui-monospace,Menlo,monospace',
                    color: accent,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                }}>
                    {isFirst ? '▶  t = 0' : `Stage ${stage}`}
                </span>
                <span style={{
                    fontSize: 10,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: textSub,
                    marginTop: 2,
                }}>
                    {isFirst ? 'Boots first' : `${serviceCount} service${serviceCount !== 1 ? 's' : ''}`}
                </span>
            </div>

            {/* Vertical dashed line connecting to service nodes below */}
            <div style={{
                width: 1,
                height: columnHeight ?? 40,
                borderLeft: `1.5px dashed ${isFirst ? accent : border}`,
                marginTop: 4,
                opacity: 0.6,
            }} />
        </div>
    );
}
