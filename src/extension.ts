// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

let fs = require("fs");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('extension.start', () => {
		const panel = vscode.window.createWebviewPanel(
			'nuget-gallery', // Identifies the type of the webview. Used internally
			'NuGet Gallery', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{ enableScripts: true } // Webview options. More on these later.
		);

		var html = fs.readFileSync(path.join(context.extensionPath, 'web', 'index.html'), "utf8");
		panel.webview.html = html;
	}));

}

// this method is called when your extension is deactivated
export function deactivate() { }
