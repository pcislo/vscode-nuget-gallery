import * as vscode from "vscode";
import NuGetApi from "../nuget/api";

type SourceApiCollection = {
  [url: string]: NuGetApi;
};

class NuGetApiFactory {
  private readonly _sourceApiCollection: SourceApiCollection = {};

  public GetSourceApi(url: string) {
    let credentialProviderFolder =
      vscode.workspace.getConfiguration("NugetGallery").get<string>("credentialProviderFolder") ??
      "";
    if (!(url in this._sourceApiCollection))
      this._sourceApiCollection[url] = new NuGetApi(url, credentialProviderFolder);

    return this._sourceApiCollection[url];
  }
}

export default new NuGetApiFactory();
