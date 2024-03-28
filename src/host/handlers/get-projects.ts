import * as vscode from "vscode";
import { IRequestHandler } from "../../common/messaging/core/types";
import fs from "fs";
import { DOMParser } from "xmldom";
import xpath from "xpath";
import * as path from "path";

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
        let project = this.parseProject(x);
        projects.push(project);
      });
    let sortedProjects = projects.sort((a, b) => (a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0));
    let response: GetProjectsResponse = {
      Projects: sortedProjects,
    };
    return response;
  }

  parseProject(projectPath: string): Project {
    let projectContent = fs.readFileSync(projectPath, "utf8");
    let document = new DOMParser().parseFromString(projectContent);
    let packagesReferences = xpath.select("//ItemGroup/PackageReference", document) as Node[];
    let project: Project = {
      Path: projectPath,
      Name: path.basename(projectPath),
      Packages: Array(),
    };

    (packagesReferences || []).forEach((p: any) => {
      let version = p.attributes?.getNamedItem("Version");
      if (version) {
        version = version.value;
      } else {
        version = xpath.select("string(Version)", p);
        if (!version) {
          version = null;
        }
      }
      let projectPackage: ProjectPackage = {
        Id: p.attributes?.getNamedItem("Include").value,
        Version: version,
      };
      project.Packages.push(projectPackage);
    });

    return project;
  }
}
