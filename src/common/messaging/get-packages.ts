type GetPackagesRequest = {
  Url: string;
  Filter: string;
  Prerelease: boolean;
  Skip: number;
  Take: number;
};

type GetPackagesResponse = {
  IsFailure: boolean;
  Packages?: Array<Package>;
  Error?: HttpError;
};
