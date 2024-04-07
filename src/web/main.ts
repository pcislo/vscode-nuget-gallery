import registrations from "./registrations";
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

import { FASTElement, customElement, attr, html, css } from "@microsoft/fast-element";

import { PackagesView } from "./components/packages-view";
import { PackageRow } from "./components/package-row";
import { ProjectRow } from "./components/project-row";

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
  ProjectRow
);

const template = html<VSCodeNuGetGallery>` <packages-view></packages-view> `;

const styles = css``;

@customElement({
  name: "vscode-nuget-gallery",
  template,
  styles,
})
export class VSCodeNuGetGallery extends FASTElement {}
