/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/* Detects which actual editor is hosting the extension, so user-facing text (error messages,
 * disabled-feature notes) can name the real host instead of assuming "VS Code" — this extension
 * also runs unmodified inside VS Code forks (Cursor, Windsurf, etc.) via `vscode.env.appName`,
 * which every fork sets to its own product name. */

import * as vscode from 'vscode';

export function hostEditorName(): string {
  const raw = vscode.env.appName;
  if (raw === 'Visual Studio Code') return 'VS Code';
  if (raw === 'Visual Studio Code - Insiders') return 'VS Code Insiders';
  return raw;
}
