import * as vscode from 'vscode';
import { AtFileCompletionProvider } from './completion';
import { AtFileConfig, defaultConfig, normalizeExtensions, parseStringToArray, shouldTriggerSuggest } from './config';
import { WorkspaceFileIndex } from './fileIndex';

function readConfig(): AtFileConfig {
  const config = vscode.workspace.getConfiguration('atFile');
  const enabledExtensionsRaw = config.get<string | string[]>('enabledExtensions', defaultConfig.enabledExtensions);
  const excludeRaw = config.get<string | string[]>('exclude', defaultConfig.exclude);
  const maxResults = config.get<number>('maxResults', defaultConfig.maxResults);

  const enabledExtensions = normalizeExtensions(parseStringToArray(enabledExtensionsRaw));
  const exclude = parseStringToArray(excludeRaw);

  return {
    enabledExtensions,
    exclude,
    maxResults
  };
}

export function activate(context: vscode.ExtensionContext): void {
  const index = new WorkspaceFileIndex(vscode.workspace);
  const provider = new AtFileCompletionProvider(readConfig, index);

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider({ scheme: 'file' }, provider, '@'),
    vscode.commands.registerCommand('atFile.refreshIndex', () => {
      index.clear();
      vscode.window.showInformationMessage('At File index refreshed.');
    }),
    vscode.workspace.onDidCreateFiles(() => index.clear()),
    vscode.workspace.onDidDeleteFiles(() => index.clear()),
    vscode.workspace.onDidRenameFiles(() => index.clear()),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('atFile')) {
        index.clear();
      }
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document !== event.document) {
        return;
      }

      const config = readConfig();
      const typedAt = event.contentChanges.some((change) =>
        shouldTriggerSuggest(change.text, event.document.fileName, config.enabledExtensions)
      );

      if (typedAt) {
        setTimeout(() => {
          const activeEditor = vscode.window.activeTextEditor;
          if (activeEditor && activeEditor.document === event.document) {
            vscode.commands.executeCommand('editor.action.triggerSuggest');
          }
        }, 0);
      }
    })
  );
}

export function deactivate(): void {}
