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

  const cwd = resolveCwd(targetUri);
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(targetUri);
  const workspacePath = workspaceFolder ? workspaceFolder.uri.fsPath : '';
  const cliPath = resolveCliPath(context, targetUri, workspacePath);
  const commandBody = resolveCommandBody(mode, {
    cliPath,
    filePath,
    workspacePath
  });

  if (!commandBody) return;

  const command = [
    `$env:NODE_OPTIONS=''`,
    `$env:VSCODE_INSPECTOR_OPTIONS=''`,
    `Set-Location -LiteralPath ${quoteForPowerShell(cwd)}`,
    commandBody
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

function resolveCliPath(context, targetUri, workspacePath) {
  const configured = vscode.workspace.getConfiguration('jeom').get('cliPath', '').trim();

  if (configured) {
    return configured
      .replace(/\$\{workspaceFolder\}/g, workspacePath)
      .replace(/\//g, path.sep);
  }

  const candidates = [
    workspacePath ? path.join(workspacePath, 'official', 'cli.js') : '',
    workspacePath ? path.join(workspacePath, 'cli.js') : '',
    workspacePath ? path.join(workspacePath, 'jeom_cli.js') : '',
    path.join(context.extensionPath, 'official', 'cli.js'),
    path.join(context.extensionPath, 'cli.js'),
    path.join(context.extensionPath, 'jeom_cli.js')
  ].filter(Boolean);

  const found = candidates.find(candidate => fs.existsSync(candidate));
  return found || path.join(context.extensionPath, 'jeom_cli.js');
}

function resolveCommandBody(mode, vars) {
  const config = vscode.workspace.getConfiguration('jeom');
  const settingName = mode === 'check' ? 'checkCommand' : 'runCommand';
  const template = config.get(settingName, '').trim();

  if (template) {
    return expandCommandTemplate(template, {
      ...vars,
      mode
    });
  }

  if (!fs.existsSync(vars.cliPath)) {
    vscode.window.showErrorMessage(`JEOM CLI was not found: ${vars.cliPath}`);
    return undefined;
  }

  return `node ${quoteForPowerShell(vars.cliPath)} ${mode} ${quoteForPowerShell(vars.filePath)}`;
}

function expandCommandTemplate(template, vars) {
  const replacements = {
    '${file}': quoteForPowerShell(vars.filePath),
    '${filePath}': quoteForPowerShell(vars.filePath),
    '${workspaceFolder}': quoteForPowerShell(vars.workspacePath),
    '${cliPath}': quoteForPowerShell(vars.cliPath),
    '${mode}': vars.mode
  };

  return Object.entries(replacements).reduce(
    (command, [placeholder, value]) => command.split(placeholder).join(value),
    template
  );
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
