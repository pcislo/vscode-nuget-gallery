import { IBus } from "@/common/messaging/types";
import { Webview } from "vscode";

export default class HostBus implements IBus {
  private _webView: Webview;
  constructor(webView: Webview) {
    this._webView = webView;
  }

  receiveCallback(handler: (message: any) => void, thisArg: any) {
    this._webView.onDidReceiveMessage((message) => {
      handler.call(thisArg, message);
    }, thisArg);
  }

  send(message: any) {
    this._webView.postMessage(message);
  }
}
