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
        <span v-if="project.version" class="version-badge">{{
          project.version
        }}</span>
      </div>
    </div>
    <loader v-else />
    <div class="package-version-container">
      <select class="package-version-selector" v-model="selectedVersion">
        <option :key="version" v-for="version in versions" :value="version">
          {{ version }}
        </option>
      </select>
      <button @click="install">Install</button>
      <button @click="uninstall">Uninstall</button>
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
    install() {
      if (this.selectedProjects && this.selectedProjects.length > 0) {
        this.$emit("install", {
          selectedProjects: this.selectedProjects,
          selectedVersion: this.selectedVersion
        });
      }
    },
    uninstall() {
      if (this.selectedProjects && this.selectedProjects.length > 0) {
        this.$emit("uninstall", {
          selectedProjects: this.selectedProjects
        });
      }
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