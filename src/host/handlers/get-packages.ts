import { IRequestHandler } from "@/common/messaging/core/types";
import NuGetApi from "../nuget/api";

type SourceApiCollection = {
  [url: string]: NuGetApi;
};

export class GetPackages implements IRequestHandler<GetPackagesRequest, GetPackagesResponse> {
  private readonly _sourceApiCollection: SourceApiCollection = {};

  async HandleAsync(request: GetPackagesRequest): Promise<GetPackagesResponse> {
    let api = this.GetSourceApi(request.Url);
    let packages = await api.GetPackagesAsync(
      request.Filter,
      request.Prerelease,
      request.Skip,
      request.Take
    );
    let result: GetPackagesResponse = {
      Packages: packages.data,
    };
    return result;
  }

  private GetSourceApi(url: string) {
    if (!(url in this._sourceApiCollection)) this._sourceApiCollection[url] = new NuGetApi(url);

    return this._sourceApiCollection[url];
  }
}
