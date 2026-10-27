# Runtime presentation contract (provisional)

The web viewer displays Compose configuration without connecting to a container engine. Inspector, outline, and service nodes share `RuntimeStatus`. Missing runtime data is **Unknown**, with an engine-not-connected explanation. A Compose `healthcheck` is configuration, including when disabled; it never establishes that a service is running or healthy. Networks and volumes have no container runtime badge.

The local `RuntimeObservation` interface in `src/components/runtime/RuntimeStatus.tsx` is a presentation seam for CORE-004 to reconcile with its eventual versioned transport contract. It is not an API implementation or an assertion that CORE-004 is complete:

```json
{
  "state": "running",
  "source": "engine:local/context:example",
  "observedAt": "2026-10-26T10:00:00Z"
}
```

`state` accepts running, stopped, healthy, unhealthy, or unknown. `source` must be nonempty and identify the engine/context that observed this service. `observedAt` must be an RFC 3339 timestamp including a timezone. The shared presenter falls back to Unknown if provenance is absent or time is invalid. An observed value exposes source and time in its accessible description and tooltip. Running alone does not establish health.

A future adapter must bind each observation to the selected project's service identity, discard it on project changes or disconnect, and define expiry/reconnection behavior under CORE-004 before wiring it into these views. Compose import never supplies observations. No live engine client, polling, or daemon operations are introduced by this correction.

## Regression evidence

Run `npm test -- test/components/runtime-status.test.tsx`. The tests render the shared indicator for disconnected and sample observed states, reject incomplete provenance, and parse static Compose documents with absent/configured/disabled healthchecks before rendering inspector, outline, and service nodes. React Flow handle rendering is stubbed because it needs a browser canvas context. These checks exercise rendering and import semantics; they do not test engine connectivity.
