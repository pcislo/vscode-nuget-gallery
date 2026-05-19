# NuGet Gallery Extension

✅ Enhance your Visual Studio Code experience with the NuGet Gallery extension. Streamlining the process of managing NuGet packages, it makes installation, updating, and uninstallation efficient and user-friendly.

<p align="center" width="100%">
    <img width="1200" src="docs/images/run_extension.gif">
</p>

## Features

### 📦 Simplified Package Management

Effortlessly install, update, and uninstall NuGet packages for your projects directly within Visual Studio Code.

<p align="center" width="100%">
    <img width="1200" src="docs/images/feature_1.gif"> 
</p>

### 🚀 Source Management

Manage your NuGet package sources effortlessly. Add, remove, or modify package sources to suit your project requirements.

> Utilize private feeds seamlessly with the required credential provider. Find installation instructions and more details [here](https://github.com/microsoft/artifacts-credprovider).

#### Reading sources and credentials from `nuget.config`

The extension also discovers package sources from `nuget.config` files. It walks workspace folders up to the filesystem root and falls back to the user-global config (`%APPDATA%\NuGet\NuGet.Config` on Windows; `~/.config/NuGet/NuGet.Config` or `~/.nuget/NuGet/NuGet.Config` on macOS/Linux). Sources discovered this way appear in Settings tagged as `nuget.config` and are read-only — manage them by editing the file.

Stored credentials under `<packageSourceCredentials>` are used automatically. Only `ClearTextPassword` is supported; encrypted `Password` entries are skipped (use the credential provider for those).

<p align="center" width="100%">
    <img width="1200" src="docs/images/feature_2.gif"> 
</p>
