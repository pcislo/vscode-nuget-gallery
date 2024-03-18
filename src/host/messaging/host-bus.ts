import { IBus } from "@/common/messaging/types";
import { Webview } from "vscode";

export default class HostBus implements IBus {
  private _webView: Webview;
  constructor(webView: Webview) {
    this._webView = webView;
  }

  registerHandler(handler: (message: any) => void) {
    this._webView.onDidReceiveMessage((message) => {
      handler(message);
    });
  }

  send(message: any) {
    this._webView.postMessage(message);
  }
}
