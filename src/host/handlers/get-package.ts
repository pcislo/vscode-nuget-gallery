import { IRequestHandler } from "@/common/messaging/core/types";
import { AxiosError } from "axios";
import nugetApiFactory from "../nuget/api-factory";
import * as vscode from "vscode";

export class GetPackage implements IRequestHandler<GetPackageRequest, GetPackageResponse> {
  async HandleAsync(request: GetPackageRequest): Promise<GetPackageResponse> {
    let api = nugetApiFactory.GetSourceApi(request.Url);
    try {
      let packageResult = await api.GetPackageAsync(request.Id);

      if (packageResult.isError) {
        return {
          IsFailure: true,
          Error: {
            Message: "Failed to fetch package",
          },
        };
      }

      let result: GetPackageResponse = {
        IsFailure: false,
        Package: packageResult.data,
      };
      return result;
    } catch (err) {
      console.error(err, (err as AxiosError)?.response?.data);
      vscode.window.showErrorMessage(
        `Failed to fetch package: ${(err as { message: string })?.message}`
      );
      let result: GetPackageResponse = {
        IsFailure: true,
        Error: {
          Message: "Failed to fetch package",
        },
      };
      return result;
    }
  }
}
