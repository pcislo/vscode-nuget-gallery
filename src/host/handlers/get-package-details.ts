import { IRequestHandler } from "@/common/messaging/core/types";
import nugetApiFactory from "../nuget/api-factory";
import * as vscode from "vscode";

export class GetPackageDetails
  implements IRequestHandler<GetPackageDetailsRequest, GetPackageDetailsResponse>
{
  async HandleAsync(request: GetPackageDetailsRequest): Promise<GetPackageDetailsResponse> {
    if (!request.SourceUrl) return this.GetError("SourceUrl is empty");
    if (!request.PackageVersionUrl) return this.GetError("PackageVersionUrl is empty");

    let api = nugetApiFactory.GetSourceApi(request.SourceUrl);
    try {
      let packageDetails = await api.GetPackageDetailsAsync(request.PackageVersionUrl);
      let result: GetPackageDetailsResponse = {
        IsFailure: false,
        Package: packageDetails.data,
      };
      return result;
    } catch (err: any) {
      console.error(err);
      vscode.window.showErrorMessage(
        `Failed to fetch packages: ${err.message}`,
      );
      return this.GetError('Failed to fetch package details');
    }
  }

  private GetError(error: string): GetPackageDetailsResponse {
    let result: GetPackageDetailsResponse = {
      IsFailure: true,
      Error: {
        Message: error,
      },
    };
    return result;
  }
}
