import {
  FASTElement,
  customElement,
  html,
  css,
  observable,
  repeat,
  when,
} from "@microsoft/fast-element";

import codicon from "@/web/styles/codicon.css";
import { scrollableBase } from "@/web/styles/base.css";
import { Router } from "../registrations";
import { SourceViewModel } from "../types";

const template = html<SettingsView>`
  <div class="container">
    <div class="header">
      <vscode-button appearance="icon" @click=${(x) => x.router.Navigate("BROWSE")}>
        <div class="return-btn"><span class="codicon codicon-arrow-left"></span>SETTINGS</div>
      </vscode-button>
    </div>

    <div class="sections-container">
      <div class="section">
        <div class="title">Credential Provider Folder</div>
        <div class="subtitle">Folder containing CredentialProvider.Microsoft</div>
        <vscode-text-field class="text-field"></vscode-text-field>
      </div>

      <div class="section sources-section">
        <div class="title">Sources</div>
        <div class="subtitle">NuGet sources</div>
        <div class="sources-editor">
          ${repeat(
            (x) => x.sources,
            html<SourceViewModel>`
              ${when(
                (x) => x.EditMode,
                html<SourceViewModel>`
                  <div class="row edit-row">
                    <vscode-text-field placeholder="Name"></vscode-text-field>
                    <vscode-text-field placeholder="Url"></vscode-text-field>
                    <div>
                      <vscode-button> Ok </vscode-button>
                      <vscode-button appearance="secondary"> Cancel </vscode-button>
                    </div>
                  </div>
                `,
                html<SourceViewModel>`
                  <div class="row data-row">
                    <span class="label">asdasd</span>
                    <span class="label">aszxcasd</span>
                  </div>
                `
              )}
            `
          )}
        </div>
        <vscode-button class="add-source" @click=${(x) => x.AddSourceRow()}>
          Add source
        </vscode-button>
      </div>
    </div>
  </div>
`;

const styles = css`
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    .header {
      margin-bottom: 8px;
      .return-btn {
        display: flex;
        gap: 4px;
        align-items: center;
        span {
          font: 17px / 1 codicon;
        }
      }
    }
    .sections-container {
      width: 100%;
      max-width: 700px;
      align-self: center;
      overflow-y: auto;

      .section {
        margin-right: 20px;
        margin-bottom: 12px;

        .text-field {
          width: 100%;
        }
        .title {
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .subtitle {
          margin-bottom: 8px;
        }
      }

      .sources-section {
        .sources-editor {
          .row {
            margin: 4px 0px;
            display: grid;
            grid-template-columns: 30% 70%;
            grid-column-gap: 10px;
            &.data-row {
              .label {
                padding: 4px 2px;
              }
              &:hover {
                background-color: var(--vscode-list-hoverBackground);
              }
            }
            &.edit-row {
              grid-template-columns: 30% auto 108px;
            }
          }
        }
        .add-source {
          margin: 6px 0px;
        }
      }
    }
  }
`;

@customElement({
  name: "settings-view",
  template,
  styles: [codicon, scrollableBase, styles],
})
export class SettingsView extends FASTElement {
  @Router router!: Router;
  @observable sources: Array<SourceViewModel> = [];

  AddSourceRow() {
    this.sources.forEach((x) => (x.EditMode = false));
    let newSource = new SourceViewModel();
    newSource.EditMode = true;
    this.sources.push(newSource);
  }
}
