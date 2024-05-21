type Package = {
  Id: string;
  Name: string;
  Authors: Array<string>;
  Description: "string";
  IconUrl: string;
  LicenseUrl: string;
  ProjectUrl: string;
  Registration: string;
  TotalDownloads: number;
  Verified: boolean;
  Version: string;
  Versions: Array<PackageVersion>;
  Tags: Array<string>;
};

type PackageVersion = {
  Version: string;
  Id: string;
};

type PackageDetails = {
  dependencies: PackageDependencyGroup;
};

type PackageDependencyGroup = {
  frameworks: { [id: string]: Array<PackageDependency> };
};

type PackageDependency = {
  package: string;
  versionRange: string;
};

type ProjectPackage = {
  Id: string;
  Version: string;
};

type Project = {
  Name: string;
  Path: string;
  Packages: Array<ProjectPackage>;
};

type Source = {
  Name: string;
  Url: string;
};

type Configuration = {
  CredentialProviderFolder: string;
  Sources: Array<Source>;
};

type HttpError = {
  Message: string;
};

type Credentials = {
  Username: string;
  Password: string;
};
