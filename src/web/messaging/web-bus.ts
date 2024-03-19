import { IBus } from "@/common/messaging/types";

const vscode = acquireVsCodeApi();

export default class WebBus implements IBus {
  receiveCallback(handler: (message: any) => void, thisArg: any) {
    window.addEventListener("message", (event: any) => handler.call(thisArg, event.data));
  }

  send(message: any) {
    vscode.postMessage(message);
  }
}
