import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

// An external installation is optional, useful for air-gapped QA machines.
const playwright = process.env.PLAYWRIGHT_MODULE
  ? await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
  : await import('playwright');
const base = new URL(process.env.UI_BASE_URL ?? 'http://127.0.0.1:43100');
assert.equal(base.hostname, '127.0.0.1', 'Run against an owned local preview only');
const engine = process.env.UI_BROWSER ?? 'chromium';
assert.ok(['chromium', 'firefox', 'webkit'].includes(engine));
const output = resolve(process.env.UI_QA_OUTPUT ?? fileURLToPath(new URL('results/', import.meta.url)));
await mkdir(output, { recursive: true });
const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const report = { sourceSha, engine, baseUrl: base.href, node: process.version,
  startedAt: new Date().toISOString(), scope: 'Real production browser with synthetic Compose input; external network blocked; no Docker operations',
  cases: [], pageErrors: [], blockedRequests: [] };
let browser;
let page;
try {
  browser = await playwright[engine].launch({ headless: true,
    ...(process.env.UI_BROWSER_EXECUTABLE ? { executablePath: process.env.UI_BROWSER_EXECUTABLE } : {}) });
  report.browserVersion = browser.version();
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === base.origin || ['data:', 'blob:'].includes(url.protocol)) return route.continue();
    report.blockedRequests.push(url.origin);
    return route.abort();
  });
  const check = async (name, action) => {
    console.log(`RUN ${name}`);
    try { await action(); report.cases.push({ name, status: 'PASS' }); }
    catch (error) { report.cases.push({ name, status: 'FAIL', error: error.message }); throw error; }
  };
  await check('Empty canvas renders', async () => {
    await page.goto(base.href, { waitUntil: 'domcontentloaded' });
    await page.getByText('Drop a docker-compose file', { exact: true }).waitFor();
    assert.equal(await page.locator('.react-flow__node').count(), 0);
  });
  await check('Local synthetic import renders services and dependency edges', async () => {
    await page.locator('input[type=file]').setInputFiles(fileURLToPath(new URL('fixtures/synthetic-compose.yaml', import.meta.url)));
    await page.locator('.react-flow__node[data-id="web"]').waitFor();
    await page.locator('.react-flow__node[data-id="db"]').waitFor();
    await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge').length > 0);
    await page.getByRole('button', { name: /synthetic-compose.yaml/ }).waitFor();
  });
  await check('Compose healthcheck cannot fabricate runtime observations', async () => {
    await page.waitForFunction(() => document.querySelectorAll('[data-runtime-state="unknown"]').length >= 2);
    assert.equal(await page.locator('[data-runtime-state]:not([data-runtime-state="unknown"])').count(), 0);
  });
  await check('All five visualization modes retain imported services', async () => {
    for (const mode of ['ports', 'networks', 'volumes', 'boot-order', 'architecture']) {
      const index = ['boot-order', 'architecture', 'networks', 'ports', 'volumes'].indexOf(mode);
      await page.locator('.ant-segmented-item').nth(index).click();
      await page.locator('.ant-segmented-item-selected').nth(0).waitFor();
      await page.locator('.react-flow__node[data-id="web"]').waitFor();
      await page.locator('.react-flow__node[data-id="db"]').waitFor();
    }
  });
  await check('Resource filter matches and handles no results', async () => {
    const filter = page.getByPlaceholder('Filter resources…');
    await filter.fill('zzzz-no-resource');
    await page.getByText('No resources match', { exact: false }).waitFor();
    await filter.fill('web');
    await page.getByText('No resources match', { exact: false }).waitFor({ state: 'hidden' });
    await filter.fill('');
  });
  await check('Loaded application can re-import while offline', async () => {
    await page.context().setOffline(true);
    await page.locator('input[type=file]').setInputFiles([]);
    await page.locator('input[type=file]').setInputFiles(fileURLToPath(new URL('fixtures/synthetic-compose.yaml', import.meta.url)));
    await page.locator('.react-flow__node[data-id="web"]').waitFor();
    await page.context().setOffline(false);
  });
  await check('Malformed YAML produces a parsing error and allows recovery', async () => {
    await page.locator('input[type=file]').setInputFiles({ name: 'invalid.yaml', mimeType: 'text/yaml', buffer: Buffer.from('services: [unterminated') });
    const dialog = page.getByRole('dialog');
    await dialog.getByText('File Parsing Failed', { exact: true }).waitFor();
    await dialog.getByRole('button', { name: 'Dismiss', exact: true }).click();
    await page.locator('input[type=file]').setInputFiles(fileURLToPath(new URL('fixtures/synthetic-compose.yaml', import.meta.url)));
    await page.locator('.react-flow__node[data-id="web"]').waitFor();
  });
  await check('No uncaught JavaScript exceptions', async () => assert.deepEqual(report.pageErrors, []));
  // Inventory only: DD-34 already owns unnamed switch accessibility defects.
  report.unnamedSwitchCount = await page.getByRole('switch').evaluateAll(nodes => nodes.filter(n => !n.getAttribute('aria-label') && !n.getAttribute('aria-labelledby') && !n.textContent.trim()).length);
  await page.screenshot({ path: resolve(output, `${engine}.png`), fullPage: true, timeout: 10000 });
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL'; report.error = error.message; process.exitCode = 1;
  if (page) await page.screenshot({ path: resolve(output, `${engine}-failure.png`), fullPage: true, timeout: 10000 }).catch(() => {});
} finally {
  if (browser) await browser.close();
  report.finishedAt = new Date().toISOString();
  await writeFile(resolve(output, `${engine}.json`), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
