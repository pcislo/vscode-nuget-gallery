import { FASTElement, attr, css, customElement, html } from "@microsoft/fast-element";

const template = html<ProjectRow>`
  <div class="project-row">
    <div class="project-title">
      <span class="name">${(x) => x.project.Name}</span>
    </div>
    <div>install</div>
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
    }
  }
`;

@customElement({
  name: "project-row",
  template,
  styles: [styles],
})
export class ProjectRow extends FASTElement {
  @attr project!: Project;
}
