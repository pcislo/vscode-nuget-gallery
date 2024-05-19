type GetPackageDetailsRequest = {
  PackageVersionUrl: string;
  SourceUrl: string;
};

type GetPackageDetailsResponse = {
  IsFailure: boolean;
  Package?: PackageDetails;
  Error?: HttpError;
};
