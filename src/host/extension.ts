import * as vscode from "vscode";
import HostBus from "./messaging/host-bus";
import nonce from "@/common/nonce";
import Mediator from "@/common/messaging/mediator";
import { IMediator } from "@/web/registrations";
import { IBus } from "@/common/messaging/types";
import { LIST_PROJECTS } from "@/common/messaging/commands";
import { ListProjects } from "./handlers/list-projects";

export function activate(context: vscode.ExtensionContext) {
  const provider = new NugetViewProvider(context.extensionUri);
  let disposable = vscode.window.registerWebviewViewProvider(
    "nuget.gallery.view",
    provider
  );

  context.subscriptions.push(disposable);
}

class NugetViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    let hostBus: IBus = new HostBus(webviewView.webview);
    let mediator: IMediator = new Mediator(hostBus);

    mediator.addHandler(LIST_PROJECTS, new ListProjects());

    const webSrc = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, ...["dist", "web.js"])
    );

    const nonceValue = nonce();
    webviewView.webview.html = /*html*/ `
	  <!DOCTYPE html>
	  <html lang="en">
		<head>
		  <meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width,initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="script-src 'nonce-${nonceValue}';">
		  <title>NuGet Gallery</title>
		</head>
		<body>
		  <vscode-nuget-gallery></vscode-nuget-gallery>
		  <script type="module" nonce="${nonceValue}" src="${webSrc}"></script>
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
