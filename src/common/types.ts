type Package = {
  Id: string;
  Name: string;
  Authors: Array<string>;
  Description: "string";
  IconUrl: string;
  LicenseUrl: string;
  TotalDownloads: number;
  Verified: boolean;
  Version: string;
  Versions: Array<string>;
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
