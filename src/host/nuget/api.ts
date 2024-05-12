import axios, { AxiosInstance } from "axios";
import _ from "lodash";
const execSync = require("child_process").execSync;
import * as vscode from "vscode";
import TaskExecutor from "../utilities/task-executor";
import os from "os";

type Response = {
  data: Array<Package>;
};

export default class NuGetApi {
  private _searchUrl: string = "";
  private _token: string | null = null;
  private http: AxiosInstance = axios.create();

  constructor(private readonly _url: string, private readonly _credentialProviderFolder: string) {
    this.http.interceptors.request.use((x) => {
      if (this._token != null) x.headers["Authorization"] = `Basic ${this._token}`;
      return x;
    });

    this.http.interceptors.response.use(null, async (x) => {
      if (x.response?.status != 401) return x;
      let credentials = await this.GetCredentials();
      this._token = btoa(`${credentials.Username}:${credentials.Password}`);
      return this.http(x.config);
    });
  }

  async GetPackagesAsync(
    filter: string,
    prerelease: boolean,
    skip: number,
    take: number
  ): Promise<Response> {
    await this.EnsureSearchUrl();

    let result = await this.http.get(this._searchUrl, {
      params: {
        q: filter,
        take: take,
        skip: skip,
        prerelease: prerelease,
      },
    });
    const mappedData: Response["data"] = result.data.data.map((item: any) => ({
      Id: item["@id"] || "",
      Name: item.id || "",
      Authors: item.authors || [],
      Description: item.description || "",
      IconUrl: item.iconUrl || "",
      LicenseUrl: item.licenseUrl || "",
      TotalDownloads: item.totalDownloads || 0,
      Verified: item.verified || false,
      Version: item.version || "",
      Versions: item.versions.map((v: any) => v.version) || [],
    }));

    return {
      data: mappedData,
    };
  }

  private async EnsureSearchUrl() {
    if (this._searchUrl !== "") return;
    try {
      let response = await this.http.get(this._url);
      let resource = response.data.resources.find((x: any) =>
        x["@type"].includes("SearchQueryService")
      );
      if (resource != null) this._searchUrl = resource["@id"];
      else throw { message: "Search url couldn't be found" };
    } catch (err: any) {
      console.error(err);
      if (err.credentialProviderError == true) throw { message: err.message };
      throw { message: "Search url couldn't be found" };
    }
  }

  private async GetCredentials(): Promise<Credentials> {
    let credentialProviderFolder = _.trimEnd(
      _.trimEnd(this._credentialProviderFolder.replace("{user-profile}", os.homedir()), "/"),
      "\\"
    );

    let credentialProviderExecutable =
      process.platform === "win32"
        ? credentialProviderFolder + "/CredentialProvider.Microsoft.exe"
        : credentialProviderFolder + "/CredentialProvider.Microsoft.dll";

    let command = `"${credentialProviderExecutable}"`;
    if (process.platform !== "win32") {
      command = `dotnet "${credentialProviderExecutable}"`;
    }
    try {
      let result = null;
      try {
        result = execSync(command + " -N -F Json -U " + this._url, { timeout: 10000 });
      } catch {
        let interactiveLoginTask = new vscode.Task(
          { type: "nuget", task: `CredentialProvider.Microsoft` },
          vscode.TaskScope.Workspace,
          "nuget-gallery-credentials",
          "CredentialProvider.Microsoft",
          new vscode.ProcessExecution(command, ["-C", "False", "-R", "-U", this._url])
        );

        await TaskExecutor.ExecuteTask(interactiveLoginTask);
        result = execSync(command + " -N -F Json -U " + this._url, { timeout: 10000 });
      }
      let parsedResult = JSON.parse(result) as { Username: string; Password: string };
      return parsedResult;
    } catch (err) {
      console.error(err);
      throw {
        credentialProviderError: true,
        message: "Failed to fetch credentials. See 'Webview Developer Tools' for more details",
      };
    }
  }
}
