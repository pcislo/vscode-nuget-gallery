import {
  ExecutionContext,
  FASTElement,
  attr,
  css,
  customElement,
  html,
  observable,
  repeat,
  volatile,
  when,
} from "@microsoft/fast-element";
import { PackageViewModel } from "../types";
import codicon from "@/web/styles/codicon.css";
import { IMediator } from "../registrations";
import { GET_PACKAGE_DETAILS } from "@/common/messaging/core/commands";

const template = html<PackageDetailsComponent>`
  <expandable-container title="Info" summary=${(x) => x.package?.Description}>
    <div class="package-details">
      <span class="title">Author(s):</span>
      <span>${(x) => x.package?.Authors}</span>

      ${when(
        (x) => x.package?.LicenseUrl,
        html<PackageDetailsComponent>`
          <span class="title">License:</span>
          <vscode-link href=${(x) => x.package?.LicenseUrl}>View License</vscode-link>
        `
      )}
      ${when(
        (x) => x.package?.ProjectUrl,
        html<PackageDetailsComponent>`
          <span class="title">Project Url:</span>
          <vscode-link href=${(x) => x.package?.ProjectUrl}>View Project</vscode-link>
        `
      )}
      ${when(
        (x) => x.package?.Tags,
        html<PackageDetailsComponent>`
          <span class="title">Tags:</span>
          <span>${(x) => x.package?.Tags}</span>
        `
      )}
    </div>
  </expandable-container>

  <expandable-container title="Dependencies">
    ${when(
      (x) => x.packageDetailsLoading,
      html<PackageDetailsComponent>`<vscode-progress-ring class="loader"></vscode-progress-ring>`,
      html<PackageDetailsComponent>` <div class="dependencies">
        ${when(
          (x) => Object.keys(x.packageDetails?.dependencies?.frameworks || {}).length > 0,
          html<PackageDetailsComponent>`
            <ul>
              ${repeat(
                (x) => Object.keys(x.packageDetails?.dependencies?.frameworks || {}),
                html<string>`
                  <li>
                    ${(x) => x}
                    <ul>
                      ${repeat(
                        (x, y: ExecutionContext<PackageDetailsComponent, any>) =>
                          y.parent.packageDetails?.dependencies?.frameworks[x] || [],
                        html<PackageDependency>`<li>
                          ${(x) => x.package} ${(x) => x.versionRange}
                        </li>`
                      )}
                    </ul>
                  </li>
                `
              )}
            </ul>
          `,
          html<PackageDetailsComponent>`<div class="no-dependencies">
            <span class="codicon codicon-info"></span>
            <span> No dependencies</span>
          </div>`
        )}
      </div>`
    )}
  </expandable-container>
`;
const styles = css`
  .title {
  }

  .loader {
    margin: 0px auto;
    width: 20px;
    height: 20px;
  }

  .package-details {
    margin-left: 4px;
    display: grid;
    gap: 4px 20px;
    grid-template-columns: fit-content(100%) auto;
  }

  .dependencies {
    ul {
      margin: 4px 0px;
    }
  }

  .no-dependencies {
    margin-left: 20px;
    margin-top: 8px;
    span {
      vertical-align: middle;
    }
  }
`;

@customElement({
  name: "package-details",
  template,
  styles: [styles, codicon],
})
export class PackageDetailsComponent extends FASTElement {
  @IMediator mediator!: IMediator;
  @attr package: PackageViewModel | null = null;
  @attr packageVersionUrl: string = "";
  @attr source: string = "";

  @observable packageDetailsLoading: boolean = false;
  @observable packageDetails?: PackageDetails;

  async sourceChanged(oldValue: string, newValue: string) {
    this.ReloadDependencies();
  }

  async packageVersionUrlChanged(oldValue: string, newValue: string) {
    this.ReloadDependencies();
  }

  private async ReloadDependencies() {
    this.packageDetails = undefined;

    if (!this.source) return;
    if (!this.packageVersionUrl) return;
    this.packageDetailsLoading = true;

    let request: GetPackageDetailsRequest = {
      PackageVersionUrl: this.packageVersionUrl,
      SourceUrl: this.source,
    };

    let result = await this.mediator.PublishAsync<
      GetPackageDetailsRequest,
      GetPackageDetailsResponse
    >(GET_PACKAGE_DETAILS, request);

    if (request.PackageVersionUrl != this.packageVersionUrl) return;

    this.packageDetails = result.Package;
    this.packageDetailsLoading = false;
  }
}
