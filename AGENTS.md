# AGENTS.md

## Project Overview

**At File** is a VS Code extension that provides workspace file and directory completion when typing `@`. It enhances productivity by allowing quick file path insertion in supported file types.

## Project Structure

```
at-file/
├── src/                    # TypeScript source files
│   ├── extension.ts        # Extension entry point and activation logic
│   ├── completion.ts       # CompletionItemProvider implementation
│   ├── completionEntry.ts  # Completion item data structure
│   ├── config.ts           # Configuration handling
│   └── fileIndex.ts        # Workspace file indexing and caching
├── out/                    # Compiled JavaScript output
├── test/                   # Test files
├── sample-workspace/       # Demo workspace for development testing
├── package.json            # Extension manifest and dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # User documentation
```

## Building and Testing

### Prerequisites
- Node.js (version 18+ recommended)
- npm (comes with Node.js)

### Commands
```bash
# Install dependencies
npm install

# Compile TypeScript to JavaScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch

# Run tests
npm test

# Run tests with compilation (recommended before testing)
npm run pretest && npm test
```

### Development Workflow
1. Press `F5` in VS Code to launch Extension Development Host
2. Open `sample-workspace/at-file-demo.md` in the debug host
3. Type `@` to test file completion functionality
4. Check Debug Console for extension output

## Agent Guidelines

### Code Changes
- All source code is in TypeScript (`src/` directory)
- Compiled output goes to `out/` directory
- Always run `npm run compile` after making changes
- Test changes using the Extension Development Host (F5)

### Testing
- Run `npm test` to execute the test suite
- Tests are located in `test/` directory
- Ensure all tests pass before submitting changes

### Configuration
- Extension settings are defined in `package.json` under `contributes.configuration`
- Configuration properties use the `atFile.` prefix
- Current settings:
  - `atFile.enabledExtensions`: File extensions where completion is active
  - `atFile.exclude`: Directories/patterns to exclude from completion
  - `atFile.maxResults`: Maximum number of completion items

### Code Style
- Use TypeScript strict mode (configured in tsconfig.json)
- Follow VS Code extension API patterns
- Use async/await for asynchronous operations
- Handle errors gracefully with proper error messages

## Common Tasks

### Adding New Features
1. Modify relevant source files in `src/`
2. Update `package.json` if adding new configuration options or commands
3. Run `npm run compile` to check for TypeScript errors
4. Test in Extension Development Host
5. Update README.md if adding user-facing features

### Debugging
1. Use VS Code's debugger with F5
2. Set breakpoints in TypeScript source files
3. Check Debug Console for `console.log` output
4. Use `Developer: Toggle Developer Tools` in the debug host for advanced debugging

### Updating Dependencies
```bash
# Check for outdated packages
npm outdated

# Update a specific package
npm update <package-name>

# Update all packages
npm update

# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

## Key Files

### extension.ts
- Extension activation and deactivation
- Command registration
- Completion provider registration

### completion.ts
- Implements `CompletionItemProvider`
- Handles `@` trigger character
- Returns file/directory completion items

### fileIndex.ts
- Builds and caches workspace file index
- Handles file system watching
- Implements exclusion patterns

### config.ts
- Reads extension configuration
- Provides typed access to settings

## Notes for AI Agents

- When modifying completion logic, ensure it works with both files and directories
- Test with various file types and directory structures
- Consider performance implications for large workspaces
- Maintain backward compatibility with existing configuration
- Follow VS Code extension best practices for stability