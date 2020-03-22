# NuGet Gallery Extension

NuGet Gallery Extension makes installing and uninstalling NuGet packages easier


## Features
![feature X](docs/images/presentation_1.gif)

## Configuration
* Credential Provider Folder - in order to use private feeds credential provider is required [CredentialProvider](https://github.com/microsoft/artifacts-credprovider)
* Sources - new sources can be added in appropriate json format: {"name": "...", "url": "..."}

## Release Notes

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
