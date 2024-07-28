import axios, { AxiosInstance } from "axios";
import _ from "lodash";
const execSync = require("child_process").execSync;
import * as vscode from "vscode";
import TaskExecutor from "../utilities/task-executor";
import os from "os";

type GetPackagesResponse = {
  data: Array<Package>;
};

type GetPackageDetailsResponse = {
  data: PackageDetails;
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
  ): Promise<GetPackagesResponse> {
    await this.EnsureSearchUrl();

    let result = await this.http.get(this._searchUrl, {
      params: {
        q: filter,
        take: take,
        skip: skip,
        prerelease: prerelease,
      },
    });
    const mappedData: Array<Package> = result.data.data.map((item: any) => ({
      Id: item["@id"] || "",
      Name: item.id || "",
      Authors: item.authors || [],
      Description: item.description || "",
      IconUrl: item.iconUrl || "",
      Registration: item.registration || "",
      LicenseUrl: item.licenseUrl || "",
      ProjectUrl: item.projectUrl || "",
      TotalDownloads: item.totalDownloads || 0,
      Verified: item.verified || false,
      Version: item.version || "",
      Versions:
        item.versions.map((v: any) => ({
          Version: v.version,
          Id: v["@id"],
        })) || [],
      Tags: item.tags || [],
    }));

    return {
      data: mappedData,
    };
  }

  async GetPackageDetailsAsync(packageVersionUrl: string): Promise<GetPackageDetailsResponse> {
    await this.EnsureSearchUrl();
    let packageVersion = await this.http.get(packageVersionUrl);

    if (!packageVersion.data?.catalogEntry)
      return {
        data: {
          dependencies: {
            frameworks: {},
          },
        },
      };

    let result = await this.http.get(packageVersion.data.catalogEntry);
    let packageDetails: PackageDetails = {
      dependencies: {
        frameworks: {},
      },
    };

    result.data.dependencyGroups?.forEach((dependencyGroup: any) => {
      let targetFramework = dependencyGroup.targetFramework;
      packageDetails.dependencies.frameworks[targetFramework] = [];
      dependencyGroup.dependencies?.forEach((dependency: any) => {
        packageDetails.dependencies.frameworks[targetFramework].push({
          package: dependency.id,
          versionRange: dependency.range,
        });
      });
      if (packageDetails.dependencies.frameworks[targetFramework].length == 0)
        delete packageDetails.dependencies.frameworks[targetFramework];
    });

    return { data: packageDetails };
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

    let command = null;
    if (process.platform === "win32") {
      command = credentialProviderFolder + "\\CredentialProvider.Microsoft.exe";
    } else {
      command = `dotnet "${credentialProviderFolder}/CredentialProvider.Microsoft.dll"`;
    }
    try {
      let result = null;
      try {
        result = execSync(command + " -I -N -F Json -U " + this._url, { timeout: 10000 });
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
