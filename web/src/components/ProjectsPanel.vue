<template>
  <div class="projects-panel">
    <div class="projects-panel-header">
      <button @click="$emit('refreshRequested')">Refresh</button>
      <span class="title">{{ packageId }}</span> by
      {{ packageAuthors | join }}
    </div>
    <div class="projects-list" v-if="projects">
      <div
        class="projects-list-item"
        v-for="(project, index) in projects"
        :key="index"
      >
        <input type="checkbox" v-model="selectedProjects" :value="project" />
        <span>{{ project.projectName }}</span>
        <span v-if="project.version">
          <span class="version-badge">{{
              project.version
            }}            
          </span>             
          <a  @click="uninstall([project])"><u>Uninstall</u></a>
        </span>
        <span v-else>
          <span>
            <a  @click="install([project])"><u>Install</u></a>
          </span>
        </span>
      </div>
    </div>
    <loader v-else />
    <div class="package-version-container">
      <select class="package-version-selector" v-model="selectedVersion">
        <option :key="version" v-for="version in versions" :value="version">
          {{ version }}
        </option>
      </select>
      <button :class="{ disabled: !canInstall() }" @click="install(selectedProjects)">Install</button>
      <button :class="{ disabled: !canUninstall() }" @click="uninstall(selectedProjects)">Uninstall</button>
    </div>
  </div>
</template>

<script>
import Loader from "./Loader";

export default {
  name: "ProjectsPanel",
  components: {
    Loader
  },
  data() {
    return {
      selectedProjects: [],
      selectedVersion: null
    };
  },
  watch: {
    versions: {
      immediate: true,
      handler(newValue) {
        if (newValue && newValue.length > 0) this.selectedVersion = newValue[0];
      }
    },
    projects(newValue) {
      let oldSelectedProjects = this.selectedProjects;
      this.selectedProjects = [];
      oldSelectedProjects.forEach(x => {
        let previouslySelectedProject = newValue.find(
          p => p.projectName == x.projectName
        );
        if (previouslySelectedProject) {
          this.selectedProjects.push(previouslySelectedProject);
        }
      });
    }
  },
  props: {
    projects: Array,
    versions: Array,
    packageId: String,
    packageAuthors: Array
  },
  methods: {
    install(projectsToInstall) {
      if (projectsToInstall && projectsToInstall.length > 0) {
        this.$emit("install", {
          selectedProjects: projectsToInstall,
          selectedVersion: this.selectedVersion
        });
      }
    },
    uninstall(projectsToUninstall) {      
      if (projectsToUninstall && projectsToUninstall.length > 0) {
        this.$emit("uninstall", {
          selectedProjects: projectsToUninstall
        });
      }
    },
    canInstall() {
      let safeSelectedVersion = this.selectedVersion;
      return (this.selectedProjects 
      && this.selectedProjects.length > 0
      && this.selectedProjects.every(function (p) {
        return (p.version === null 
        || (safeSelectedVersion !== null && p.version !== safeSelectedVersion));        
      }));
    },
    canUninstall() {      
      let safeSelectedVersion = this.selectedVersion;
      return (this.selectedProjects 
      && this.selectedProjects.length > 0
      && this.selectedProjects.every(function (project) {        
        return (project.version && project.version === safeSelectedVersion)        
      }));
    }
  }
};
</script>

<style lang="scss" scoped>
.package-version-container {
  margin-top: 3px;
}
.projects-list {
  border-top: 1px solid var(--vscode-sideBar-border);
  border-bottom: 1px solid var(--vscode-sideBar-border);  
}
.projects-list-item {
  margin-bottom: 4px;
}

.version-badge {
  font-size: 12px;
  font-weight: bold;
  padding: 0px 2px;
  margin-left: 4px;
  background: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
}

.projects-panel .loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.package-version-selector {
  margin: 4px;
}

.projects-panel-header {
  grid-row: 1;
  grid-column: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.projects-panel-header .title {
  font-weight: bold;
  font-size: 16px;
  margin-left: 10px;
}

button {
  margin: 4px;
}
</style>