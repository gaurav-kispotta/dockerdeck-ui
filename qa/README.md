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
