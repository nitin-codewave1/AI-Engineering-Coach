<h1 align="center">AI Engineer Coach</h1>

<p align="center">
<strong>better agentic engineering.</strong><br>
Analyze your AI coding assistant usage — any harness, one dashboard.
</p>

<p align="center">
<a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
<img alt="Cursor" src="https://img.shields.io/badge/Cursor-supported-000000">
<img alt="VS Code 1.105+" src="https://img.shields.io/badge/VS%20Code-1.105%2B-007ACC">
<img alt="Claude Code" src="https://img.shields.io/badge/Claude%20Code-supported-CC785C">
</p>

<p align="center">
<strong>🎯 Runs natively in Cursor.</strong> Install the same <code>.vsix</code> in Cursor as you would VS Code — no fork-specific build, no compatibility shims. If your team is on Cursor, start at <a href="#install-in-cursor">Install in Cursor</a>.
</p>

<br>

<p align="center">
  
https://github.com/user-attachments/assets/9f0239bf-20e0-459f-b137-17cce0edd1b2

</p>

---

## What it does

AI Engineer Coach reads your local AI session logs and turns them into actionable insights — no data leaves your machine.

Runs as an extension inside **Cursor** or **VS Code**, and reads session logs from **Cursor, VS Code/Copilot, Claude Code (CLI + Desktop), Xcode Copilot Chat, Codex, OpenCode, and GitHub Copilot CLI** — mix and match tools and everything still lands in one dashboard.

- **Track progress** -- practice scores, weekly trends, daily activity charts
- **Detect anti-patterns** -- 45 rules across prompt quality, session hygiene, code review, tool mastery, and context management
- **Measure output** -- AI-generated code volume by language, workspace, model, and harness
- **Discover skills** -- find repeated prompts and turn them into reusable skills
- **Score context health** — agentic readiness checks, instruction-file audits, workspace context maps

<details>
<summary><strong>Screenshots</strong></summary>
<br>
<p align="center"><img src="assets/screen-timeline.png" alt="Timeline" width="820"></p>
<p align="center"><img src="assets/screen-output.png" alt="Code Output" width="820"></p>
<p align="center"><img src="assets/screen-consumption.png" alt="Premium Request Consumption" width="820"></p>
<p align="center"><img src="assets/screen-patterns-projects.png" alt="Activity Patterns - Projects" width="820"></p>
<p align="center"><img src="assets/screen-patterns-workhours.png" alt="Activity Patterns - Work Hours" width="820"></p>
<p align="center"><img src="assets/screen-antipatterns.png" alt="Anti-Patterns" width="820"></p>
<p align="center"><img src="assets/screen-skill-finder.png" alt="Skill Finder" width="820"></p>
<p align="center"><img src="assets/screen-context-quality.png" alt="Context Quality" width="820"></p>
<p align="center"><img src="assets/screen-context-management.png" alt="Context Management" width="820"></p>
<p align="center"><img src="assets/screen-learning.png" alt="Learning Center" width="820"></p>
<p align="center"><img src="assets/screen-achievements.png" alt="Achievements" width="820"></p>
<p align="center"><img src="assets/screen-sdlc.png" alt="Agentic SDLC" width="820"></p>
<p align="center"><img src="assets/screen-share.png" alt="Share Your Stats" width="820"></p>
</details>

---

## Installation

The extension is not published to a marketplace or Releases page, so you build the `.vsix` yourself and install it. Cursor is an Electron/VS Code fork that runs the standard extension host, so the exact same `.vsix` installs and runs unmodified in either editor — pick your host below.

### Build the `.vsix`

Prerequisites: Node.js and npm (or VS Code + Dev Containers + Docker/Podman if you'd rather not install Node locally — see [Dev Container build](#dev-container-build-no-local-nodejsnpm) below).

```bash
git clone https://github.com/microsoft/ai-engineering-coach.git
cd ai-engineering-coach
npm ci
npm run package
```

This produces `ai-engineer-coach-0.1.0.vsix` in the repo root.

### Install in Cursor

**macOS / Linux**

```bash
cursor --install-extension ai-engineer-coach-*.vsix
```

**Windows / PowerShell**

```powershell
cursor --install-extension (Get-ChildItem . -Filter 'ai-engineer-coach-*.vsix' | Select-Object -First 1).FullName
```

If `cursor` isn't on your `PATH`, open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) → **Shell Command: Install 'cursor' command in PATH** first, or install from the UI instead: Extensions panel → `...` menu → **Install from VSIX...** → select the file (or just drag the `.vsix` onto the Extensions panel).

### Install in VS Code

**macOS / Linux**

```bash
code --install-extension ai-engineer-coach-*.vsix
```

**Windows / PowerShell**

```powershell
code --install-extension (Get-ChildItem . -Filter 'ai-engineer-coach-*.vsix' | Select-Object -First 1).FullName
```

If the CLI does not work, install it from the VS Code UI: press `Ctrl+Shift+P`, type **Install from VSIX**, then browse to the `.vsix` file and select it.

### After installing (either editor)

1. Open the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run **AI Engineer Coach: Open Dashboard**
3. Navigate pages from the sidebar, filter by workspace or harness

### Run from a terminal (no Cursor or VS Code needed)

If you just want to see the dashboard — e.g. from inside a Claude Code session, or on a machine without Cursor/VS Code installed — skip the extension install entirely:

```bash
git clone https://github.com/microsoft/ai-engineering-coach.git
cd ai-engineering-coach
npm install
npm run build
npm run dashboard
```

This builds the project, starts a local server on `127.0.0.1`, and opens the full dashboard in your default browser. It reads the same on-disk session logs as the extension (nothing leaves your machine) and requires no editor. Stop it with `Ctrl+C`.

A few AI-assisted features that depend on an editor's language model (Skill Finder, Learning Center, Level Up, Context Health's AI review) aren't available in this mode — everything driven by your logs directly (Dashboard, Timeline, Coding Moments, Output, Patterns, Anti-Patterns) works the same as in the extension.

