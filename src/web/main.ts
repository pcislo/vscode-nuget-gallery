import registrations, { Router } from "./registrations";
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
} from "@vscode/webview-ui-toolkit";

import { FASTElement, customElement, html, css, when } from "@microsoft/fast-element";

import { PackagesView } from "./components/packages-view";
import { PackageRow } from "./components/package-row";
import { ProjectRow } from "./components/project-row";
import { SettingsView } from "./components/settings-view";

import "./main.css";

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
  PackagesView,
  PackageRow,
  ProjectRow,
  SettingsView
);

const template = html<VSCodeNuGetGallery>`
  ${when(
    (x) => x.router.CurrentRoute == "BROWSE",
    html`<packages-view></packages-view>`,
    html`<settings-view></settings-view>`
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
}
