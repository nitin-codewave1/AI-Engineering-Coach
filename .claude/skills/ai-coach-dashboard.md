---
name: ai-coach-dashboard
description: Build (if needed) and open the AI Engineer Coach dashboard in the default browser — no VS Code or Cursor required.
when_to_use: User asks to "open the dashboard", "show my AI coaching stats", "run ai-coach-dashboard",
  or wants to view session analytics from a plain terminal / Claude Code session.
---

# AI Coach Dashboard

Opens the full dashboard (Timeline, Output, Anti-Patterns, Patterns, Coding Moments — everything
driven by on-disk session logs) in the default browser, without needing VS Code or Cursor.

It reuses the same loopback HTTP host built for the GitHub Copilot App canvas integration
([`src/canvas/host.ts`](../../src/canvas/host.ts)), minus the Copilot-SDK plumbing that only
makes sense inside that app — see [`scripts/open-dashboard.mjs`](../../scripts/open-dashboard.mjs).

## Steps

1. Build if `dist/canvas-host.cjs` or `dist/webview/app.js` don't exist yet:

   ```bash
   npm ci
   npm run build
   ```

2. Start the server and open the browser. **Run this in the background** — it's a long-lived
   HTTP server, not a one-shot command, and will hang a foreground shell:

   ```bash
   npm run dashboard
   ```

   It binds to `127.0.0.1` on a random free port, prints the URL
   (`AI Engineer Coach dashboard: http://127.0.0.1:<port>`), and opens it automatically
   (`open` on macOS, `xdg-open` on Linux, `start` on Windows). If the browser doesn't open on
   its own, use the printed URL directly.

## Limitations

Runs in the same degraded mode as the Copilot App canvas — Skill Finder, Learning Center, and
the Context Health AI review are disabled, since those need a VS Code language model
(`vscode.lm`), which doesn't exist outside an editor extension host. Everything driven by local
session logs (Dashboard, Timeline, Coding Moments, Output, Patterns, Anti-Patterns) works fully.

## Stopping

The server runs until its process is killed — Ctrl+C in its terminal, or stop the background job
you started it with.
