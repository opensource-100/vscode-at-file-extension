import * as path from 'path';

export interface AtFileConfig {
  enabledExtensions: string[];
  exclude: string[];
  maxResults: number;
}

export const defaultConfig: AtFileConfig = {
  enabledExtensions: ['md', 'txt'],
  exclude: ['node_modules', 'target', '.git', 'dist', 'build', '.next', '.idea', '.vscode'],
  maxResults: 20
};

export function parseStringToArray(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

export function normalizeExtensions(extensions: readonly string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const extension of extensions) {
    const value = extension.trim().replace(/^\.+/, '').toLowerCase();
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    normalized.push(value);
  }

  return normalized;
}

export function isEnabledForFile(filePath: string, enabledExtensions: readonly string[]): boolean {
  const extension = path.extname(filePath).replace(/^\./, '').toLowerCase();
  return normalizeExtensions(enabledExtensions).includes(extension);
}

export function getWordStartAfterAt(lineText: string, cursorCharacter: number): number | undefined {
  const beforeCursor = lineText.slice(0, cursorCharacter);
  const atIndex = beforeCursor.lastIndexOf('@');

  if (atIndex < 0) {
    return undefined;
  }

  const prefix = beforeCursor.slice(atIndex + 1);
  if (!/^[\w./-]*$/.test(prefix)) {
    return undefined;
  }

  const previous = atIndex > 0 ? beforeCursor[atIndex - 1] : '';
  if (previous && /[\w.-]/.test(previous)) {
    return undefined;
  }

  return atIndex;
}

export function shouldTriggerSuggest(insertedText: string, filePath: string, enabledExtensions: readonly string[]): boolean {
  return insertedText === '@' && isEnabledForFile(filePath, enabledExtensions);
}
