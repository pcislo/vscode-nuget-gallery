import {
  FASTElement,
  customElement,
  html,
  css,
  observable,
  repeat,
  when,
  ExecutionContext,
} from "@microsoft/fast-element";

import codicon from "@/web/styles/codicon.css";
import { scrollableBase } from "@/web/styles/base.css";
import { Configuration, IMediator, Router } from "../registrations";
import { SourceViewModel } from "../types";
import lodash from "lodash";
import { UPDATE_CONFIGURATION } from "@/common/messaging/core/commands";

const template = html<SettingsView>`
  <div class="container">
    <div class="header">
      <vscode-button appearance="icon" @click=${(x) => x.router.Navigate("BROWSE")}>
        <div class="return-btn"><span class="codicon codicon-arrow-left"></span>BACK</div>
      </vscode-button>
    </div>

    <div class="sections-container">
      <div class="section">
        <div class="title">Credential Provider Folder</div>
        <div class="subtitle">Folder containing CredentialProvider.Microsoft</div>
        <vscode-text-field
          class="text-field"
          :value=${(x) => x.credentialProviderFolder}
          @input=${(x, c) => {
            (x.credentialProviderFolder = (c.event.target! as HTMLInputElement).value),
              x.delayedCredentialProviderUpdate();
          }}
        ></vscode-text-field>
      </div>

      <div class="section">
        <div class="title">Skip performing a restore preview and compatibility check</div>
        <vscode-checkbox
          :checked=${(x) => x.skipRestore}
          @change=${(x, c) => {
            x.skipRestore = (c.event.target! as HTMLInputElement).checked;
            x.delayedCredentialProviderUpdate();
          }}
        >
        </vscode-checkbox>
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
                    <vscode-text-field
                      placeholder="Name"
                      :value=${(x) => x.DraftName}
                      @input=${(x, c) =>
                        (x.DraftName = (c.event.target! as HTMLInputElement).value)}
                    ></vscode-text-field>
                    <vscode-text-field
                      placeholder="Url"
                      :value=${(x) => x.DraftUrl}
                      @input=${(x, c) => (x.DraftUrl = (c.event.target! as HTMLInputElement).value)}
                    ></vscode-text-field>
                    <div>
                      <vscode-button
                        @click=${(x, c: ExecutionContext<SettingsView, any>) => c.parent.SaveRow(x)}
                      >
                        Ok
                      </vscode-button>
                      <vscode-button
                        appearance="secondary"
                        @click=${(x, c: ExecutionContext<SettingsView, any>) =>
                          c.parent.CancelRow(x)}
                      >
                        Cancel
                      </vscode-button>
                    </div>
                  </div>
                `,
                html<SourceViewModel>`
                  <div class="row data-row">
                    <span class="label">${(x) => x.Name}</span>
                    <span class="label">${(x) => x.Url}</span>
                    <div class="actions">
                      <vscode-button
                        appearance="icon"
                        @click=${(x, c: ExecutionContext<SettingsView, any>) => c.parent.EditRow(x)}
                      >
                        <span class="codicon codicon-edit"></span>
                      </vscode-button>
                      <vscode-button
                        appearance="icon"
                        @click=${(x, c: ExecutionContext<SettingsView, any>) =>
                          c.parent.RemoveRow(x)}
                      >
                        <span class="codicon codicon-close"></span>
                      </vscode-button>
                    </div>
                  </div>
                `
              )}
            `
          )}
        </div>
        ${when(
          (x) => x.newSource == null,
          html<SettingsView>`<vscode-button class="add-source" @click=${(x) => x.AddSourceRow()}>
            Add source
          </vscode-button>`
        )}
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
              .actions {
                display: none;
              }
              .label {
                padding: 4px 2px;
                text-wrap: nowrap;
                overflow: hidden;
                text-overflow: ellipsis; gall
              }
              &:hover {
                grid-template-columns: 30% auto 50px;
                background-color: var(--vscode-list-hoverBackground);
                &:not(:first-child) {
                  .actions {
                    display: flex;
                    gap: 2px;
                  }
                }
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
  @Configuration configuration!: Configuration;
  @IMediator mediator!: IMediator;
  delayedCredentialProviderUpdate = lodash.debounce(() => this.UpdateConfiguration(), 500);
  @observable credentialProviderFolder: string = "";
  @observable skipRestore: boolean = false;
  @observable newSource: SourceViewModel | null = null;
  @observable sources: Array<SourceViewModel> = [];

  connectedCallback(): void {
    super.connectedCallback();
    let config = this.configuration.Configuration;
    this.credentialProviderFolder = config?.CredentialProviderFolder ?? "";
    this.skipRestore = config?.SkipRestore ?? false;
    this.sources = config?.Sources.map((x) => new SourceViewModel(x)) ?? [];
  }

  async UpdateConfiguration() {
    await this.mediator.PublishAsync<UpdateConfigurationRequest, UpdateConfigurationResponse>(
      UPDATE_CONFIGURATION,
      {
        Configuration: {
          SkipRestore: this.skipRestore,
          CredentialProviderFolder: this.credentialProviderFolder,
          Sources: this.sources.map((x) => x.GetModel()),
        },
      }
    );
    await this.configuration.Reload();
  }

  AddSourceRow() {
    this.sources.filter((x) => x.EditMode == true).forEach((x) => x.Cancel());
    this.newSource = new SourceViewModel();
    this.newSource.Edit();
    this.sources.push(this.newSource);
  }
  EditRow(source: SourceViewModel) {
    this.sources.filter((x) => x.EditMode == true).forEach((x) => x.Cancel());
    source.Edit();
  }
  RemoveRow(source: SourceViewModel) {
    this.sources.splice(this.sources.indexOf(source), 1);
    this.UpdateConfiguration();
  }
  SaveRow(source: SourceViewModel) {
    if (this.newSource?.Id == source.Id) this.newSource = null;
    source.Save();
    if (source.Name == "" && source.Url == "") this.RemoveRow(source);
    this.UpdateConfiguration();
  }
  CancelRow(source: SourceViewModel) {
    if (this.newSource?.Id == source.Id) this.newSource = null;
    if (source.Name == "" && source.Url == "") this.RemoveRow(source);
    else source.Cancel();
  }
}
