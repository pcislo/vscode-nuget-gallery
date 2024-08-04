type GetPackageRequest = {
  Url: string;
  Id: string;
};

type GetPackageResponse = {
  IsFailure: boolean;
  Package?: Package;
  Error?: HttpError;
};
