// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

const xpath = require('xpath');
const dom = require('xmldom').DOMParser;
const fs = require("fs");

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

		panel.webview.onDidReceiveMessage(
			message => {
				console.log(message);

				switch (message.command) {
					case 'install':
						return;
					case 'uninstall':
						return;
				}
			},
			undefined,
			context.subscriptions
		);

		vscode.workspace.findFiles("**/*.csproj").then(files => {
			let projects = Array();
			files.map(x => x.fsPath).forEach(x => {
				let document = new dom().parseFromString(fs.readFileSync(x, "utf8"));
				let packagesReferences = xpath.select("//ItemGroup/PackageReference", document);
				let project = {
					path: x,
					project: path.basename(x),
					packages: Array()
				};
				packagesReferences.forEach((p: any) => {
					let projectPackage = {

						id: p.attributes.getNamedItem("Include").value,
						version: p.attributes.getNamedItem("Version").value
					};
					project.packages.push(projectPackage);
				});
				projects.push(project);
			});

			panel.webview.postMessage(projects.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
		});

		let html = fs.readFileSync(path.join(context.extensionPath, 'web', 'index.html'), "utf8");
		panel.webview.html = html;
	}));

}

// this method is called when your extension is deactivated
export function deactivate() { }
