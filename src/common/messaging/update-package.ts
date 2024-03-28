type UpdateType = "INSTALL" | "UNINSTALL";

type UpdatePackageRequest = {
  Project: string;
  Package: string;
  Version: string;
  Type: UpdateType;
};

type UpdatePackageResponse = {};
