import fs from "fs";
import path from "path";
import os from "os";
import * as vscode from "vscode";
import { DOMParser } from "@xmldom/xmldom";
import xpath from "xpath";

export type NuGetConfigSource = {
  Name: string;
  Url: string;
  Username?: string;
  Password?: string;
  IsDisabled: boolean;
  ConfigPath: string;
};

type ParsedConfig = {
  sources: Array<{ Name: string; Url: string }>;
  credentials: { [name: string]: { Username?: string; Password?: string } };
  disabled: Array<string>;
  clearSources: boolean;
};

export default class NuGetConfigParser {
  static async LoadAsync(): Promise<Array<NuGetConfigSource>> {
    let configPaths: Array<string> = [];

    const folders = vscode.workspace.workspaceFolders ?? [];
    for (const folder of folders) {
      configPaths.push(...this.FindWorkspaceConfigs(folder.uri.fsPath));
    }

    const globalPath = this.GetGlobalConfigPath();
    if (globalPath != null) configPaths.push(globalPath);

    const seen = new Set<string>();
    const orderedPaths = configPaths.filter((p) => {
      const key = path.resolve(p).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // NuGet resolves configs from least-specific (machine/user-global) to most-specific
    // (closest to project). More-specific entries override earlier ones, and a `<clear/>`
    // in `packageSources` wipes everything seen so far.
    const fromGlobalToLocal = orderedPaths.slice().reverse();

    const sources = new Map<string, { Name: string; Url: string; ConfigPath: string }>();
    const credentials: { [name: string]: { Username?: string; Password?: string } } = {};
    const disabled = new Set<string>();

    for (const configPath of fromGlobalToLocal) {
      let parsed: ParsedConfig;
      try {
        parsed = this.ParseFile(configPath);
      } catch (err) {
        vscode.window.showErrorMessage(
          `Failed to parse nuget.config at ${configPath}: ${err instanceof Error ? err.message : String(err)}`
        );
        continue;
      }

      if (parsed.clearSources) sources.clear();
      for (const src of parsed.sources) {
        sources.set(src.Name, { Name: src.Name, Url: src.Url, ConfigPath: configPath });
      }
      for (const [name, creds] of Object.entries(parsed.credentials)) {
        credentials[name] = { ...credentials[name], ...creds };
      }
      for (const name of parsed.disabled) disabled.add(name);
    }

    return Array.from(sources.values()).map((s) => ({
      Name: s.Name,
      Url: s.Url,
      ConfigPath: s.ConfigPath,
      Username: credentials[s.Name]?.Username,
      Password: credentials[s.Name]?.Password,
      IsDisabled: disabled.has(s.Name),
    }));
  }

  private static FindWorkspaceConfigs(workspaceFolder: string): Array<string> {
    const configs: Array<string> = [];
    let dir = workspaceFolder;
    while (true) {
      try {
        const entries = fs.readdirSync(dir);
        const found = entries.find((e) => e.toLowerCase() === "nuget.config");
        if (found) configs.push(path.join(dir, found));
      } catch {}
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return configs;
  }

  private static GetGlobalConfigPath(): string | null {
    if (process.platform === "win32") {
      const appData = process.env.APPDATA;
      if (appData) {
        const p = path.join(appData, "NuGet", "NuGet.Config");
        if (fs.existsSync(p)) return p;
      }
    } else {
      const home = os.homedir();
      const candidates = [
        path.join(home, ".config", "NuGet", "NuGet.Config"),
        path.join(home, ".nuget", "NuGet", "NuGet.Config"),
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) return c;
      }
    }
    return null;
  }

  private static ParseFile(configPath: string): ParsedConfig {
    const content = fs.readFileSync(configPath, "utf8");
    const document = new DOMParser().parseFromString(content);
    if (document == undefined) throw new Error(`${configPath} has invalid content`);

    const clearSources = (xpath.select("//packageSources/clear", document) as Array<Node>).length > 0;

    const sources: Array<{ Name: string; Url: string }> = [];
    const sourceNodes = xpath.select("//packageSources/add", document) as Array<any>;
    for (const node of sourceNodes) {
      const name = node.attributes?.getNamedItem("key")?.value;
      const url = node.attributes?.getNamedItem("value")?.value;
      if (name && url) sources.push({ Name: name, Url: url });
    }

    const credentials: { [name: string]: { Username?: string; Password?: string } } = {};
    const credSourceParents = xpath.select("//packageSourceCredentials/*", document) as Array<any>;
    for (const sourceEl of credSourceParents) {
      const sourceName = this.DecodeName(sourceEl.tagName ?? sourceEl.nodeName);
      const adds = xpath.select("./add", sourceEl) as Array<any>;
      const creds: { Username?: string; Password?: string } = {};
      for (const add of adds) {
        const key = add.attributes?.getNamedItem("key")?.value;
        const value = add.attributes?.getNamedItem("value")?.value;
        if (!key || value == null) continue;
        const lowered = key.toLowerCase();
        if (lowered === "username") creds.Username = value;
        else if (lowered === "cleartextpassword") creds.Password = value;
        else if (lowered === "password") {
          vscode.window.showErrorMessage(
            `nuget.config (${configPath}): encrypted "Password" for source "${sourceName}" is not supported. Use ClearTextPassword.`
          );
        }
      }
      credentials[sourceName] = creds;
    }

    const disabled: Array<string> = [];
    const disabledNodes = xpath.select("//disabledPackageSources/add", document) as Array<any>;
    for (const node of disabledNodes) {
      const name = node.attributes?.getNamedItem("key")?.value;
      const value = node.attributes?.getNamedItem("value")?.value;
      if (name && typeof value === "string" && value.toLowerCase() === "true") disabled.push(name);
    }

    return { sources, credentials, disabled, clearSources };
  }

  private static DecodeName(name: string): string {
    return name.replace(/_x([0-9A-Fa-f]{4})_/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
  }
}
