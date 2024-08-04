import nonce from "@/common/nonce";
import { observable } from "@microsoft/fast-element";

type PackageViewModelStatus = "Detailed" | "MissingDetails" | "Error";

export class PackageViewModel {
  Id: string;
  Name: string;
  Model: Package;
  private _authors: Array<string>;
  private _tags: Array<string>;
  @observable Description: string;
  @observable IconUrl: string;
  @observable LicenseUrl: string;
  @observable ProjectUrl: string;
  @observable TotalDownloads: number;
  @observable Verified: boolean;
  @observable Version: string;
  @observable Versions: Array<string>;
  @observable Status: PackageViewModelStatus;
  @observable Selected: boolean = false;

  constructor(model: Package, status: PackageViewModelStatus = "Detailed") {
    this._authors = model.Authors;
    this.Id = model.Id;
    this.Name = model.Name;
    this.Description = model.Description;
    this.IconUrl = model.IconUrl;
    this.LicenseUrl = model.LicenseUrl;
    this.ProjectUrl = model.ProjectUrl;
    this.TotalDownloads = model.TotalDownloads;
    this.Verified = model.Verified;
    this.Version = model.Version;
    this.Versions = model.Versions?.map((x) => x.Version).reverse() ?? [];
    this._tags = model.Tags;
    this.Model = model;
    this.Status = status;
  }

  UpdatePackage(model: Package) {
    this._authors = model.Authors;
    this.Id = model.Id;
    this.Name = model.Name;
    this.Description = model.Description;
    this.IconUrl = model.IconUrl;
    this.LicenseUrl = model.LicenseUrl;
    this.ProjectUrl = model.ProjectUrl;
    this.TotalDownloads = model.TotalDownloads;
    this.Verified = model.Verified;
    if (model.Version != "") this.Version = model.Version;
    this.Versions = model.Versions?.map((x) => x.Version).reverse() ?? [];
    this._tags = model.Tags;
    this.Model = model;
  }

  get Authors() {
    if (Array.isArray(this._authors)) {
      return this._authors.length ? this._authors.join(", ") : "";
    } else if (typeof this._authors === "string") {
      return this._authors;
    } else {
      console.log("Invalid type for _authors:", this._authors);
    }
    return "";
  }

  get Tags() {
    if (Array.isArray(this._tags)) {
      return this._tags.length ? this._tags.join(", ") : "";
    } else if (typeof this._tags === "string") {
      return this._tags;
    } else {
      console.log("Invalid type for _tags:", this._tags);
    }
    return "";
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
