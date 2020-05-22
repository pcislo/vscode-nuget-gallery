import xpath = require('xpath');
import * as process from 'process';
import * as vscode from 'vscode';
import * as dom from 'xmldom';
import { NugetSource } from './types';
import fs = require("fs");

export default function (nugetConfigPath: vscode.Uri): NugetSource[] {
    let content = fs.readFileSync(nugetConfigPath.fsPath, "utf8");
    let document = new dom.DOMParser().parseFromString(content);

    const sourcesNodes = xpath.select('/configuration/packageSources/add', document);

    const parsedPackageSources = sourcesNodes.map(value => {
        const sourceElement = value as Element;

        const name = sourceElement.attributes.getNamedItem('key');
        const url = sourceElement.attributes.getNamedItem('value');

        if (!name || !url) {
            return null;
        }

        const credentialsNodes = xpath.select(`/configuration/packageSourceCredentials/${name.value}/add`, document);
        const attributes = credentialsNodes.map(x => {
            const credentialsElement = x as Element;

            const key = credentialsElement.attributes.getNamedItem('key');
            const value = credentialsElement.attributes.getNamedItem('value');

            return { key: key?.value, value: value?.value };
        });

        let username = attributes.find(t => t.key === 'Username')?.value;
        if (username?.startsWith('%') && username?.endsWith('%')) {
            username = process.env[username.replace(/%/g, '')];
        }

        let password = attributes.find(t => t.key === 'ClearTextPassword')?.value;
        if (password?.startsWith('%') && password?.endsWith('%')) {
            password = process.env[password.replace(/%/g, '')];
        }

        return {
            name: name.value,
            url: url.value,
            credentials: !!username && !!password ? {
                Username: username,
                Password: password
            } : undefined
        } as NugetSource;
    });

    if (parsedPackageSources.some(x => !x)) {
        vscode.window.showWarningMessage(`Some NuGet sources in ${nugetConfigPath} are not configured correctly`);
    }

    return parsedPackageSources.filter((x): x is NugetSource => x !== null);
}