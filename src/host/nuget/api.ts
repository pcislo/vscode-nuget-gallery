import axios from "axios";

const API_URL: string = "https://api.nuget.org/v3/index.json";

type Response = {
  data: Array<Package>;
};

export default class NuGetApi {
  private _searchUrl: string = "";

  constructor(private readonly _url: string) {}

  async GetPackagesAsync(
    filter: string,
    prerelease: boolean,
    skip: number,
    take: number
  ): Promise<Response> {
    await this.EnsureSearchUrl();

    let result = await axios.get(this._searchUrl, {
      params: {
        q: filter,
        take: take,
        skip: skip,
        prerelease: prerelease,
      },
    });
    const mappedData: Response["data"] = result.data.data.map((item: any) => ({
      id: item["@id"] || "",
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
    let response = await axios.get(this._url);
    let resource = response.data.resources.find((x: any) =>
      x["@type"].includes("SearchQueryService")
    );
    if (resource != null) this._searchUrl = resource["@id"];
    else throw "Search url couldn't be found";
  }
}
