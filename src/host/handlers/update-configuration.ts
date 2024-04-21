import { IRequestHandler } from "@/common/messaging/core/types";
import * as vscode from "vscode";
export default class UpdateConfiguration
  implements IRequestHandler<UpdateConfigurationRequest, UpdateConfigurationResponse>
{
  async HandleAsync(request: UpdateConfigurationRequest): Promise<UpdateConfigurationResponse> {
    let config = vscode.workspace.getConfiguration("NugetGallery");

    let sources = request.Configuration.Sources.map((x) =>
      JSON.stringify({ name: x.Name, url: x.Url })
    );

    config.update(
      "credentialProviderFolder",
      request.Configuration.CredentialProviderFolder,
      vscode.ConfigurationTarget.Global
    );
    config.update("sources", sources, vscode.ConfigurationTarget.Global);
    return {};
  }
}