### Dev Container build (no local Node.js/npm)

Prerequisites: VS Code, the Dev Containers extension, and Docker or Podman.

1. Clone the repo and open it in VS Code.
2. Reopen in container.
3. Run `npm ci && npm run package` inside the container.
4. Copy the generated `.vsix` out and install it per [Install in Cursor](#install-in-cursor) or [Install in VS Code](#install-in-vs-code) above.

---

## Using with Claude Code

Claude Code isn't a host for this extension — it's just a data source. There's nothing to install or configure inside Claude Code itself; the dashboard reads your existing session logs straight off disk once it opens.

- **Claude Code CLI**: sessions under `~/.claude/projects/` are picked up automatically the first time you run `claude` in a project.
- **Claude Desktop app**: sessions from its built-in coding agent are scanned from the same directory tree alongside the CLI's, with no duplicate counting.

The extension itself still needs a host to run its dashboard UI — install it in [Cursor](#install-in-cursor) or [VS Code](#install-in-vs-code) above, or if you don't have either installed, [run it from a terminal](#run-from-a-terminal-no-cursor-or-vs-code-needed) instead. Either way, filter by the **Claude** harness in the sidebar to see just your Claude Code activity.

---

## Run as a canvas in the GitHub Copilot app

The same dashboard also runs as a canvas inside the GitHub Copilot app, so you do not need VS Code to use it.

A canvas is an interactive side panel in the GitHub Copilot app. Rather than replying only in chat, the agent can open a canvas to show rich, task-specific UI that you view and interact with directly while you keep working. Extensions register their own canvases, and this repo ships one named **AI Engineer Coach** under [`.github/extensions/ai-engineer-coach/`](.github/extensions/ai-engineer-coach/). It reuses the exact webview bundle from the VS Code extension and parses your local session logs in process, so nothing leaves your machine.

To open it:

1. Clone this repo and open it as a project in the GitHub Copilot app.
2. Build the project once:

```bash
npm install && npm run build
```

3. Open the **AI Engineer Coach** canvas. On a fresh clone it shows a setup card with the build command and reloads into the full dashboard once the build finishes. No manual reopen needed.

A few features depend on the local VS Code language model and are hidden in canvas mode: **Skill Finder**, **Learning Center**, the **Level Up** section, and the **Context Health** AI review. Everything driven by your on-disk logs (Dashboard, Timeline, Coding Moments, Output, Patterns, Anti-Patterns) works the same. App sessions show up as **GitHub Copilot App** and terminal sessions as **GitHub Copilot CLI** in the harness breakdown.

---

## Pages

### Observe

| Page               | Description                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Dashboard**      | Practice scores with week-over-week trends, daily activity chart, top workspace stats |
| **Timeline**       | Gantt-style session timeline with per-day drill-down and overlap detection            |
| **Coding Moments** | Screenshot gallery from AI coding sessions with story reels and workspace filtering   |

### Measure

| Page         | Description                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------- |
| **Output**   | Generated code volume by language, model usage table _(token breakdown temporarily hidden)_ |
| **Burndown** | Monthly AI token budget progress with projections _(temporarily disabled)_                  |
| **Patterns** | 7×24 activity heatmap and work-life balance signals                                         |

### Improve

| Page                | Description                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Anti-Patterns**   | Five practice score cards with severity ratings, concrete actions, and example prompts. 45 editable markdown rules plus a coverage heatmap |
| **Rule Editor**     | Create, edit, and tune detection rules visually or as raw markdown. Live-test against your data                                            |
| **Rule Playground** | Interactive REPL for the rule DSL with field browser, function catalog, and metric list                                                    |
| **Data Explorer**   | Browse session fields, view distributions, run ad-hoc filters                                                                              |
| **Skill Finder**    | Discover repeated prompt patterns and matching community skills from the open-source catalog                                               |
| **Context Health**  | Overall context score, agentic readiness checklist, workspace context map, AI-powered instruction-file review                              |

### Level Up

| Page                | Description                                                                      |
| ------------------- | -------------------------------------------------------------------------------- |
| **Learning Center** | Personalized quizzes and code-comparison rounds generated from your actual usage |
| **Achievements**    | XP-based progression with Bronze → Silver → Gold → Diamond tiers                 |
| **Agentic SDLC**    | How you use AI across the full software-development lifecycle                    |
| **Share**           | Generate a shareable stat card and export Markdown/JSON summaries               |

---

## Privacy

- **Read-only** — the extension never modifies your session files
- **Local analysis** — all parsing and analytics run entirely on your machine
- **No proprietary telemetry** — the extension does not phone home or collect usage data
- **Optional AI features** — some features (rule compiler, skill finder, context review) use the host's built-in Copilot language model API when explicitly invoked by the user. Cursor doesn't expose its own AI through that API, so these buttons stay greyed out there unless you also have GitHub Copilot Chat installed and signed in — every log-driven page (Dashboard, Timeline, Output, Patterns, Anti-Patterns, etc.) works fully either way

---

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

## License

[MIT](LICENSE)

## Disclaimer

This project is an open-source community effort by Microsoft employees. It is **not** an official Microsoft product and is not part of any Microsoft service or support offering. It is provided as-is with no warranties or guarantees.
