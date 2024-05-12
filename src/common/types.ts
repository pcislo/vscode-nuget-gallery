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
