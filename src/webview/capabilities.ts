/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/* Host capability detection.
 *
 * The dashboard runs in two hosts: the VS Code extension (full local agent, can
 * call the language model) and the Copilot app canvas (read-only data view, no
 * model access). Features that need the local agent are gated on `llm`. */

import { rpc } from './shared';

export interface HostCapabilities {
  host: 'vscode' | 'canvas';
  /** Actual editor product name (e.g. "VS Code", "Cursor", "Windsurf") from the extension
   *  host's `vscode.env.appName`. Used to phrase agent-dependent messaging accurately instead
   *  of assuming VS Code + GitHub Copilot, since this extension also runs unmodified in forks. */
  editorName: string;
  llm: boolean;
}

let caps: HostCapabilities = { host: 'vscode', editorName: 'VS Code', llm: true };

export async function loadCapabilities(): Promise<void> {
  try {
    const result = await rpc<Partial<HostCapabilities>>('getCapabilities');
    if (result && typeof result === 'object') {
      caps = {
        host: result.host === 'canvas' ? 'canvas' : 'vscode',
        editorName: result.editorName || 'VS Code',
        llm: result.llm !== false,
      };
    }
  } catch {
    /* keep the default full-capability profile */
  }
}

export function capabilities(): HostCapabilities {
  return caps;
}

export function llmAvailable(): boolean {
  return caps.llm;
}

/** Known forks that ship their own AI chat stack outside `vscode.lm` — worth a more specific
 *  hint than the generic fallback below. Extend as more forks come up. */
const KNOWN_FORKS_WITH_OWN_AI = new Set(['Cursor', 'Windsurf', 'Trae']);

/** Short note shown next to greyed-out, agent-dependent features. Named for the actual host
 *  editor rather than assuming VS Code + GitHub Copilot. */
export function llmUnavailableNote(): string {
  const { editorName } = caps;
  if (editorName === 'VS Code' || editorName === 'VS Code Insiders') {
    return 'Open in VS Code with the local Copilot agent to use this.';
  }
  if (KNOWN_FORKS_WITH_OWN_AI.has(editorName)) {
    return `${editorName}'s built-in AI isn't exposed through VS Code's language model API. Install/sign in to GitHub Copilot Chat inside ${editorName}, or open this workspace in VS Code, to use this.`;
  }
  return `No AI language model available in ${editorName}. Install/sign in to GitHub Copilot Chat, or open this workspace in VS Code, to use this.`;
}
