import { NodeProps } from '@xyflow/react';
import { useAppSelector } from '../../../../hooks/useReduxHooks';
import { T } from '../../../../styles/tokens';

export type LayerType = 'network' | 'service' | 'volume';

export interface LayeredGroupBandData {
    layerType: LayerType;
    width: number;
    height: number;
}

const LAYER_META: Record<LayerType, { label: string; icon: string; darkAccent: string; lightAccent: string }> = {
    network: { label: 'NETWORKS', icon: '⬡', darkAccent: T.violet,  lightAccent: '#7C3AED' },
    service: { label: 'SERVICES', icon: '⬢', darkAccent: T.cyan,    lightAccent: '#0891B2' },
    volume:  { label: 'VOLUMES',  icon: '▣', darkAccent: T.rose,    lightAccent: '#BE185D' },
};

/**
 * Annotation node: a horizontal frosted band that frames all nodes of
 * a single layer type (network / service / volume) in the Layered view.
 * Non-interactive — pointer events disabled.
 */
export default function LayeredGroupBandNode({ data }: NodeProps) {
    const { layerType, width, height } = data as unknown as LayeredGroupBandData;
    const isDark = useAppSelector(s => s.theme.isDark);

    const meta   = LAYER_META[layerType] ?? LAYER_META.service;
    const accent = isDark ? meta.darkAccent : meta.lightAccent;
    const bg     = isDark ? `${accent}0D` : `${accent}08`;   // ~5% tint
    const border = `${accent}33`;                             // ~20% border

    return (
        <div style={{ pointerEvents: 'none', userSelect: 'none', width, height }}>
            {/* Band background */}
            <div style={{
                width,
                height,
                background: bg,
                border: `1.5px solid ${border}`,
                borderRadius: 16,
                position: 'relative',
                boxSizing: 'border-box',
            }}>
                {/* Label badge at top-left */}
                <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: `${accent}1A`,
                    border: `1px solid ${border}`,
                    borderRadius: 6,
                    padding: '3px 9px',
                    pointerEvents: 'none',
                }}>
                    <span style={{ fontSize: 11, lineHeight: 1 }}>{meta.icon}</span>
                    <span style={{
                        fontSize: 9,
                        fontFamily: 'ui-monospace, Menlo, monospace',
                        color: accent,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                    }}>
                        {meta.label}
                    </span>
                </div>
            </div>
        </div>
    );
}
