import {
  FASTElement,
  customElement,
  attr,
  html,
} from "@microsoft/fast-element";

import { IMediator, IBus } from "../../common/messaging/types";

const template = html<TestComponent>`
  <div class="header">
    <h3>${(x) => x.greeting.toUpperCase()}</h3>
    <h4>my name is ${(x) => x.greeting}</h4>
  </div>

  <div class="body">
    TODO: Name Here
    <vscode-button @click="${(x) => x.sendMessage()}" id="howdy"
      >Howdy X!</vscode-button
    >
  </div>

  <div class="footer"></div>
`;

@customElement({
  name: "test-component",
  template,
})
export class TestComponent extends FASTElement {
  @IMediator mediator!: IMediator;
  @IBus test!: IBus;
  @attr greeting: string = "";
  sendMessage() {
    console.log("SENDING MESSAGE");
    console.log(this.mediator);
    console.log(this.test);
    this.mediator.publish("ProjectsRequest", {});
    //ii(new Test());
  }
  greetingChanged() {
    console.log("CHANGED", this.greeting);
  }
}
