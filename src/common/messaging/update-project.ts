type UpdateType = "INSTALL" | "UNINSTALL";

type UpdateProjectRequest = {
  ProjectPath: string;
  PackageId: string;
  Version?: string;
  Type: UpdateType;
};

type UpdateProjectResponse = {
  Project: Project;
};
