import * as vscode from "vscode";
import { IRequestHandler } from "../../common/messaging/core/types";
import ProjectParser from "../utilities/project-parser";


export class GetProjects implements IRequestHandler<GetProjectsRequest, GetProjectsResponse> {
  async HandleAsync(request: GetProjectsRequest): Promise<GetProjectsResponse> {
    let projectFiles = await vscode.workspace.findFiles(
      "**/*.{csproj,fsproj,vbproj}",
      "**/node_modules/**"
    );

    let projects: Array<Project> = Array();
    projectFiles
      .map((x) => x.fsPath)
      .forEach((x) => {
        try {
          let project = ProjectParser.Parse(x);
          projects.push(project);
        } catch (e) {
          console.error(e);
        }
      });
    let compareName = (nameA: string, nameB: string) => {
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    };
    let sortedProjects = projects.sort((a, b) =>
      compareName(a.Name?.toLowerCase(), b.Name?.toLowerCase())
    );

    let response: GetProjectsResponse = {
      Projects: sortedProjects,
    };
    return response;
  }
}
