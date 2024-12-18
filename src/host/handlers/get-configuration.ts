import { IRequestHandler } from "@/common/messaging/core/types";
import * as vscode from "vscode";
export default class GetConfiguration implements IRequestHandler<GetConfigurationRequest, GetConfigurationResponse> {
  async HandleAsync(request: GetConfigurationRequest): Promise<GetConfigurationResponse> {
    let config = vscode.workspace.getConfiguration("NugetGallery");
    try {
      await config.update("credentialProviderFolder", undefined, vscode.ConfigurationTarget.Workspace);
      await config.update("sources", undefined, vscode.ConfigurationTarget.Workspace);
      await config.update("skipRestore", undefined, vscode.ConfigurationTarget.Workspace);
    } catch {}
    config = vscode.workspace.getConfiguration("NugetGallery");
    let sources =
      config.get<Array<string>>("sources")?.map((x) => {
        try {
          return JSON.parse(x) as { name?: string; url?: string };
        } catch {
          return {};
        }
      }) ?? [];

    let result: GetConfigurationResponse = {
      Configuration: {
        SkipRestore: config.get("skipRestore") ?? false,
        CredentialProviderFolder: config.get("credentialProviderFolder") ?? "",
        Sources: sources
          .filter((x) => x.name != undefined && x.url != undefined)
          .map((x) => ({
            Name: x.name!,
            Url: x.url!,
          })),
      },
    };

    return result;
  }
}
