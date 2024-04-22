import { IRequestHandler } from "@/common/messaging/core/types";
import NuGetApi from "../nuget/api";
import { AxiosError } from "axios";
import * as vscode from "vscode";

type SourceApiCollection = {
  [url: string]: NuGetApi;
};

export class GetPackages implements IRequestHandler<GetPackagesRequest, GetPackagesResponse> {
  private readonly _sourceApiCollection: SourceApiCollection = {};

  async HandleAsync(request: GetPackagesRequest): Promise<GetPackagesResponse> {
    let api = this.GetSourceApi(request.Url);
    try {
      let packages = await api.GetPackagesAsync(
        request.Filter,
        request.Prerelease,
        request.Skip,
        request.Take
      );
      let result: GetPackagesResponse = {
        IsFailure: false,
        Packages: packages.data,
      };
      return result;
    } catch (err) {
      console.error(err, (err as AxiosError)?.response?.data);
      vscode.window.showErrorMessage(`Failed to fetch packages: ${(err as AxiosError)?.message}`);
      let result: GetPackagesResponse = {
        IsFailure: true,
        Error: {
          Message: (err as AxiosError)?.message,
        },
      };
      return result;
    }
  }

  private GetSourceApi(url: string) {
    if (!(url in this._sourceApiCollection)) this._sourceApiCollection[url] = new NuGetApi(url);

    return this._sourceApiCollection[url];
  }
}
