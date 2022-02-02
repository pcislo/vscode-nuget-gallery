// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import { TaskManager } from './taskManager';
import parseProject from './parseProject';


const fs = require("fs");
const axios = require('axios').default;
const exec = require('child_process').exec;
let queryUrl:any = null;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function postMessage(panel: vscode.WebviewPanel, command: string, payload: object) {
	panel.webview.postMessage({ command: command, payload: payload });
}

function readCredentials(configuration: vscode.WorkspaceConfiguration, source: string, credentialsCallback: Function) {
	let command = "";
	if (process.platform === 'win32') {
		command = "\"" + configuration.credentialProviderFolder + "/CredentialProvider.Microsoft.exe\"";
	}
	else {
		command = "dotnet \"" + configuration.credentialProviderFolder + "/CredentialProvider.Microsoft.dll\"";
	}
	exec(command + " -C -F Json -U " + source, function callback(error: any, stdout: any, stderr: any) {
		console.log(stderr)
		credentialsCallback({ source: source, credentials: JSON.parse(stdout) });
	});
}
function getAmagPackagesExtension(message: any, packagesCallback: Function) {
  const createQuery = () => {
    if (queryUrl == null) {
      return new Promise((resolve, reject) => {
        axios
          .get(message.source)
          .then((response: { data: { resources: any[]; }; }) => {
            let resource = response.data.resources.find(x =>
              x["@type"].includes("SearchQueryService")
            );
            if (resource != null) queryUrl = resource["@id"];
            if (queryUrl == null) reject();
            createQuery()
              .then((response: unknown) => resolve(response))
              .catch((error: any) => reject(error));
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    }

    return axios.get(queryUrl, {
      params: message.params
    });
  };
  createQuery().then((response: any) => {
    packagesCallback(response)
  }, (error: any) => {
    packagesCallback(error)
  });
}

function loadProjects(panel: vscode.WebviewPanel) {
	vscode.workspace.findFiles("**/*.{csproj,fsproj,vbproj}").then(files => {
		let projects = Array();
		files.map(x => x.fsPath).forEach(x => {
			let project = parseProject(x);
			projects.push(project);
		});
		postMessage(panel, "setProjects", projects.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
	});
}

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('extension.start', () => {
		let configuration = vscode.workspace.getConfiguration("NugetGallery");
		const panel = vscode.window.createWebviewPanel(
			'nuget-gallery', // Identifies the type of the webview. Used internally
			'NuGet Gallery', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{ enableScripts: true } // Webview options. More on these later.
		);

		let taskManager = new TaskManager(vscode.tasks.executeTask, (e: any) => {
			if (e.name === "nuget-gallery" && e.remaining === 0) {
				loadProjects(panel);
			}
		});
		vscode.tasks.onDidEndTask(e => taskManager.handleDidEndTask(e));

		panel.webview.onDidReceiveMessage(
			async message => {
				if (message.command === "reloadProjects") {
					loadProjects(panel);
				}
				else if (message.command === "reloadSources") {
					postMessage(panel, "setSources", configuration.sources);
				}
				else if (message.command === "getCredentials") {

					readCredentials(configuration, message.source, (cred: Object) => {
						postMessage(panel, "setCredentials", { source: message.source, credentials: cred });
					});
				}
        else if (message.command === "getPackages"){
          getAmagPackagesExtension(message, (pack: any) => {
            postMessage(panel, "getPackages", { source: message.source, packages: {data : pack.data ? pack.data : pack.message }});
          });
        }
				else {
					for (let i = 0; i < message.projects.length; i++) {
						let project = message.projects[i];
						let args = [message.command, project.projectPath.replace(/\\/g, "/"), "package", message.package.id];
						if (message.command === 'add') {
							args.push("-v");
							args.push(message.version);
							args.push("-s");
							args.push(message.source);
						}
						let task = new vscode.Task(
							{ type: 'dotnet', task: `dotnet ${message.command}` },
							'nuget-gallery',
							'dotnet',
							new vscode.ShellExecution("dotnet", args)
						);
						taskManager.addTask(task);
					}
				}
			},
			undefined,
			context.subscriptions
		);


		let html = fs.readFileSync(path.join(context.extensionPath, 'web/dist', 'index.html'), "utf8");
		panel.webview.html = html;
	}));

}

// this method is called when your extension is deactivated
export function deactivate() { }
