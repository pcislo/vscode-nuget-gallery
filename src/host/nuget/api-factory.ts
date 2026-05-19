import * as vscode from "vscode";
import NuGetApi from "../nuget/api";
import NuGetConfigParser, { NuGetConfigSource } from "../utilities/nuget-config-parser";

type SourceApiCollection = {
  [url: string]: NuGetApi;
};

class NuGetApiFactory {
  private _sourceApiCollection: SourceApiCollection = {};
  private _nugetConfigSources: Promise<Array<NuGetConfigSource>> | null = null;

  public async GetSourceApi(url: string): Promise<NuGetApi> {
    if (url in this._sourceApiCollection) return this._sourceApiCollection[url];

    let credentialProviderFolder =
      vscode.workspace.getConfiguration("NugetGallery").get<string>("credentialProviderFolder") ??
      "";

    let credentials: Credentials | undefined = undefined;
    try {
      const sources = await this.GetNuGetConfigSources();
      const matched = sources.find((s) => s.Url.toLowerCase() === url.toLowerCase());
      if (matched && matched.Username && matched.Password) {
        credentials = { Username: matched.Username, Password: matched.Password };
      }
    } catch (err) {
      vscode.window.showErrorMessage(
        `Failed to resolve credentials from nuget.config: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    this._sourceApiCollection[url] = new NuGetApi(url, credentialProviderFolder, credentials);
    return this._sourceApiCollection[url];
  }

  public Invalidate(): void {
    this._sourceApiCollection = {};
    this._nugetConfigSources = null;
  }

  private GetNuGetConfigSources(): Promise<Array<NuGetConfigSource>> {
    if (this._nugetConfigSources == null) {
      this._nugetConfigSources = NuGetConfigParser.LoadAsync().catch((err) => {
        vscode.window.showErrorMessage(
          `Failed to load nuget.config: ${err instanceof Error ? err.message : String(err)}`
        );
        this._nugetConfigSources = null;
        return [];
      });
    }
    return this._nugetConfigSources;
  }
}

export default new NuGetApiFactory();
