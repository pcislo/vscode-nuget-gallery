type GetPackagesRequest = {
  Url: string;
  Filter: string;
  Prerelease: boolean;
  Skip: number;
  Take: number;
};

type GetPackagesResponse = {
  Packages: Array<Package>;
};
