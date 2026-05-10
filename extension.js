const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

let terminal;

function activate(context) {
  const runCommand = vscode.commands.registerCommand('jeom.runFile', uri => {
    runJeom(context, uri, 'run');
  });

  const checkCommand = vscode.commands.registerCommand('jeom.checkFile', uri => {
    runJeom(context, uri, 'check');
  });

  const codeLensProvider = vscode.languages.registerCodeLensProvider(
    { language: 'jeom', scheme: 'file' },
    new JeomCodeLensProvider()
  );

  const closeTerminalWatcher = vscode.window.onDidCloseTerminal(closedTerminal => {
    if (closedTerminal === terminal) terminal = undefined;
  });

  context.subscriptions.push(runCommand, checkCommand, codeLensProvider, closeTerminalWatcher);
}

function deactivate() {}

class JeomCodeLensProvider {
  provideCodeLenses(document) {
    const config = vscode.workspace.getConfiguration('jeom');
    if (!config.get('showCodeLens', true)) return [];

    const range = new vscode.Range(0, 0, 0, 0);
    return [
      new vscode.CodeLens(range, {
        title: 'Run JEOM',
        command: 'jeom.runFile',
        arguments: [document.uri]
      }),
      new vscode.CodeLens(range, {
        title: 'Check JEOM',
        command: 'jeom.checkFile',
        arguments: [document.uri]
      })
    ];
  }
}

async function runJeom(context, uri, mode) {
  const targetUri = resolveTargetUri(uri);
  if (!targetUri) {
    vscode.window.showWarningMessage('Open a .jeom file before running JEOM.');
    return;
  }

  const filePath = targetUri.fsPath;
  if (path.extname(filePath).toLowerCase() !== '.jeom') {
    vscode.window.showWarningMessage('The active file is not a .jeom file.');
    return;
  }

  const document = await vscode.workspace.openTextDocument(targetUri);
  if (document.isDirty) await document.save();

  const cliPath = resolveCliPath(context, targetUri);
  if (!fs.existsSync(cliPath)) {
    vscode.window.showErrorMessage(`JEOM CLI was not found: ${cliPath}`);
    return;
  }

  const cwd = resolveCwd(targetUri);
  const command = [
    `$env:NODE_OPTIONS=''`,
    `$env:VSCODE_INSPECTOR_OPTIONS=''`,
    `Set-Location -LiteralPath ${quoteForPowerShell(cwd)}`,
    `node ${quoteForPowerShell(cliPath)} ${mode} ${quoteForPowerShell(filePath)}`
  ].join('; ');

  terminal = terminal || createJeomTerminal();
  terminal.show(true);
  terminal.sendText(command);
}

function createJeomTerminal() {
  return vscode.window.createTerminal({
    name: 'JEOM',
    env: {
      NODE_OPTIONS: '',
      VSCODE_INSPECTOR_OPTIONS: ''
    }
  });
}

function resolveTargetUri(uri) {
  if (uri && uri.fsPath) return uri;
  const editor = vscode.window.activeTextEditor;
  return editor ? editor.document.uri : undefined;
}

function resolveCliPath(context, targetUri) {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(targetUri);
  const workspacePath = workspaceFolder ? workspaceFolder.uri.fsPath : '';
  const configured = vscode.workspace.getConfiguration('jeom').get('cliPath', '').trim();

  if (configured) {
    return configured
      .replace(/\$\{workspaceFolder\}/g, workspacePath)
      .replace(/\//g, path.sep);
  }

  const workspaceCli = workspacePath ? path.join(workspacePath, 'jeom_cli.js') : '';
  if (workspaceCli && fs.existsSync(workspaceCli)) return workspaceCli;

  return path.join(context.extensionPath, 'jeom_cli.js');
}

function resolveCwd(targetUri) {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(targetUri);
  if (workspaceFolder) return workspaceFolder.uri.fsPath;
  return path.dirname(targetUri.fsPath);
}

function quoteForPowerShell(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

module.exports = {
  activate,
  deactivate
};
