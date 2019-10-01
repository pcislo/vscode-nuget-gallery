<template>
  <div class="container">
    <div class="header">
      <filters @filterChanged="updateFilter($event)" @filter="refreshList" />
    </div>
    <div class="packages-list">
      <packages-list :filter="filter" ref="packagesList" />
    </div>
    <div id="package-info">
      <button @click="sendProjectsReloadRequest">Refresh</button>
      <projects-panel :projects="projects" />
    </div>
  </div>
</template>

<script>
import Filters from "@/components/Filters";
import ProjectsPanel from "@/components/ProjectsPanel";
import PackagesList from "@/components/PackagesList";

import _ from "lodash";

const vscode = acquireVsCodeApi();

export default {
  name: "app",
  components: {
    Filters,
    ProjectsPanel,
    PackagesList
  },
  data() {
    return {
      filter: null,
      projects: [],
      debouncedListRefresh: _.debounce(this.refreshList, 500)
    };
  },
  methods: {
    refreshList() {
      this.$refs.packagesList.refresh();
    },
    updateFilter(value) {
      this.filter = value;
      this.debouncedListRefresh();
    },
    sendProjectsReloadRequest() {
      console.log(vscode);
      vscode.postMessage({
        command: "reloadProjects"
      });
      console.log("sendProjectsReloadRequest");
    }
  },
  created() {
    window.addEventListener("message", event => {
      console.log(event);
      this.projects = event.data;
    });
    this.sendProjectsReloadRequest();
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

.container {
  display: grid;
  height: 100%;
  grid-template-rows: 60px auto;
  grid-template-columns: 60% 40%;
}

.header {
  grid-column: 1 / 3;
  border-bottom: 1px solid var(--vscode-sideBar-border);
}
</style>
