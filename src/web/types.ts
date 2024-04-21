import nonce from "@/common/nonce";
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
    this.Versions = model.Versions.reverse();
  }

  get Authors() {
    return "@" + this._authors.join(",");
  }
}

export class ProjectViewModel {
  Name: string;
  Path: string;
  @observable Packages: ProjectPackageViewModel[];

  constructor(model: Project) {
    this.Name = model.Name;
    this.Path = model.Path;
    this.Packages = model.Packages.map((x) => new ProjectPackageViewModel(x));
  }
}

export class ProjectPackageViewModel {
  Id: string;
  Version: string;

  constructor(model: ProjectPackage) {
    this.Id = model.Id;
    this.Version = model.Version;
  }
}

export class SourceViewModel {
  Id: number = 0;
  @observable Name: string = "";
  @observable Url: string = "";
  @observable DraftName: string = "";
  @observable DraftUrl: string = "";
  @observable EditMode: boolean = false;
  Editable: boolean = true;

  constructor(model: Source | null = null) {
    this.Id = nonce();
    this.Name = model?.Name ?? "";
    this.Url = model?.Url ?? "";
  }

  Edit() {
    this.DraftName = this.Name;
    this.DraftUrl = this.Url;
    this.EditMode = true;
  }
  Cancel() {
    this.EditMode = false;
  }
  Save() {
    this.Name = this.DraftName;
    this.Url = this.DraftUrl;
    this.EditMode = false;
  }
  GetModel(): Source {
    let model: Source = {
      Name: this.Name,
      Url: this.Url,
    };
    return model;
  }
}
