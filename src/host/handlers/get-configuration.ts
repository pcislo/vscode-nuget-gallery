import { IRequestHandler } from "@/common/messaging/core/types";
import * as vscode from "vscode";
import NuGetConfigParser from "../utilities/nuget-config-parser";

export default class GetConfiguration implements IRequestHandler<GetConfigurationRequest, GetConfigurationResponse> {
  async HandleAsync(request: GetConfigurationRequest): Promise<GetConfigurationResponse> {
    let config = vscode.workspace.getConfiguration("NugetGallery");
    try {
      await config.update("credentialProviderFolder", undefined, vscode.ConfigurationTarget.Workspace);
      await config.update("sources", undefined, vscode.ConfigurationTarget.Workspace);
      await config.update("skipRestore", undefined, vscode.ConfigurationTarget.Workspace);
    } catch {}
    config = vscode.workspace.getConfiguration("NugetGallery");

    let settingsSources: Array<Source> =
      config
        .get<Array<string>>("sources")
        ?.map((x) => {
          try {
            return JSON.parse(x) as { name?: string; url?: string };
          } catch {
            return {};
          }
        })
        .filter((x) => x.name != undefined && x.url != undefined)
        .map((x) => ({
          Name: x.name!,
          Url: x.url!,
          Origin: "settings" as SourceOrigin,
        })) ?? [];

    let nugetConfigSources: Array<Source> = [];
    try {
      const parsed = await NuGetConfigParser.LoadAsync();
      nugetConfigSources = parsed
        .filter((x) => !x.IsDisabled)
        .map((x) => ({
          Name: x.Name,
          Url: x.Url,
          Username: x.Username,
          Password: x.Password,
          IsReadOnly: true,
          Origin: "nuget-config" as SourceOrigin,
        }));
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to load nuget.config sources: ${err instanceof Error ? err.message : String(err)}`);
    }

    let merged: Array<Source> = [];
    let seenUrls = new Set<string>();
    for (const src of settingsSources) {
      const key = src.Url.toLowerCase();
      if (seenUrls.has(key)) continue;
      seenUrls.add(key);
      merged.push(src);
    }
    for (const src of nugetConfigSources) {
      const key = src.Url.toLowerCase();
      if (seenUrls.has(key)) continue;
      seenUrls.add(key);
      merged.push(src);
    }

    let result: GetConfigurationResponse = {
      Configuration: {
        SkipRestore: config.get("skipRestore") ?? false,
        CredentialProviderFolder: config.get("credentialProviderFolder") ?? "",
        Sources: merged,
      },
    };

    return result;
  }
}
