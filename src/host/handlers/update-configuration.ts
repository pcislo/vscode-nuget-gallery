import { IRequestHandler } from "@/common/messaging/core/types";
import * as vscode from "vscode";
import nugetApiFactory from "../nuget/api-factory";

export default class UpdateConfiguration
  implements IRequestHandler<UpdateConfigurationRequest, UpdateConfigurationResponse>
{
  async HandleAsync(request: UpdateConfigurationRequest): Promise<UpdateConfigurationResponse> {
    let config = vscode.workspace.getConfiguration("NugetGallery");

    let sources = request.Configuration.Sources
      .filter((x) => !x.IsReadOnly)
      .map((x) => JSON.stringify({ name: x.Name, url: x.Url }));

    await config.update(
      "credentialProviderFolder",
      request.Configuration.CredentialProviderFolder,
      vscode.ConfigurationTarget.Global
    );
    await config.update("skipRestore", request.Configuration.SkipRestore, vscode.ConfigurationTarget.Global);
    await config.update("sources", sources, vscode.ConfigurationTarget.Global);

    nugetApiFactory.Invalidate();
    return {};
  }
}
