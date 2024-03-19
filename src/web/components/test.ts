import { FASTElement, customElement, attr, html, repeat, observable } from "@microsoft/fast-element";

import { IMediator } from "@/web/registrations";
import { LIST_PROJECTS } from "@/common/messaging/commands";

const template = html<TestComponent>`
  <div class="body">
    <vscode-button @click="${(x) => x.sendMessage()}" id="howdy">ListProjects</vscode-button>
    <ul>
      ${repeat((x) => x.projects, html<any>` <li>${(x) => x.name} | ${(x) => x.version}</li> `)}
    </ul>
  </div>

  <div class="footer"></div>
`;

@customElement({
  name: "test-component",
  template,
})
export class TestComponent extends FASTElement {
  @IMediator mediator!: IMediator;
  @observable projects: Array<any> = [];
  @attr greeting: string = "";
  async sendMessage() {
    this.projects = await this.mediator.publish(LIST_PROJECTS, {});
  }
}
