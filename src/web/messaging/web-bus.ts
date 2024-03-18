import { IBus } from "@/common/messaging/types";

// @ts-ignore
const vscode = acquireVsCodeApi();

export default class WebBus implements IBus {
  registerHandler(handler: (message: any) => void) {
    //@ts-ignore
    window.addEventListener("message", (event: any) => {
      handler(event.data);
    });
  }

  send(message: any) {
    console.log(message);
    vscode.postMessage(message);
  }
}
