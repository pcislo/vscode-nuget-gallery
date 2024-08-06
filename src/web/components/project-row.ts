import {
  FASTElement,
  attr,
  css,
  customElement,
  html,
  observable,
  volatile,
  when,
} from "@microsoft/fast-element";

import codicon from "@/web/styles/codicon.css";
import { IMediator } from "../registrations";
import { UPDATE_PROJECT } from "@/common/messaging/core/commands";
import { ProjectPackageViewModel, ProjectViewModel } from "../types";
import ObservableDictionary from "../utilities/ObservableDictionary";

const template = html<ProjectRow>`
  <div class="project-row">
    <div class="project-title">
      <span class="name">${(x) => x.project.Name}</span>
    </div>
    <div class="project-actions">
      ${when(
        (x) => x.loaders.Get(x.packageId) === true,
        html<ProjectRow>`<vscode-progress-ring class="loader"></vscode-progress-ring>`,
        html<ProjectRow>`
          <span class="version">${(x) => x.ProjectPackage?.Version}</span>
          ${when(
            (x) => x.ProjectPackage !== undefined,
            html<ProjectRow>`
              ${when(
                (x) =>
                  x.ProjectPackage?.Version != x.packageVersion &&
                  x.ProjectPackage?.Version != undefined,
                html<ProjectRow>`
                  <vscode-button appearance="icon">
                    <span
                      class="codicon codicon-arrow-circle-up"
                      @click=${(x) => x.Update("INSTALL")}
                    ></span>
                  </vscode-button>
                `
              )}
              <vscode-button appearance="icon">
                <span
                  class="codicon codicon-diff-removed"
                  @click=${(x) => x.Update("UNINSTALL")}
                ></span>
              </vscode-button>
            `,
            html<ProjectRow>`
              <vscode-button appearance="icon">
                <span
                  class="codicon codicon-diff-added"
                  @click=${(x) => x.Update("INSTALL")}
                ></span>
              </vscode-button>
            `
          )}
        `
      )}
    </div>
  </div>
`;
const styles = css`
  .project-row {
    margin: 2px;
    padding: 3px;
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: space-between;
    cursor: default;

    &:hover {
      background-color: var(--vscode-list-hoverBackground);
    }

    .project-title {
      overflow: hidden;
      text-overflow: ellipsis;
      .name {
        font-weight: bold;
      }
    }
    .project-actions {
      display: flex;
      gap: 3px;
      align-items: center;

      .loader {
        padding: 3px;
        height: 16px;
        width: 16px;
      }

      .version {
      }
    }
  }
`;

@customElement({
  name: "project-row",
  template,
  styles: [codicon, styles],
})
export class ProjectRow extends FASTElement {
  @IMediator mediator!: IMediator;
  @attr project!: ProjectViewModel;
  @attr packageId!: string;
  @attr packageVersion!: string;
  @observable loaders: ObservableDictionary<boolean> = new ObservableDictionary<boolean>();

  @volatile
  get ProjectPackage() {
    let projectPackage = this.project.Packages.find((x) => x.Id == this.packageId);
    return projectPackage;
  }

  async Update(type: "INSTALL" | "UNINSTALL") {
    let request: UpdateProjectRequest = {
      Type: type,
      ProjectPath: this.project.Path,
      PackageId: this.packageId,
      Version: this.packageVersion,
    };
    this.loaders.Add(request.PackageId, true);
    let result = await this.mediator.PublishAsync<UpdateProjectRequest, UpdateProjectResponse>(
      UPDATE_PROJECT,
      request
    );
    this.project.Packages = result.Project.Packages.map((x) => new ProjectPackageViewModel(x));
    this.loaders.Remove(request.PackageId);
    this.$emit("project-updated");
  }
}
