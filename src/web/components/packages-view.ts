import {
  FASTElement,
  customElement,
  attr,
  html,
  css,
  repeat,
  observable,
} from "@microsoft/fast-element";

import Split from "split.js";

import { IMediator } from "@/web/registrations";
import { GET_PACKAGES, GET_PROJECTS } from "@/common/messaging/core/commands";
import { base as codiconBase, search as searchCodicon } from "@/web/styles/codicon.css";
import { scrollableBase } from "@/web/styles/base.css";

const template = html<PackagesView>`
  <div class="container">
    <div class="col" id="packages">
      <div class="search-bar">
        <vscode-text-field class="search-field">
          <span slot="start" class="codicon codicon-search"></span>
        </vscode-text-field>
        <div class="search-bar-right">
          <vscode-dropdown>
            <vscode-option>Option Label #1</vscode-option>
            <vscode-option>Option Label #2</vscode-option>
            <vscode-option>Option Label #3</vscode-option>
          </vscode-dropdown>
          <vscode-checkbox>Prerelease</vscode-checkbox>
        </div>
      </div>
      <ul>
        ${repeat((x) => x.packages, html<Package>` <li>${(x) => x.Name}</li> `)}
      </ul>
    </div>
    <div class="col" id="projects">
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

      .search-field {
        flex: 1;
        max-width: 340px;
        min-width: 140px;
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

    #projects {
      overflow-y: auto;
    }
  }
`;

@customElement({
  name: "packages-view",
  template,
  styles: [codiconBase, searchCodicon, scrollableBase, styles],
})
export class PackagesView extends FASTElement {
  splitter: Split.Instance | null = null;
  @IMediator mediator!: IMediator;
  @observable projects: Array<any> = [];
  @observable packages: Array<any> = [];

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

    this.GetPackages();
    this.GetProjects();
  }

  disconnectedCallback(): void {
    this.splitter?.destroy();
  }

  async GetPackages() {
    let result = await this.mediator.PublishAsync<GetPackagesRequest, GetPackagesResponse>(
      GET_PACKAGES,
      {
        Url: "https://api.nuget.org/v3/index.json",
        Filter: "",
        Prerelease: true,
        Skip: 0,
        Take: 10,
      }
    );

    this.packages = result.Packages;
  }
  async GetProjects() {
    let result = await this.mediator.PublishAsync<GetProjectsRequest, GetProjectsResponse>(
      GET_PROJECTS,
      {}
    );

    this.projects = result.Projects;
  }
}
