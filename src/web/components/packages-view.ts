import {
  FASTElement,
  customElement,
  html,
  css,
  repeat,
  observable,
  when,
  ExecutionContext,
  volatile,
} from "@microsoft/fast-element";

import Split from "split.js";
import lodash from "lodash";
import hash from "object-hash";
import { Configuration, IMediator } from "@/web/registrations";
import { GET_PACKAGES, GET_PROJECTS } from "@/common/messaging/core/commands";
import codicon from "@/web/styles/codicon.css";
import { scrollableBase } from "@/web/styles/base.css";
import { PackageViewModel, ProjectViewModel } from "../types";

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
          <vscode-dropdown
            :value=${(x) => x.selectedSourceUrl}
            @change=${(x, c) => x.SelectSource((c.event.target as HTMLInputElement).value)}
          >
            ${repeat(
              (x) => x.configuration.Configuration!.Sources,
              html<Source>`
                <vscode-option :value="${(x) => x.Url}">${(x) => x.Name}</vscode-option>
              `
            )}
          </vscode-dropdown>
          <vscode-checkbox
            :checked="${(x) => x.prerelase}"
            @change=${(x, c) => x.PrerelaseChangedEvent(c.event.target!)}
            >Prerelease</vscode-checkbox
          >
        </div>
      </div>
      <div
        class="packages-container"
        @scroll=${(x, e) => x.PackagesScrollEvent(e.event.target as HTMLElement)}
      >
        ${when(
          (x) => !x.packagesLoadingError,
          html<PackagesView>`
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
            ${when(
              (x) => !x.noMorePackages,
              html<PackagesView>`<vscode-progress-ring class="loader"></vscode-progress-ring>`
            )}
          `,
          html<PackagesView>`<div class="error">
            <span class="codicon codicon-error"></span> Failed to fetch packages. See 'Webview
            Developer Tools' for more details
          </div> `
        )}
      </div>
    </div>

    <div class="col" id="projects">
      ${when(
        (x) => x.selectedPackage != null,
        html<PackagesView>`
          <div class="package-info">
            <span class="package-title">
              ${when(
                (x) => x.NugetOrgPackageUrl != null,
                html<PackagesView>`<a target="_blank" :href=${(x) => x.NugetOrgPackageUrl}
                  ><span class="package-link-icon codicon codicon-link-external"></span>${(x) =>
                    x.selectedPackage?.Name}</a
                >`,
                html<PackagesView>`${(x) => x.selectedPackage?.Name}`
              )}
            </span>
            <div class="version-selector">
              <vscode-dropdown
                :value=${(x) => x.selectedVersion}
                @change=${(x, c) => (x.selectedVersion = (c.event.target as any).value)}
              >
                ${repeat(
                  (x) => x.selectedPackage?.Versions || [],
                  html<string>` <vscode-option>${(x) => x}</vscode-option> `
                )}
              </vscode-dropdown>
              <vscode-button appearance="icon" @click=${(x) => x.LoadProjects()}>
                <span class="codicon codicon-refresh"></span>
              </vscode-button>
            </div>
          </div>
          <div class="projects-panel-container">
            <package-details
              :package=${(x) => x.selectedPackage}
              :packageVersionUrl=${(x) => x.PackageVersionUrl}
              :source=${(x) => x.selectedSourceUrl}
            ></package-details>
            <div class="separator"></div>
            ${when(
              (x) => x.projects.length > 0,
              html<PackagesView>`
                ${repeat(
                  (x) => x.projects,
                  html<ProjectViewModel>`
                    <project-row
                      :project=${(x) => x}
                      :packageId=${(x, c: ExecutionContext<PackagesView, any>) =>
                        c.parent.selectedPackage?.Name}
                      :packageVersion=${(x, c: ExecutionContext<PackagesView, any>) =>
                        c.parent.selectedVersion}
                    >
                    </project-row>
                  `
                )}
              `,
              html<PackagesView>`<div class="no-projects">
                <span class="codicon codicon-info"></span> No projects found
              </div>`
            )}
          </div>
        `
      )}
    </div>
  </div>
`;

const styles = css`
  .container {
    display: flex;
    height: 100%;

    &:focus-visible {
      outline: unset;
    }

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
        display: flex;
        flex-direction: column;
        flex: 1;

        .error {
          display: flex;
          gap: 4px;
          justify-content: center;
          flex: 1;
          margin-top: 32px;
          color: var(--vscode-errorForeground);
        }

        .package {
          margin-bottom: 3px;
        }

        .loader {
          margin: 10px 0px;
        }
      }
    }

    #projects {
      display: flex;
      flex-direction: column;

      .package-info {
        padding: 3px;
        margin-left: 2px;
        margin-right: 3px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;

        .package-title {
          font-size: 14px;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          text-wrap: nowrap;

          a {
            text-decoration: none;
            color: var(--vscode-editor-foreground);
          }

          .package-link-icon {
            vertical-align: middle;
            font-size: 12px;
            margin-right: 3px;
          }
        }

        .version-selector {
          text-wrap: nowrap;
          min-width: 128px;
        }
      }
      .projects-panel-container {
        overflow-y: auto;
        overflow-x: hidden;
        .no-projects {
          display: flex;
          gap: 4px;
          margin-left: 6px;
        }

        .separator {
          margin: 10px 0px;
          height: 1px;
          background-color: var(--vscode-panelSection-border);
        }
      }
    }
  }
