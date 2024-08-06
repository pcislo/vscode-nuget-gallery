import registrations, { Configuration, Router } from "./registrations";
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeCheckbox,
  vsCodeTextField,
  vsCodeDropdown,
  vsCodeOption,
  vsCodePanels,
  vsCodePanelView,
  vsCodePanelTab,
  vsCodeProgressRing,
  vsCodeLink,
} from "@vscode/webview-ui-toolkit";

import { FASTElement, customElement, html, css, when } from "@microsoft/fast-element";

import { PackagesView } from "./components/packages-view";
import { PackageRow } from "./components/package-row";
import { ProjectRow } from "./components/project-row";
import { SettingsView } from "./components/settings-view";
import { PackageDetailsComponent } from "./components/package-details";

import "./main.css";
import { ExpandableContainer } from "./components/expandable-container";
import { SearchBar } from "./components/search-bar";

provideVSCodeDesignSystem().register(
  registrations(),
  vsCodeButton(),
  vsCodeCheckbox(),
  vsCodeTextField(),
  vsCodePanels(),
  vsCodePanelView(),
  vsCodePanelTab(),
  vsCodeDropdown(),
  vsCodeOption(),
  vsCodeProgressRing(),
  vsCodeLink(),
  PackagesView,
  PackageRow,
  ProjectRow,
  SettingsView,
  PackageDetailsComponent,
  ExpandableContainer,
  SearchBar
);

const template = html<VSCodeNuGetGallery>`
  ${when(
    (x) => x.configuration.Configuration != null,
    html<VSCodeNuGetGallery>`
      ${when(
        (x) => x.router.CurrentRoute == "BROWSE",
        html`<packages-view></packages-view>`,
        html`<settings-view></settings-view>`
      )}
    `
  )}
`;

const styles = css``;

@customElement({
  name: "vscode-nuget-gallery",
  template,
  styles,
})
export class VSCodeNuGetGallery extends FASTElement {
  @Router router!: Router;
  @Configuration configuration!: Configuration;

  connectedCallback(): void {
    super.connectedCallback();
    this.configuration.Reload();
  }
}
