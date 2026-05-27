import { FileEntry } from './fileIndex';

export interface CompletionEntry {
  label: string;
  insertText: string;
  type: 'file' | 'directory' | 'placeholder';
}

export function createCompletionEntries(entries: readonly FileEntry[], maxResults: number): CompletionEntry[] {
  if (entries.length === 0) {
    return [
      {
        label: 'No workspace files found',
        insertText: '',
        type: 'placeholder'
      }
    ];
  }

  return entries
    .slice()
    .sort((left, right) => {
      if (left.type !== right.type) {
        return left.type === 'directory' ? -1 : 1;
      }
      return left.relativePath.localeCompare(right.relativePath);
    })
    .slice(0, maxResults)
    .map((entry) => ({
      label: entry.relativePath,
      insertText: entry.relativePath,
      type: entry.type
    }));
}
