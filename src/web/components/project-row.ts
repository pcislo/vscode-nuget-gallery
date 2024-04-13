import {
  FASTElement,
  attr,
  css,
  customElement,
  html,
  volatile,
  when,
} from "@microsoft/fast-element";

import codicon from "@/web/styles/codicon.css";

const template = html<ProjectRow>`
  <div class="project-row">
    <div class="project-title">
      <span class="name">${(x) => x.project.Name}</span>
    </div>
    <div class="project-actions">
      <span class="version">${(x) => x.ProjectPackage?.Version}</span>
      ${when(
        (x) => x.ProjectPackage !== undefined,
        html<ProjectRow>`
          ${when(
            (x) => x.ProjectPackage?.Version != x.packageVersion,
            html<ProjectRow>`
              <vscode-button appearance="icon">
                <span class="codicon codicon-arrow-circle-up"></span>
              </vscode-button>
            `
          )}
          <vscode-button appearance="icon">
            <span class="codicon codicon-diff-removed"></span>
          </vscode-button>
        `,
        html<ProjectRow>`
          <vscode-button appearance="icon">
            <span class="codicon codicon-diff-added"></span>
          </vscode-button>
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

      .version {
        font-weight: bold;
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
  @attr project!: Project;
  @attr packageId!: string;
  @attr packageVersion!: string;

  @volatile
  get ProjectPackage() {
    let projectPackage = this.project.Packages.find((x) => x.Id == this.packageId);
    return projectPackage;
  }
}
