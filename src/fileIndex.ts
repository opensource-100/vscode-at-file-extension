import type * as vscode from 'vscode';

export type FileEntryType = 'file' | 'directory';

export interface FileEntry {
  relativePath: string;
  type: FileEntryType;
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/').replace(/^\/+/, '');
}

export function buildExcludeGlob(excludes: readonly string[]): string | undefined {
  const patterns = excludes
    .map((exclude) => exclude.trim())
    .filter(Boolean)
    .map((exclude) => {
      const normalized = normalizePath(exclude);
      if (normalized.includes('*') || normalized.includes('{') || normalized.includes('}')) {
        return normalized;
      }
      return `**/${normalized}/**`;
    });

  if (patterns.length === 0) {
    return undefined;
  }

  return `{${patterns.join(',')}}`;
}

export function deriveDirectoryEntries(files: readonly FileEntry[]): FileEntry[] {
  const directories = new Set<string>();

  for (const file of files) {
    const parts = normalizePath(file.relativePath).split('/');
    parts.pop();

    let current = '';
    for (const part of parts) {
      if (!part) {
        continue;
      }
      current = current ? `${current}/${part}` : part;
      directories.add(`${current}/`);
    }
  }

  return Array.from(directories)
    .sort((left, right) => left.localeCompare(right))
    .map((relativePath) => ({ relativePath, type: 'directory' }));
}

export class WorkspaceFileIndex {
  private entriesPromise: Promise<FileEntry[]> | undefined;

  constructor(private readonly workspace: Pick<typeof vscode.workspace, 'findFiles' | 'workspaceFolders' | 'asRelativePath'>) {}

  clear(): void {
    this.entriesPromise = undefined;
  }

  async getEntries(excludes: readonly string[]): Promise<FileEntry[]> {
    if (!this.entriesPromise) {
      this.entriesPromise = this.scan(excludes);
    }
    return this.entriesPromise;
  }

  private async scan(excludes: readonly string[]): Promise<FileEntry[]> {
    const uris = await this.workspace.findFiles('**/*', buildExcludeGlob(excludes));
    const workspaceFolder = this.workspace.workspaceFolders?.[0];

    const files = uris
      .map((uri) => {
        const relativePath = workspaceFolder
          ? this.workspace.asRelativePath(uri, false)
          : uri.path.replace(/^\/+/, '');
        return normalizePath(relativePath);
      })
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right))
      .map<FileEntry>((relativePath) => ({ relativePath, type: 'file' }));

    return [...deriveDirectoryEntries(files), ...files];
  }
}
