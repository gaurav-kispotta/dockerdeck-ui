# Repeatable browser regression

This is new QA automation for DD-37, not recovery of the deleted October 26 scripts, screenshots or traces. `fixtures/synthetic-compose.yaml` is parser input only; never run it in Docker. The normal `npm test` suite remains the unit/contract regression layer.

1. In the UI root, install dependencies and run `npm test` and `npm run build`.
2. Install the isolated pinned browser driver: `npm --prefix qa install`, then `cd qa && npx playwright install chromium firefox`.
3. Keep an owned production preview alive throughout testing. From the UI root, run the canonical Core port wrapper (use its absolute path from linked worktrees):

   ```sh
   /absolute/path/dockerdeck-core/scripts/team-port run --role qa-engineer --owner ACTUAL_QA_SESSION --story DD-37 --count 1 -- npm run preview -- --host 127.0.0.1 --port '{port1}' --strictPort
   ```

4. In another terminal, substitute the allocated URL, then run `UI_BASE_URL=http://127.0.0.1:43100 npm --prefix qa test`. Repeat with `UI_BROWSER=firefox`. An existing compatible driver can be selected with `PLAYWRIGHT_MODULE=/absolute/path/playwright/index.mjs`; a cached binary can be selected with `UI_BROWSER_EXECUTABLE=/absolute/path/browser`.
5. Retain `qa/results/*.json` and PNG files (ignored), or set `UI_QA_OUTPUT` to a retained evidence directory. JSON records Git HEAD, actual browser/runtime version, per-case outcomes, page errors and blocked external origins. Independently verify the preview was built from the same SHA; the harness cannot authenticate an arbitrary server's build.
6. Stop the port wrapper with Ctrl-C after QA and verify the lease and listener are gone. Preserve the unrelated CEO board on port 6420.

The harness uses a real browser and production assets, with every external request blocked. It covers empty state, local import, rendered services/edges, neutral runtime despite Compose healthcheck, five views, resource filtering already-loaded offline re-import and malformed YAML recovery. It does not certify cold-offline loading, CDN Monaco/assets, real engine transport, Docker behavior, export, exhaustive accessibility/security/performance, WebKit, Electron or signed cross-platform releases. DD-34 already owns unnamed switch controls; their count is an inventory value rather than a new acceptance claim. API mocks and Docker daemons are not used.

## Resource identity acceptance fixture (DD-23 / UI-007)

Import `fixtures/resource-identity.yaml` through the normal file picker. It defines services, networks and volumes with the same `data` and `data.to-data_1` names, plus two mounts from `data` to the same volume. Expect six distinct resource nodes and nine edges in Architecture. DOM graph IDs use `service:`, `network:` and `volume:` prefixes, while labels remain the original keys.

Select every resource through graph cards, its Outline section and its AST section (enable AST from Settings). Confirm the inspector shows the matching kind, service ports remain on services, and network/volume names never open service details. Switch through all five diagram views and return to Architecture; original IDs and mount labels must persist. Export JSON and check six unique IDs and original `data.resourceName`/`data.resourceKind` metadata. Re-import `synthetic-compose.yaml`; no old identity fixture resource or route should remain. These are manual independent acceptance steps, distinct from the automated baseline harness above.

## Relationship semantics (DD-40.1)

Use the same graph-only identity fixture to see all four relationship types, including a dependency and inferred shared network between the same services. In light and dark themes and every edge geometry setting, confirm the persistent legend and canvas agree: rose dashed arrow to prerequisite; violet solid round membership; cyan dash-dot hollow diamonds for inferred shared network without arrows; amber double trace with square volume pads. Hover and select a node/edge; patterns and endpoint symbols must retain meaning and remain static, including Boot Order/dependency emphasis. Grayscale screenshots must retain four distinct pattern/symbol combinations. The legend says static configuration; no connection claims live traffic. The known frozen Redux edge Escape mutation is tracked for DD-40.2; this slice does not alter selection state ownership or route geometry.
