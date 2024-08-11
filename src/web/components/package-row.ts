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
import { PackageViewModel } from "../types";
import codicon from "@/web/styles/codicon.css";

const template = html<PackageRow>`
<div class="package-row ${(x) =>
  x.package.Selected ? "package-row-selected" : ""}">
    <div class="package-title">
    <img class="icon" src=${(x) => x.IconUrl} @error="${(x) =>
  (x.iconUrl =
    "https://nuget.org/Content/gallery/img/default-package-icon.svg")}"></img> 
    <div class="title">
    <span class="name">${(x) => x.package.Name}</span>
    ${when(
      (x) => x.package.Authors,
      html<PackageRow>`<span class="authors"
        >@${(x) => x.package.Authors}</span
      >`
    )}
    </div>
    </div>
    <div class="package-version"> ${when(
      (x) => x.showInstalledVersion,
      html<PackageRow>`
        ${(x) => x.package.InstalledVersion}
        ${when(
          (x) => x.package.Status == "MissingDetails",
          html<PackageRow>`<vscode-progress-ring
            class="loader"
          ></vscode-progress-ring>`,
          html<PackageRow>`${when(
            (x) =>
              x.package.Status == "Detailed" &&
              x.package.Version != x.package.InstalledVersion,
            html<PackageRow>`<span
              class="codicon codicon-arrow-circle-up"
            ></span>`
          )}`
        )}
      `,
      html<PackageRow>`${(x) => x.package.Version}`
    )}
    </div>
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
      display: flex;
      align-items: center;
      gap: 3px;
      .loader {
        height: 12px;
      }
    }
  }
`;

@customElement({
  name: "package-row",
  template,
  styles: [codicon, styles],
})
export class PackageRow extends FASTElement {
  @attr showInstalledVersion!: boolean;
  @attr package!: PackageViewModel;
  @observable iconUrl: string | null = null;

  @volatile
  get IconUrl() {
    if (!this.package.IconUrl)
      this.iconUrl =
        "https://nuget.org/Content/gallery/img/default-package-icon.svg";
    return this.iconUrl ?? this.package.IconUrl;
  }
}
