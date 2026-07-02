/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/* Cursor chat/composer session parser.
 *
 * Cursor (a VS Code fork) does not use VS Code's native `chatSessions` JSONL files — it has its
 * own chat/composer UI backed by two SQLite databases (schema reverse-engineered against a real
 * install, not documented by Cursor; may drift across versions):
 *
 *   ~/Library/Application Support/Cursor/User/workspaceStorage/<hash>/
 *     workspace.json          -- { folder: "file://..." }, same shape as VS Code's
 *     state.vscdb ItemTable['composer.composerData']
 *                              -- { allComposers: [{ composerId, name, createdAt,
 *                                   lastUpdatedAt, subtitle, isArchived, ... }] }
 *                                 links a composer (= one chat/agent session) to this workspace.
 *
 *   ~/Library/Application Support/Cursor/User/globalStorage/state.vscdb
 *     table cursorDiskKV(key TEXT UNIQUE, value BLOB), all values JSON:
 *       composerData:<composerId>          -- { fullConversationHeadersOnly: [{bubbleId, type}] }
 *                                              type 1 = user, 2 = assistant, in order.
 *       bubbleId:<composerId>:<bubbleId>   -- { type, text, ... } one message.
 *
 * No per-message timestamp exists anywhere in this schema — only composer-level
 * createdAt/lastUpdatedAt. Session-level dates use those; individual requests carry no
 * timestamp (same convention the other parsers use for genuinely missing data).
 */

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import { Session, SessionRequest } from './types';
import { assertTrustedPath, createRequest, createSession } from './parser-shared';
import { parseWorkspaceFolderPath, parseWorkspaceName } from './parser-vscode-files';
import { warnCore } from './log';

export function findCursorDirs(): string[] {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (!home) return [];

  let userDir: string;
  if (process.platform === 'darwin') {
    userDir = path.join(home, 'Library', 'Application Support', 'Cursor', 'User');
  } else if (process.platform === 'win32') {
    userDir = path.join(process.env.APPDATA || '', 'Cursor', 'User');
  } else {
    userDir = path.join(home, '.config', 'Cursor', 'User');
  }

  return fs.existsSync(userDir) ? [userDir] : [];
}

interface CursorComposerHeader {
  composerId: string;
  name?: string;
  subtitle?: string;
  createdAt?: number;
  lastUpdatedAt?: number;
  isArchived?: boolean;
}

interface CursorBubbleHeader {
  bubbleId: string;
  type: number;
}

interface CursorComposerData {
  fullConversationHeadersOnly?: CursorBubbleHeader[];
}

interface CursorBubble {
  type: number;
  text?: string;
}

function openReadOnly(dbPath: string): Database.Database | null {
  try {
    assertTrustedPath(dbPath);
    return new Database(dbPath, { readonly: true, fileMustExist: true });
  } catch (e) {
    warnCore('parser-cursor', `Cannot open ${dbPath}`, e);
    return null;
  }
}

function getItemTableJson<T>(db: Database.Database, key: string): T | null {
  try {
    const row = db.prepare('SELECT value FROM ItemTable WHERE key = ?').get(key) as { value?: string } | undefined;
    return row?.value ? (JSON.parse(row.value) as T) : null;
  } catch {
    return null;
  }
}

function getDiskKVJson<T>(db: Database.Database, key: string): T | null {
  try {
    const row = db.prepare('SELECT value FROM cursorDiskKV WHERE key = ?').get(key) as { value?: Buffer | string } | undefined;
    if (!row?.value) return null;
    const text = Buffer.isBuffer(row.value) ? row.value.toString('utf-8') : row.value;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Pairs consecutive user->assistant bubbles into requests, mirroring the OpenCode parser's
 *  approach. All assistant text between one user bubble and the next is folded into a single
 *  response (a composer turn can involve several tool-driven assistant bubbles in a row). */
function buildComposerRequests(composerId: string, globalDb: Database.Database): SessionRequest[] {
  const data = getDiskKVJson<CursorComposerData>(globalDb, `composerData:${composerId}`);
  const headers = data?.fullConversationHeadersOnly || [];
  const requests: SessionRequest[] = [];

  let pendingUserText: string | null = null;
  let assistantChunks: string[] = [];

  const flush = () => {
    if (pendingUserText == null) return;
    requests.push(createRequest({
      requestId: `${composerId}-${requests.length}`,
      timestamp: null,
      messageText: pendingUserText,
      responseText: assistantChunks.join('\n'),
      agentName: 'Cursor',
      agentMode: 'agent',
    }));
    pendingUserText = null;
    assistantChunks = [];
  };

  for (const h of headers) {
    const bubble = getDiskKVJson<CursorBubble>(globalDb, `bubbleId:${composerId}:${h.bubbleId}`);
    if (!bubble?.text) continue;
    if (h.type === 1) {
      flush();
      pendingUserText = bubble.text;
    } else if (h.type === 2 && pendingUserText != null) {
      assistantChunks.push(bubble.text);
    }
  }
  flush();

  return requests;
}

function parseCursorWorkspace(workspaceDir: string, globalDb: Database.Database): Session[] {
  const wsJsonPath = path.join(workspaceDir, 'workspace.json');
  const dbPath = path.join(workspaceDir, 'state.vscdb');
  if (!fs.existsSync(wsJsonPath) || !fs.existsSync(dbPath)) return [];

  const wsDb = openReadOnly(dbPath);
  if (!wsDb) return [];

  try {
    const composerData = getItemTableJson<{ allComposers?: CursorComposerHeader[] }>(wsDb, 'composer.composerData');
    const headers = composerData?.allComposers || [];
    if (headers.length === 0) return [];

    const workspaceId = path.basename(workspaceDir);
    const workspaceName = parseWorkspaceName(wsJsonPath);
    const workspaceRootPath = parseWorkspaceFolderPath(wsJsonPath) ?? undefined;

    const sessions: Session[] = [];
    for (const header of headers) {
      if (!header.composerId) continue;
      const requests = buildComposerRequests(header.composerId, globalDb);
      if (requests.length === 0) continue;

      sessions.push(createSession({
        sessionId: header.composerId,
        workspaceId,
        workspaceName,
        location: 'panel',
        harness: 'Cursor',
        requests,
        creationDate: header.createdAt || null,
        lastMessageDate: header.lastUpdatedAt || null,
        workspaceRootPath,
      }));
    }
    return sessions;
  } finally {
    wsDb.close();
  }
}

export function parseCursorSessions(userDir: string): Session[] {
  const globalDbPath = path.join(userDir, 'globalStorage', 'state.vscdb');
  if (!fs.existsSync(globalDbPath)) return [];

  const globalDb = openReadOnly(globalDbPath);
  if (!globalDb) return [];

  try {
    const wsStorageDir = path.join(userDir, 'workspaceStorage');
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(wsStorageDir, { withFileTypes: true }).filter(e => e.isDirectory());
    } catch {
      return [];
    }

    const sessions: Session[] = [];
    for (const entry of entries) {
      sessions.push(...parseCursorWorkspace(path.join(wsStorageDir, entry.name), globalDb));
    }
    return sessions;
  } finally {
    globalDb.close();
  }
}
