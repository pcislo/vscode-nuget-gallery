import { IBus } from "@/common/messaging/core/types";

const vscode = acquireVsCodeApi();

export default class WebBus implements IBus {
  ReceiveCallback(handler: (message: any) => void, thisArg: any) {
    window.addEventListener("message", (event: any) => handler.call(thisArg, event.data));
  }

  Send(message: any) {
    vscode.postMessage(message);
  }
}
