import * as assert from 'assert';
import { getWordStartAfterAt, isEnabledForFile, normalizeExtensions, shouldTriggerSuggest } from '../../src/config';
import { buildExcludeGlob, deriveDirectoryEntries, FileEntry } from '../../src/fileIndex';
import { createCompletionEntries } from '../../src/completionEntry';

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test('normalizes configured extensions without dots or duplicates', () => {
  assert.deepStrictEqual(normalizeExtensions(['.md', 'ts', 'TS', '', ' js ']), ['md', 'ts', 'js']);
});

test('enables completion only for configured file extensions', () => {
  assert.strictEqual(isEnabledForFile('/workspace/README.md', ['md']), true);
  assert.strictEqual(isEnabledForFile('/workspace/src/app.tsx', ['ts', 'tsx']), true);
  assert.strictEqual(isEnabledForFile('/workspace/src/app.css', ['ts', 'tsx']), false);
});

test('builds exclude glob from directory names and glob patterns', () => {
  assert.strictEqual(
    buildExcludeGlob(['node_modules', 'target', '**/generated/**']),
    '{**/node_modules/**,**/target/**,**/generated/**}'
  );
});

test('derives sorted directory entries from file entries', () => {
  const files: FileEntry[] = [
    { relativePath: 'src/components/Button.tsx', type: 'file' },
    { relativePath: 'src/index.ts', type: 'file' }
  ];

  assert.deepStrictEqual(deriveDirectoryEntries(files), [
    { relativePath: 'src/', type: 'directory' },
    { relativePath: 'src/components/', type: 'directory' }
  ]);
});

test('creates completion entries with path-only insert text and directory suffixes', () => {
  const entries = createCompletionEntries([
    { relativePath: 'src/index.ts', type: 'file' },
    { relativePath: 'src/components/', type: 'directory' }
  ], 10);

  assert.deepStrictEqual(entries.map((entry) => entry.insertText), [
    'src/components/',
    'src/index.ts'
  ]);
});

test('creates a helpful placeholder entry when the workspace index is empty', () => {
  const entries = createCompletionEntries([], 10);

  assert.deepStrictEqual(entries, [
    {
      label: 'No workspace files found',
      insertText: '',
      type: 'placeholder'
    }
  ]);
});

test('finds replacement start at the nearest @ before the cursor', () => {
  assert.strictEqual(getWordStartAfterAt('import @src/ind', 15), 7);
  assert.strictEqual(getWordStartAfterAt('email a@b.com', 13), undefined);
  assert.strictEqual(getWordStartAfterAt('plain text', 10), undefined);
});

test('triggers suggest only when @ is typed in an enabled file', () => {
  assert.strictEqual(shouldTriggerSuggest('@', '/workspace/README.md', ['md']), true);
  assert.strictEqual(shouldTriggerSuggest('a', '/workspace/README.md', ['md']), false);
  assert.strictEqual(shouldTriggerSuggest('@', '/workspace/styles.css', ['md']), false);
});