`;

const PACKAGE_FETCH_TAKE = 50;
const PACKAGE_CONTAINER_SCROLL_MARGIN = 196;
const NUGET_ORG_PREFIX = "https://api.nuget.org";

@customElement({
  name: "packages-view",
  template,
  styles: [codicon, scrollableBase, styles],
})
export class PackagesView extends FASTElement {
  delayedPackagesLoader = lodash.debounce(() => this.LoadPackages(), 500);
  splitter: Split.Instance | null = null;
  packagesPage: number = 0;
  packagesLoadingInProgress: boolean = false;
  currentLoadPackageHash: string = "";
  @IMediator mediator!: IMediator;
  @Configuration configuration!: Configuration;
  @observable projects: Array<ProjectViewModel> = [];
  @observable selectedSourceUrl: string = "";
  @observable selectedVersion: string = "";
  @observable selectedPackage: PackageViewModel | null = null;
  @observable packages: Array<PackageViewModel> = [];
  @observable prerelase: boolean = true;
  @observable filterQuery: string = "";
  @observable noMorePackages: boolean = false;
  @observable packagesLoadingError: boolean = false;

  connectedCallback(): void {
    super.connectedCallback();

    let packages: HTMLElement = this.shadowRoot?.getElementById("packages")!;
    let projects: HTMLElement = this.shadowRoot?.getElementById("projects")!;

    this.splitter = Split([packages, projects], {
      sizes: [60, 40],
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
    this.selectedSourceUrl = this.configuration.Configuration?.Sources[0].Url ?? "";
    this.LoadPackages();
    this.LoadProjects();
  }

  disconnectedCallback(): void {
    this.splitter?.destroy();
  }

  @volatile
  get NugetOrgPackageUrl() {
    if (this.selectedSourceUrl.startsWith(NUGET_ORG_PREFIX))
      return `https://www.nuget.org/packages/${this.selectedPackage?.Name}/${this.selectedVersion}`;
    else return null;
  }

  @volatile
  get PackageVersionUrl() {
    return (
      this.selectedPackage?.Model.Versions.filter((x) => x.Version == this.selectedVersion)[0].Id ??
      ""
    );
  }

  PrerelaseChangedEvent(target: EventTarget) {
    this.prerelase = (target as HTMLInputElement).checked;
    this.LoadPackages();
  }

  FilterInputEvent(target: EventTarget) {
    this.filterQuery = (target as HTMLInputElement).value;
    this.delayedPackagesLoader();
  }

  SelectSource(url: string) {
    this.selectedSourceUrl = url;
    this.LoadPackages(false);
  }

  SelectPackage(selectedPackage: PackageViewModel) {
    this.packages.filter((x) => x.Selected).forEach((x) => (x.Selected = false));
    selectedPackage.Selected = true;
    this.selectedPackage = selectedPackage;
    this.selectedVersion = this.selectedPackage.Version;
  }

  PackagesScrollEvent(target: HTMLElement) {
    if (this.packagesLoadingInProgress || this.noMorePackages) return;
    if (
      target.scrollTop + target.getBoundingClientRect().height >
      target.scrollHeight - PACKAGE_CONTAINER_SCROLL_MARGIN
    )
      this.LoadPackages(true);
  }

  async LoadPackages(append: boolean = false) {
    let _getLoadPackageRequest = () => {
      return {
        Url: this.selectedSourceUrl,
        Filter: this.filterQuery,
        Prerelease: this.prerelase,
        Skip: this.packagesPage * PACKAGE_FETCH_TAKE,
        Take: PACKAGE_FETCH_TAKE,
      };
    };

    this.packagesLoadingError = false;
    this.packagesLoadingInProgress = true;
    if (append == false) {
      this.packagesPage = 0;
      this.selectedPackage = null;
      this.packages = [];
    }
    this.noMorePackages = false;

    let requestObject = _getLoadPackageRequest();
    this.currentLoadPackageHash = hash(requestObject);

    let result = await this.mediator.PublishAsync<GetPackagesRequest, GetPackagesResponse>(
      GET_PACKAGES,
      requestObject
    );
    if (this.currentLoadPackageHash != hash(_getLoadPackageRequest())) return;
    if (result.IsFailure) {
      this.packagesLoadingError = true;
    } else {
      let packagesViewModels = result.Packages!.map((x) => new PackageViewModel(x));
      if (packagesViewModels.length < requestObject.Take) this.noMorePackages = true;
      this.packages.push(...packagesViewModels);
      this.packagesPage++;
      this.packagesLoadingInProgress = false;
    }
  }

  async LoadProjects() {
    this.projects = [];
    let result = await this.mediator.PublishAsync<GetProjectsRequest, GetProjectsResponse>(
      GET_PROJECTS,
      {}
    );

    this.projects = result.Projects.map((x) => new ProjectViewModel(x));
  }
}
