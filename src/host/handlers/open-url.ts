import { IRequestHandler } from "@/common/messaging/core/types";
import * as vscode from "vscode";

export default class OpenUrl implements IRequestHandler<OpenUrlRequest, OpenUrlResponse> {
  async HandleAsync(request: OpenUrlRequest): Promise<OpenUrlResponse> {
    vscode.env.openExternal(vscode.Uri.parse(request.Url));
    return {};
  }
}
