import * as vscode from "vscode";
import HostBus from "./messaging/host-bus";
import nonce from "@/common/nonce";
import Mediator from "@/common/messaging/core/mediator";
import { IMediator } from "@/web/registrations";
import { IBus } from "@/common/messaging/core/types";
import {
  GET_PACKAGES,
  GET_PROJECTS,
  SHOW_SETTINGS,
  UPDATE_PROJECT,
} from "@/common/messaging/core/commands";
import { GetProjects } from "./handlers/get-projects";
import { GetPackages } from "./handlers/get-packages";
import UpdateProject from "./handlers/update-project";

let mediator: IMediator;

export function activate(context: vscode.ExtensionContext) {
  const provider = new NugetViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("nuget.gallery.view", provider, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("nuget-gallery.openSettings", async () => {
      await mediator?.PublishAsync<ShowSettingsRequest, ShowSettingsResponse>(SHOW_SETTINGS, {});
    })
  );
}

class NugetViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    let hostBus: IBus = new HostBus(webviewView.webview);
    mediator = new Mediator(hostBus);

    mediator
      .AddHandler(GET_PROJECTS, new GetProjects())
      .AddHandler(GET_PACKAGES, new GetPackages())
      .AddHandler(UPDATE_PROJECT, new UpdateProject());

    const webJsSrc = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, ...["dist", "web.js"])
    );
    const webCssSrc = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, ...["dist", "web.css"])
    );

    const nonceValue = nonce();
    webviewView.webview.html = /*html*/ `
	  <!DOCTYPE html>
	  <html lang="en">
		<head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="script-src 'nonce-${nonceValue}';">
      <link rel="stylesheet" type="text/css" href="${webCssSrc}"/>
		  <title>NuGet Gallery</title>
		</head>
		<body>
		  <vscode-nuget-gallery></vscode-nuget-gallery>
		  <script type="module" nonce="${nonceValue}" src="${webJsSrc}"></script>
		</body>
	  </html>
	`;
    webviewView.webview.options = {
      enableScripts: true,
    };
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
