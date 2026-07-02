/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/* Opens the dashboard in the default browser without VS Code/Cursor, for use from a plain
 * terminal (e.g. a Claude Code session). Reuses the same loopback HTTP host built for the
 * GitHub Copilot App canvas (src/canvas/host.ts / dist/canvas-host.cjs) minus the Copilot SDK
 * bits that only make sense inside that app. */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const repoRoot = process.cwd();
const distDir = path.join(repoRoot, 'dist');
const hostCjsPath = path.join(distDir, 'canvas-host.cjs');
const appJsPath = path.join(distDir, 'webview', 'app.js');

if (!fs.existsSync(hostCjsPath) || !fs.existsSync(appJsPath)) {
  console.error('Not built yet. Run: npm install && npm run build');
  process.exit(1);
}

const { createCanvasHost } = require(hostCjsPath);
const host = createCanvasHost({ distDir, repoName: path.basename(repoRoot), hostLabel: 'Terminal' });
host.start();

const server = http.createServer((req, res) => host.handle(req, res));
server.listen(0, '127.0.0.1', () => {
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}`;
  console.log(`AI Engineer Coach dashboard: ${url}`);
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
  exec(`${opener} ${url}`, () => { /* best effort; the URL above still works if this fails */ });
});
