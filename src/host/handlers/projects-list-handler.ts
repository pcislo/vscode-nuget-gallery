import { IRequestHandler } from "../../common/messaging/types";

class ProjectsListRequest {}

class ProjectsListResponse {}

class ProjectsListHandler
  implements IRequestHandler<ProjectsListRequest, ProjectsListResponse>
{
  Handle(request: ProjectsListRequest): ProjectsListResponse {
    throw new Error("Method not implemented.");
  }
}
