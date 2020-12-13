# NuGet Gallery Extension

NuGet Gallery Extension makes installing and uninstalling NuGet packages easier


## Features
![feature X](docs/images/presentation_1.gif)

## Configuration
* Credential Provider Folder - in order to use private feeds credential provider is required [CredentialProvider](https://github.com/microsoft/artifacts-credprovider)
* Sources - new sources can be added in appropriate json format: {"name": "...", "url": "..."}

## Release Notes

### v0.0.24

[#48](https://github.com/pcislo/vscode-nuget-gallery/pull/48) by [@claudineyqr](https://github.com/claudineyqr)

Obtaining additional information about the package


### v0.0.23

[#47](https://github.com/pcislo/vscode-nuget-gallery/pull/47) by [@ZBAGI](https://github.com/ZBAGI)

Fix error when credentialProviderFolder contains spaces

### v0.0.22

Add support for .vbproj projects
Add "Open NuGet Gallery" command to context menu on .csproj, .fsproj, .vbproj and .sln

### v0.0.21

[#38](https://github.com/pcislo/vscode-nuget-gallery/pull/38) by [@kojo12228](https://github.com/kojo12228)

Add support for .fsproj projects

### v0.0.20

Change semVerLevel to 2.0

### v0.0.19

Add support for prerelease versions

### v0.0.10

Add support for credentials provider on linux/mac

### v0.0.9

[#18](https://github.com/pcislo/vscode-nuget-gallery/pull/18) by [@nikhilogic](https://github.com/nikhilogic)

* Added validation on Install and Uninstall buttons in the ProjectsPanel so buttons are enabled or disabled
* Added links to quickly install and uninstall with single clicks.
* Increased spacing between project items for clarity.
* Added styles for disabling buttons and anchor tags.



### v0.0.8

Fix projects loading when packages have no version specified [#14](https://github.com/pcislo/vscode-nuget-gallery/pull/17)


### v0.0.7

Fix project path on *nix terminals. [#14](https://github.com/pcislo/vscode-nuget-gallery/pull/14) by [@renatodarrigo](https://github.com/renatodarrigo)

### v0.0.6

Fix default NuGet Feed url

### v0.0.5

Add private feeds support - beta

### v0.0.4

Add scroll 

### v0.0.1

Initial release of NuGet Gallery Extension


-----------------------------------------------------------------------------------------------------------
