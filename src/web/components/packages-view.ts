import {
  FASTElement,
  customElement,
  attr,
  html,
  css,
  repeat,
  observable,
  when,
  ExecutionContext,
} from "@microsoft/fast-element";

import Split from "split.js";
import lodash from "lodash";
import { IMediator } from "@/web/registrations";
import { GET_PACKAGES, GET_PROJECTS } from "@/common/messaging/core/commands";
import codicon from "@/web/styles/codicon.css";
import { scrollableBase } from "@/web/styles/base.css";
import { PackageViewModel } from "../types";

const template = html<PackagesView>`
  <div class="container">
    <div class="col" id="packages">
      <div class="search-bar">
        <div class="search-bar-left">
          <vscode-text-field
            class="search-text-field"
            @input=${(x, c) => x.FilterInputEvent(c.event.target!)}
          >
            <span slot="start" class="codicon codicon-search"></span>
          </vscode-text-field>
          <vscode-button appearance="icon" @click=${(x) => x.LoadPackages()}>
            <span class="codicon codicon-refresh"></span>
          </vscode-button>
        </div>
        <div class="search-bar-right">
          <vscode-dropdown>
            <vscode-option>nuget.org</vscode-option>
          </vscode-dropdown>
          <vscode-checkbox
            :checked="${(x) => x.prerelase}"
            @change=${(x, c) => x.PrerelaseChangedEvent(c.event.target!)}
            >Prerelease</vscode-checkbox
          >
        </div>
      </div>
      ${when(
        (x) => x.packagesLoading,
        html<PackagesView>` <vscode-progress-ring class="loader"></vscode-progress-ring> `,
        html<PackagesView>`
          <div class="packages-container">
            ${repeat(
              (x) => x.packages,
              html<PackageViewModel>`
                <package-row
                  :package=${(x) => x}
                  @click=${(x, c: ExecutionContext<PackagesView, any>) => c.parent.SelectPackage(x)}
                >
                </package-row>
              `
            )}
          </div>
        `
      )}
    </div>
    <div class="col" id="projects">
      ${(x) => x.selectedPackage?.Name}
      <ul>
        ${repeat((x) => x.projects, html<Project>` <li>${(x) => x.Name}</li> `)}
      </ul>
    </div>
    <div></div>
  </div>
`;

const styles = css`
  .container {
    display: flex;
    height: 100%;

    .col {
      overflow: hidden;
    }

    .search-bar {
      display: flex;
      gap: 10px;
      justify-content: space-between;
      margin-bottom: 10px;

      .search-bar-left {
        flex: 1;
        display: flex;
        gap: 4px;
        .search-text-field {
          flex: 1;
          max-width: 340px;
          min-width: 140px;
        }
      }
      .search-bar-right {
        display: flex;
        gap: 10px;
      }
    }

    .gutter {
      display: flex;
      margin: 0 6px;
      justify-content: center;
      transition: background-color 0.1s ease-out;

      &:hover {
        cursor: col-resize;
        background-color: var(--vscode-sash-hoverBorder);
      }
    }

    .gutter-nested {
      width: 1px;
      background-color: var(--vscode-panelSection-border);
    }

    #packages {
      display: flex;
      flex-direction: column;
      .loader {
        align-self: center;
        flex: 1;
      }
      .packages-container {
        overflow-y: auto;

        .package {
          margin-bottom: 3px;
        }
      }
    }

    #projects {
      overflow-y: auto;
    }
  }
`;

@customElement({
  name: "packages-view",
  template,
  styles: [codicon, scrollableBase, styles],
})
export class PackagesView extends FASTElement {
  delayedPackagesLoader = lodash.debounce(() => this.LoadPackages(), 500);
  splitter: Split.Instance | null = null;
  @IMediator mediator!: IMediator;
  @observable projects: Array<any> = [];
  @observable selectedPackage: PackageViewModel | null = null;
  @observable packages: Array<PackageViewModel> = [];
  @observable prerelase: boolean = true;
  @observable filterQuery: string = "";
  @observable packagesLoading: boolean = true;

  connectedCallback(): void {
    super.connectedCallback();

    let packages: HTMLElement = this.shadowRoot?.getElementById("packages")!;
    let projects: HTMLElement = this.shadowRoot?.getElementById("projects")!;

    this.splitter = Split([packages, projects], {
      sizes: [75, 25],
      gutterSize: 4,
      gutter: (index: number, direction) => {
        const gutter = document.createElement("div");
        const gutterNested = document.createElement("div");
        gutter.className = `gutter gutter-${direction}`;
        gutterNested.className = "gutter-nested";
        gutter.appendChild(gutterNested);
        return gutter;
      },
    });

    this.LoadPackages();
    this.LoadProjects();
  }

  disconnectedCallback(): void {
    this.splitter?.destroy();
  }

  PrerelaseChangedEvent(target: EventTarget) {
    this.prerelase = (target as HTMLInputElement).checked;
    this.LoadPackages();
  }

  FilterInputEvent(target: EventTarget) {
    this.filterQuery = (target as HTMLInputElement).value;
    this.delayedPackagesLoader();
  }

  SelectPackage(selectedPackage: PackageViewModel) {
    this.packages.filter((x) => x.Selected).forEach((x) => (x.Selected = false));
    selectedPackage.Selected = true;
    this.selectedPackage = selectedPackage;
  }

  async LoadPackages() {
    this.selectedPackage = null;
    this.packagesLoading = true;
    let result = await this.mediator.PublishAsync<GetPackagesRequest, GetPackagesResponse>(
      GET_PACKAGES,
      {
        Url: "https://api.nuget.org/v3/index.json",
        Filter: this.filterQuery,
        Prerelease: this.prerelase,
        Skip: 0,
        Take: 30,
      }
    );

    this.packages = result.Packages.map((x) => new PackageViewModel(x));
    this.packagesLoading = false;
  }
  async LoadProjects() {
    let result = await this.mediator.PublishAsync<GetProjectsRequest, GetProjectsResponse>(
      GET_PROJECTS,
      {}
    );

    this.projects = result.Projects;
  }
}
