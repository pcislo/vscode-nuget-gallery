import {
  FASTElement,
  attr,
  css,
  customElement,
  html,
  observable,
  volatile,
} from "@microsoft/fast-element";
import { PackageViewModel } from "../types";

const template = html<PackageRow>`
<div class="package-row ${(x) => (x.package.Selected ? "package-row-selected" : "")}">
    <div class="package-title">
    <img class="icon" src=${(x) => x.IconUrl} @error="${(x) =>
  (x.iconUrl = "https://nuget.org/Content/gallery/img/default-package-icon.svg")}"></img> 
    <div class="title">
    <span class="name">${(x) => x.package.Name}</span>
    <span class="authors">@${(x) => x.package.Authors}</span></div> 
    </div>
    <div class="package-version"> ${(x) => x.package.Version} </div>
</div>
`;
const styles = css`
  .package-row {
    margin: 2px;
    padding: 3px;
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: space-between;
    cursor: default;

    &.package-row-selected {
      background-color: var(--vscode-list-inactiveSelectionBackground);
    }

    &:hover {
      background-color: var(--vscode-list-hoverBackground);
    }

    .package-title {
      display: flex;
      gap: 4px;
      align-items: center;
      flex: 1;
      overflow: hidden;
      .title {
        overflow: hidden;
        white-space: nowrap;

        text-overflow: ellipsis;
      }
      .icon {
        width: 18px;
        height: 18px;
      }
      .name {
        font-weight: bold;
      }

      .authors {
      }
    }

    .package-version {
      font-weight: bold;
      white-space: nowrap;
    }
  }
`;

@customElement({
  name: "package-row",
  template,
  styles: [styles],
})
export class PackageRow extends FASTElement {
  @attr package!: PackageViewModel;
  @observable iconUrl: string | null = null;

  @volatile
  get IconUrl() {
    if (this.package.IconUrl == "")
      this.iconUrl = "https://nuget.org/Content/gallery/img/default-package-icon.svg";
    return this.iconUrl ?? this.package.IconUrl;
  }
}
