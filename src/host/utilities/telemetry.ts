import { Disposable, ExtensionContext } from "vscode";
import type { Attributes, TimeInput, Tracer } from "@opentelemetry/api";

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { BasicTracerProvider, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import {
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_DEVICE_ID,
  SEMRESATTRS_OS_TYPE,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import * as vscode from "vscode";
import os from "os";

export default class Telemetry implements Disposable {
  private isEnabled: boolean = false;
  private provider: BasicTracerProvider;
  private tracer: Tracer;

  constructor(context: ExtensionContext) {
    this.isEnabled = vscode.env.isTelemetryEnabled;

    this.provider = new BasicTracerProvider({
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: "nuget-gallery",
        [SEMRESATTRS_SERVICE_VERSION]: context.extension.packageJSON.version,
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: "production",
        [SEMRESATTRS_DEVICE_ID]: vscode.env.machineId,
        [SEMRESATTRS_OS_TYPE]: os.platform(),
        "extension.id": context.extension.id,
        "session.id": vscode.env.sessionId,
        language: vscode.env.language,
        "vscode.edition": vscode.env.appName,
        "vscode.version": vscode.version,
        "vscode.host": vscode.env.appHost,
        "vscode.remoteName": vscode.env.remoteName ?? "",
        "vscode.shell": vscode.env.shell,
        "vscode.uiKind": vscode.env.uiKind,
      }) as any,
    });

    const traceExporter = new OTLPTraceExporter({
      url: "https://otlp.eu01.nr-data.net/v1/traces",
      headers: {
        "api-key": "",
      },
    });
    this.provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
    this.tracer = this.provider.getTracer(context.extension.id);
  }

  sendEvent(name: string, data?: Attributes, startTime?: TimeInput, endTime?: TimeInput) {
    if (!this.isEnabled) return;

    let span = this.tracer.startSpan(name, {
      startTime: startTime ?? Date.now(),
    });
    if (data != undefined) span.setAttributes(data);
    span.end(endTime);
  }

  dispose() {
    this.provider.shutdown();
  }
}
