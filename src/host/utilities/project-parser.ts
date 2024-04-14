import fs from "fs";
import { DOMParser } from "xmldom";
import xpath from "xpath";
import * as path from "path";

export default class ProjectParser {
  static Parse(projectPath: string): Project {
    let projectContent = fs.readFileSync(projectPath, "utf8");
    let document = new DOMParser().parseFromString(projectContent);
    if (document == undefined) throw `${projectPath} has invalid content`;

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
