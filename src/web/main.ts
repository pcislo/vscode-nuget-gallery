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
} from "@vscode/webview-ui-toolkit";

import { FASTElement, customElement, attr, html, css } from "@microsoft/fast-element";

import { PackagesView } from "./components/packages-view";

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
  PackagesView
);

const template = html<VSCodeNuGetGallery>` <packages-view></packages-view> `;

const styles = css``;

@customElement({
  name: "vscode-nuget-gallery",
  template,
  styles,
})
export class VSCodeNuGetGallery extends FASTElement {}
