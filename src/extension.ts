// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import axios, { AxiosRequestConfig } from 'axios';
import { exec } from 'child_process';
import * as fs from "fs";
import * as path from 'path';
import * as vscode from 'vscode';
import parseNugetConfig from './parseNugetConfig';
import parseProject from './parseProject';
import { TaskManager } from './taskManager';
import { Credentials, GetNugetPackagesPageData, GetNugetSourceData, GetNugetSourceRequest as LoadNugetPackagesRequest, NugetSource, Package } from './types';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function postMessage(panel: vscode.WebviewPanel, command: string, payload: object) {
	panel.webview.postMessage({ command: command, payload: payload });
}

async function readCredentials(configuration: vscode.WorkspaceConfiguration, source: NugetSource): Promise<Credentials | undefined> {
	if (!!source?.credentials) {
		return source.credentials;
	}

	let command = "";
	if (process.platform === 'win32') {
		command = configuration.credentialProviderFolder + "/CredentialProvider.Microsoft.exe";
	}
	else {
		command = "dotnet " + configuration.credentialProviderFolder + "/CredentialProvider.Microsoft.dll";
	}

	return await new Promise<Credentials | undefined>((resolve) => {
		exec(command + " -C -F Json -U " + source.url, function callback(_: any, stdout: any, stderr: any) {
			console.error(stderr)

			if (!stdout) {
				return resolve();
			}

			let credentials: Credentials | undefined;
			try {
				credentials = JSON.parse(stdout) as Credentials | undefined;
			} catch (parserError) {
				console.error(`Error getting credentials for NuGet source ${source.name}`, parserError);
			}

			resolve(credentials);
		});
	})
}

function loadProjects(panel: vscode.WebviewPanel) {
	vscode.workspace.findFiles("**/*.{cs,fs,vb}proj").then(files => {
		let projects = Array();
		files.map(x => x.fsPath).forEach(x => {
			let project = parseProject(x);
			projects.push(project);
		});
		postMessage(panel, "setProjects", projects.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
	});
}

async function loadPackages(panel: vscode.WebviewPanel, source: NugetSource, page: number, pageSize: number, filter?: string, isPrerelease?: boolean): Promise<Package[]> {
	const baseRequestConfig: AxiosRequestConfig = {
		auth: !!source.credentials
			? { username: source.credentials.Username, password: source.credentials.Password }
			: undefined
	}

	const sourceInfo = await sendHttpRequest<GetNugetSourceData>({
		...baseRequestConfig,
		url: source.url
	});

	let resource = sourceInfo.resources.find(x =>
		x["@type"].includes("SearchQueryService")
	);

	const packages = await sendHttpRequest<GetNugetPackagesPageData>({
		...baseRequestConfig,
		url: resource?.["@id"],
		params: {
			q: filter,
			take: pageSize,
			skip: page * pageSize,
			prerelease: isPrerelease
		}
	})


	var sanitizedPackages = packages.data.map(p => ({
		id: p.id,
		iconUrl: p.iconUrl,
		summary: p.summary,
		description: p.description,
		authors: typeof p.authors === "string" ? [p.authors] : p.authors,
		version: p.version,
		versions: p.versions
	}));

	return sanitizedPackages;
}

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('extension.start', async () => {
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

		const sources = await collectNugetSources(configuration);

		panel.webview.onDidReceiveMessage(
			async message => {
				if (message.command === "reloadProjects") {
					loadProjects(panel);
				}
				else if (message.command === "reloadSources") {
					postMessage(panel, "setSources", sources);
				}
				else if (message.command === "refreshPackages") {
					const { source, page, pageSize, filter, isPrerelease } = message.payload as LoadNugetPackagesRequest;

					try {
						const packages = await loadPackages(panel, source, page, pageSize, filter, isPrerelease);

						postMessage(panel, "listPackages", packages);
					} catch (error) {
						vscode.window.showErrorMessage(`Error getting packages from ${message.payload.source.name}: ${error.message}`);
					}
				}
				else if (message.command === "queryPackagesPage") {
					const { source, page, pageSize, filter, isPrerelease } = message.payload as LoadNugetPackagesRequest;

					try {
						const packages = await loadPackages(panel, source, page, pageSize, filter, isPrerelease);

						postMessage(panel, "appendPackages", packages);
					} catch (error) {
						vscode.window.showErrorMessage(`Error getting packages from ${message.payload.source.name}: ${error.message}`);
					}
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

async function sendHttpRequest<T>(config: AxiosRequestConfig): Promise<T> {
	const response = await axios.request<T>(config);

	return response.data;
}

async function collectNugetSources(configuration: vscode.WorkspaceConfiguration): Promise<NugetSource[]> {
	const nugetConfigs = await vscode.workspace.findFiles("**/nuget.config");
	const sourcesFromExtension = configuration.sources.map((s: string) => JSON.parse(s));

	if (!nugetConfigs.length) {
		return sourcesFromExtension;
	}

	const parsedSources = parseNugetConfig(nugetConfigs[0]);

	const distinctSourcesMap = parsedSources
		.concat(...sourcesFromExtension)
		.reduce((sourcesMap: Map<string, NugetSource>, source: NugetSource) => {
			if (sourcesMap.has(source.name)) {
				return sourcesMap;
			}

			return sourcesMap.set(source.name, source);
		}, new Map<string, NugetSource>());

	const allSources = Array.from(distinctSourcesMap.values());

	return Promise.all(
		allSources.map(async source => {
			let credentials = await (source.credentials ?? readCredentials(configuration, source))

			return {
				...source,
				credentials
			};
		}));
}

// this method is called when your extension is deactivated
export function deactivate() { }
