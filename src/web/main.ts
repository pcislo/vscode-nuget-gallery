import registrations from "./registrations";
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeCheckbox,
} from "@vscode/webview-ui-toolkit";

import {
  FASTElement,
  customElement,
  attr,
  html,
} from "@microsoft/fast-element";

import { TestComponent } from "./components/test";

provideVSCodeDesignSystem().register(
  registrations(),
  vsCodeButton(),
  vsCodeCheckbox(),
  TestComponent
);

const template = html<VSCodeNuGetGallery>`
  <test-component greeting="elo"></test-component>
`;

@customElement({
  name: "vscode-nuget-gallery",
  template,
})
export class VSCodeNuGetGallery extends FASTElement {}
