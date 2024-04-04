import { observable } from "@microsoft/fast-element";

export class PackageViewModel {
  Id: string;
  Name: string;
  private _authors: Array<string>;
  Description: string;
  IconUrl: string;
  LicenseUrl: string;
  TotalDownloads: number;
  Verified: boolean;
  Version: string;
  Versions: Array<string>;
  @observable Selected: boolean = false;

  constructor(model: Package) {
    this._authors = model.Authors;
    this.Id = model.Id;
    this.Name = model.Name;
    this.Description = model.Description;
    this.IconUrl = model.IconUrl;
    this.LicenseUrl = model.LicenseUrl;
    this.TotalDownloads = model.TotalDownloads;
    this.Verified = model.Verified;
    this.Version = model.Version;
    this.Versions = model.Versions;
  }

  get Authors() {
    return "@" + this._authors.join(",");
  }
}
