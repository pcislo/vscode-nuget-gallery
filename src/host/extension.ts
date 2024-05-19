import * as vscode from "vscode";
import HostBus from "./messaging/host-bus";
import nonce from "@/common/nonce";
import Mediator from "@/common/messaging/core/mediator";
import { IMediator } from "@/web/registrations";
import { IBus } from "@/common/messaging/core/types";
import {
  GET_CONFIGURATION,
  GET_PACKAGES,
  GET_PACKAGE_DETAILS,
  GET_PROJECTS,
  OPEN_URL,
  SHOW_SETTINGS,
  UPDATE_CONFIGURATION,
  UPDATE_PROJECT,
} from "@/common/messaging/core/commands";
import { GetProjects } from "./handlers/get-projects";
import { GetPackages } from "./handlers/get-packages";
import UpdateProject from "./handlers/update-project";
import GetConfiguration from "./handlers/get-configuration";
import UpdateConfiguration from "./handlers/update-configuration";
import Telemetry from "./utilities/telemetry";
import OpenUrl from "./handlers/open-url";
import { GetPackageDetails } from "./handlers/get-package-details";

let mediator: IMediator;

export function activate(context: vscode.ExtensionContext) {
  const provider = new NugetViewProvider(context.extensionUri);
  const telemetry = new Telemetry(context);
  telemetry.sendEvent("activated");

  let previousVersion: string | undefined = context.globalState.get("NugetGallery.version");
  context.globalState.update("NugetGallery.version", context.extension.packageJSON.version);
  if (previousVersion == undefined) {
    telemetry.sendEvent("installed");
  } else if (previousVersion != context.extension.packageJSON.version)
    telemetry.sendEvent("upgraded", { fromVersion: previousVersion });

  context.subscriptions.push(telemetry);
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
  context.subscriptions.push(
    vscode.commands.registerCommand("nuget-gallery.reportProblem", async () => {
      vscode.env.openExternal(
        vscode.Uri.parse("https://github.com/pcislo/vscode-nuget-gallery/issues/new")
      );
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
      .AddHandler(UPDATE_PROJECT, new UpdateProject())
      .AddHandler(GET_CONFIGURATION, new GetConfiguration())
      .AddHandler(UPDATE_CONFIGURATION, new UpdateConfiguration())
      .AddHandler(GET_PACKAGE_DETAILS, new GetPackageDetails())
      .AddHandler(OPEN_URL, new OpenUrl());

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
