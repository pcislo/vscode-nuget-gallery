import { IRequestHandler } from "../../common/messaging/types";

class ListProjectsRequest {}

class ListProjectsResponse {}

export class ListProjects implements IRequestHandler<ListProjectsRequest, ListProjectsResponse> {
  Handle(request: ListProjectsRequest): Promise<ListProjectsResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(
        () =>
          resolve([
            { name: "test", version: 1 },
            { name: "test 2", version: 2 },
          ]),
        2000
      );
    });
  }
}
