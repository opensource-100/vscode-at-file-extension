import * as vscode from 'vscode';
import { createCompletionEntries } from './completionEntry';
import { AtFileConfig, getWordStartAfterAt, isEnabledForFile } from './config';
import { WorkspaceFileIndex } from './fileIndex';

export class AtFileCompletionProvider implements vscode.CompletionItemProvider {
  constructor(
    private readonly config: () => AtFileConfig,
    private readonly index: WorkspaceFileIndex
  ) {}

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.CompletionItem[] | undefined> {
    const config = this.config();
    if (!isEnabledForFile(document.fileName, config.enabledExtensions)) {
      return undefined;
    }

    const lineText = document.lineAt(position.line).text;
    const replaceStart = getWordStartAfterAt(lineText, position.character);
    if (replaceStart === undefined) {
      return undefined;
    }

    const range = new vscode.Range(position.line, replaceStart + 1, position.line, position.character);
    const entries = await this.index.getEntries(config.exclude);

    return createCompletionEntries(entries, config.maxResults).map((entry) => {
      if (entry.type === 'placeholder') {
        const item = new vscode.CompletionItem(entry.label, vscode.CompletionItemKind.Text);
      item.insertText = entry.insertText;
      item.filterText = entry.label;
      item.range = range;
      item.detail = 'Open a workspace folder to complete files';
      return item;
      }

      const item = new vscode.CompletionItem(
        entry.label,
        entry.type === 'directory' ? vscode.CompletionItemKind.Folder : vscode.CompletionItemKind.File
      );
      item.insertText = entry.insertText;
      item.filterText = entry.label;
      item.range = range;
      item.detail = entry.type === 'directory' ? 'Directory' : 'File';
      return item;
    });
  }
}
