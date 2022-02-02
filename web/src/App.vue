<template>
  <div class="container">
    <div class="header">
      <filters @filterChanged="updateFilter($event)" @filter="refreshList" @isPrerelease="isPrerelease = $event" />
      <source-selector :sources="nugetSources" @sourceChanged="changeSource" />
    </div>
    <div class="packages-list">
      <packages-list
        :filter="filter"
        :isPrerelease="isPrerelease"
        :source="currentSource"
        @packageChanged="packageChanged"
        @getCredentials="fetchCredentials"
        @getPackages="getAmagPackages"
        ref="packagesList"
      />
    </div>
    <div id="package-info" v-if="selectedPackage">
      <projects-panel
        @refreshRequested="sendProjectsReloadRequest"
        :projects="projects"
        :versions="packageVersions"
        :packageId="selectedPackage.id"
        :packageAuthors="selectedPackage.authors"
        :source="currentSource"
        @install="install"
        @uninstall="uninstall"
      />
    </div>
  </div>
</template>

<script>
import Filters from "@/components/Filters";
import SourceSelector from "@/components/SourceSelector";
import ProjectsPanel from "@/components/ProjectsPanel";
import PackagesList from "@/components/PackagesList";

import _ from "lodash";

const vscode = acquireVsCodeApi();

export default {
  name: "app",
  components: {
    Filters,
    ProjectsPanel,
    PackagesList,
    SourceSelector
  },
  data() {
    return {
      isPrerelease: false,
      currentSource: null,
      filter: null,
      selectedPackage: null,
      projects: [],
      rawProjects: [],
      nugetSources: [],
      debouncedListRefresh: _.debounce(this.refreshList, 500),
      credentialsCallback: {},
      packagesCallback: {}
    };
  },
  computed: {
    packageVersions: {
      get() {
        return this.selectedPackage
          ? this.selectedPackage.versions.map(x => x.version).reverse()
          : [];
      }
    }
  },
  methods: {
    refreshList() {
      this.$refs.packagesList.refresh();
    },
    changeSource(source) {
      this.currentSource = source;
    },
    recalculateProjectsList() {
      if (!this.selectedPackage) this.projects = null;
      else {
        this.projects = [];
        let packageId = this.selectedPackage.id;
        this.rawProjects.forEach(x => {
          let foundPackage = x.packages.find(p => p.id == packageId);
          let version = foundPackage ? foundPackage.version : null;
          this.projects.push({
            projectName: x.projectName,
            projectPath: x.path,
            version: version
          });
        });
      }
    },
    packageChanged(value) {
      this.selectedPackage = value;
      this.recalculateProjectsList();
    },
    updateFilter(value) {
      this.filter = value;
      this.debouncedListRefresh();
    },
    sendProjectsReloadRequest() {
      this.projects = null;
      vscode.postMessage({
        command: "reloadProjects"
      });
    },
    install(data) {
      vscode.postMessage({
        command: "add",
        projects: data.selectedProjects,
        package: this.selectedPackage,
        version: data.selectedVersion,
        source: this.currentSource.url
      });
    },
    uninstall(data) {
      vscode.postMessage({
        command: "remove",
        projects: data.selectedProjects,
        package: this.selectedPackage
      });
    },
    fetchCredentials(req) {
      this.credentialsCallback[req.source] = req.callback;
      vscode.postMessage({
        command: "getCredentials",
        source: req.source
      });
    },
    getAmagPackages(req){
      this.packagesCallback[req.source] = req.callback;
      vscode.postMessage({
        command: "getPackages",
        source: req.source,
        params: req.params
      });
    }
  },
  created() {
    window.addEventListener("message", event => {
      debugger;
      switch (event.data.command) {
        case "setProjects":
          this.rawProjects = event.data.payload;
          this.recalculateProjectsList();
          break;
        case "setSources":
          this.nugetSources = event.data.payload.map(x => JSON.parse(x));
          break;
        case "getPackages":
          debugger;
          this.packagesCallback[event.data.payload.source](
            event.data.payload.packages
          );
        break;
        case "setCredentials":
          this.credentialsCallback[event.data.payload.source](
            event.data.payload.credentials
          );
          break;
      }
    });
    this.sendProjectsReloadRequest();
    vscode.postMessage({
      command: "reloadSources"
    });
  }
};
</script>

<style>
html,
body {
  height: 100%;
}

select {
  background: var(--vscode-dropdown-background);
  color: var(--vscode-dropdown-foreground);
  border: 1px solid var(--vscode-dropdown-border);
  padding: 3px;
  min-width: 100px;
}

input {
  background: var(--vscode-input-background);
  border: var(--vscode-input-border);
  color: var(--vscode-input-foreground);
  padding: 4px;
}

button {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  padding: 4px 8px;
  border: 0px;
}

button:hover {
  background: var(--vscode-button-hoverBackground);
  cursor: pointer;
}

button.disabled {
  background: var(--vscode-activityBar-background);
  color: var(--vscode-activityBar-inactiveForeground);
  pointer-events: none;
}

.container {
  display: grid;
  height: 100%;
  grid-template-rows: 60px auto;
  grid-template-columns: 60% 40%;
}

.header {
  grid-column: 1 / 3;
  border-bottom: 1px solid var(--vscode-sideBar-border);
  display: flex;
  justify-content: space-between;
}

.packages-list {
  grid-row: 2;
  grid-column: 1;
  border-right: 1px solid var(--vscode-sideBar-border);
  overflow: auto;
}

a {  
  color: var(--vscode-editorLink-activeForeground);
  margin: 4px;  
}

a:hover {  
  background: var(--vscode-editor-hoverHighlightBackground);
  cursor: pointer;
}

#package-info{
  overflow: auto;
}
</style>
