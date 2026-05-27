# at_file Design

## Goal

Create a VS Code extension named `at_file` that shows file and directory completion items when a user types `@` in configured file types.

## Behavior

- The extension only runs in files whose extension matches `atFile.enabledExtensions`.
- Typing `@` triggers VS Code's completion list.
- Completion items include files and directories under the current workspace.
- Common dependency, build, and metadata directories are excluded by default.
- File insertions use `@relative/path.ext`.
- Directory insertions use `@relative/path/`.
- Users can refresh the cached index with `At File: Refresh Index`.

## Configuration

- `atFile.enabledExtensions`: array of extension names without dots.
- `atFile.exclude`: array of glob patterns or directory names to exclude.
- `atFile.maxResults`: maximum number of entries shown in completion.

## Architecture

- `src/config.ts` reads and normalizes extension settings.
- `src/fileIndex.ts` scans workspace files and derives directory entries.
- `src/completion.ts` decides whether completion applies and builds completion items.
- `src/extension.ts` wires activation, providers, cache invalidation, and commands.

## Verification

- Unit tests cover extension matching, glob building, item generation, and replacement range behavior.
- `npm test` runs compile and unit tests.
- `npm run compile` verifies TypeScript.
