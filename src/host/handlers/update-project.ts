import { IRequestHandler } from "@/common/messaging/core/types";
import * as vscode from "vscode";
import ProjectParser from "../utilities/project-parser";
import TaskExecutor from "../utilities/task-executor";

export default class UpdateProject implements IRequestHandler<UpdateProjectRequest, UpdateProjectResponse> {
  async HandleAsync(request: UpdateProjectRequest): Promise<UpdateProjectResponse> {
    let skipRestore = vscode.workspace.getConfiguration("NugetGallery").get<string>("skipRestore") ?? "";
    let command = request.Type == "UNINSTALL" ? "remove" : "add";
    let args: Array<string> = [command, request.ProjectPath.replace(/\\/g, "/"), "package", request.PackageId];
    if (request.Type !== "UNINSTALL") {
      args.push("-v");
      args.push(request.Version!);
      if (skipRestore) args.push("--no-restore");
      // args.push("-s");
      // args.push(message.source);
    }

    let task = new vscode.Task(
      { type: "dotnet", task: `dotnet add/remove package` },
      vscode.TaskScope.Workspace,
      "nuget-gallery",
      "dotnet",
      new vscode.ShellExecution("dotnet", args)
    );
    task.presentationOptions.reveal = vscode.TaskRevealKind.Silent;

    await TaskExecutor.ExecuteTask(task);

    let updatedProject = ProjectParser.Parse(request.ProjectPath);
    let result: UpdateProjectResponse = {
      Project: updatedProject,
    };
    return result;
  }
}
