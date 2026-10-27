import { T } from '../../styles/tokens';

/** Local presentation contract pending CORE-004 transport/schema agreement.
 * Compose configuration must never populate this observation.
 * Clear the observation when its engine disconnects or the imported project changes.
 */
export interface RuntimeObservation {
  state: 'running' | 'stopped' | 'healthy' | 'unhealthy' | 'unknown';
  source: string;
  /** RFC 3339 timestamp including timezone of the engine observation. */
  observedAt: string;
}

const unknown = {
  state: 'unknown',
  label: 'Unknown',
  detail: 'Runtime unknown — engine not connected. Compose shows configuration only.',
  color: T.textDim,
};

function presentRuntime(observation?: RuntimeObservation) {
  if (!observation || !observation.source?.trim() ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(observation.observedAt) ||
      !Number.isFinite(Date.parse(observation.observedAt))) return unknown;
  const states = {
    running: { label: 'Running', color: T.green },
    healthy: { label: 'Healthy', color: T.green },
    stopped: { label: 'Stopped', color: T.textDim },
    unhealthy: { label: 'Unhealthy', color: T.rose },
    unknown: { label: 'Unknown', color: T.textDim },
  };
  const presentation = states[observation.state];
  if (!presentation) return unknown;
  return {
    ...presentation,
    state: observation.state,
    detail: `${presentation.label} — observed by ${observation.source} at ${observation.observedAt}`,
  };
}

export function RuntimeStatus({ observation, compact = false }: {
  observation?: RuntimeObservation;
  compact?: boolean;
}) {
  const status = presentRuntime(observation);
  return (
    <span title={status.detail} aria-label={status.detail} data-runtime-state={status.state}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, fontSize: 10 }}>
      <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 999, background: status.color }} />
      {!compact && <span>{status.label}</span>}
    </span>
  );
}
