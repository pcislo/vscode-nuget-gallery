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
        :key="index">
        <input type="checkbox" v-model="selectedProjects" :value="project" />
        <span>{{ project.projectName }}</span>
        <span v-if="project.version">
          <span class="version-badge">{{ project.version }} </span>
          <a @click="uninstall([project])"><u>Uninstall</u></a>
        </span>
        <span v-else>
          <span>
            <a @click="install([project])"><u>Install</u></a>
          </span>
        </span>
      </div>
    </div>
    <loader v-else />
    <div class="package-version-container">
      <select
        class="package-version-selector"
        v-model="selectedVersion"
        @change="getInfoPackage()"
      >
        <option :key="version" v-for="version in versions" :value="version">
          {{ version }}
        </option>
      </select>
      <button
        :class="{ disabled: !canInstall() }"
        @click="install(selectedProjects)"
      >
        Install
      </button>
      <button
        :class="{ disabled: !canUninstall() }"
        @click="uninstall(selectedProjects)"
      >
        Uninstall
      </button>
    </div>
   
    <div id="package-description-container">
      <div class="package-description" v-if="packageMetadata">
        <h2 class="title-description">Description</h2>
      
        <p>{{ packageMetadata.description }}</p>

        <table class="table">
          <tbody>
            <tr>
              <td>Open in:</td>
              <td>
                <a target="_blank" :href="packageMetadata.nugetUrl">nuget.org</a>
              </td>
            </tr>
            <tr>
              <td>Version:</td>
              <td>{{ packageMetadata.version }}</td>
            </tr>
            <tr>
              <td>Date Published:</td>
              <td>{{ packageMetadata.datePublished }}</td>
            </tr>
            <tr>
              <td>Author(s):</td>
              <td>{{ packageMetadata.authors }}</td>
            </tr>
            <tr>
              <td>License:</td>
              <td>
                <a v-if="packageMetadata.license !== undefined && packageMetadata.license !== ''" target="_blank" :href="packageMetadata.licenseUrl">{{ packageMetadata.license }}</a>
                <a v-else target="_blank" :href="packageMetadata.licenseUrl">View license</a>
              </td>
            </tr>
            <tr>
              <td>Project Url:</td>
              <td>
                <a target="_blank" :href="packageMetadata.projectUrl">{{ packageMetadata.projectUrl.slice(0, 85) }}</a>
              </td>
            </tr>
            <tr>
              <td>Tags:</td>
              <td>{{ packageMetadata.tags.join(', ') }}</td>
            </tr>
          </tbody>
        </table>

        <h2 class="title-description">Dependencies</h2>
        
        <ul>
          <li :key="groups.targetFramework" v-for="groups in packageMetadata.dependencyGroups">
            {{groups.targetFramework}}
            <ul>
              <li :key="dep.id" v-for="dep in groups.dependencies">{{dep.id}} {{dep.range}}</li>
            </ul>
          </li>
          <li v-if="packageMetadata.dependencyGroups.length === 0">No dependencies</li>
        </ul>
      </div>
      <loader v-else />
    </div>

  </div>
</template>

<script>
import Loader from "./Loader";
import axios from "axios";
import { setupCache } from 'axios-cache-adapter';
import moment from 'moment';

const cache = setupCache({
  maxAge: 10 * 60 * 1000
});

export default {
  name: "ProjectsPanel",
  components: {
    Loader,
  },
  data() {
    return {
      selectedProjects: [],
      selectedVersion: null,
      packageMetadata: null
    };
  },
  watch: {
    versions: {
      immediate: true,
      handler(newValue) {
        if (newValue && newValue.length > 0) {
          this.selectedVersion = newValue[0];
          this.getInfoPackage();
        }
      },
    },
    projects(newValue) {
      let oldSelectedProjects = this.selectedProjects;
      this.selectedProjects = [];
      oldSelectedProjects.forEach((x) => {
        let previouslySelectedProject = newValue.find(
          (p) => p.projectName == x.projectName
        );
        if (previouslySelectedProject) {
          this.selectedProjects.push(previouslySelectedProject);
        }
      });
    },
  },
  props: {
    projects: Array,
    versions: Array,
    packageId: String,
    packageAuthors: Array,
  },
  methods: {
    install(projectsToInstall) {
      if (projectsToInstall && projectsToInstall.length > 0) {
        this.$emit("install", {
          selectedProjects: projectsToInstall,
          selectedVersion: this.selectedVersion,
        });
      }
    },
    uninstall(projectsToUninstall) {
      if (projectsToUninstall && projectsToUninstall.length > 0) {
        this.$emit("uninstall", {
          selectedProjects: projectsToUninstall,
        });
      }
    },
    canInstall() {
      let safeSelectedVersion = this.selectedVersion;
      return (
        this.selectedProjects &&
        this.selectedProjects.length > 0 &&
        this.selectedProjects.every(function (p) {
          return (
            p.version === null ||
            (safeSelectedVersion !== null && p.version !== safeSelectedVersion)
          );
        })
      );
    },
    canUninstall() {
      let safeSelectedVersion = this.selectedVersion;
      return (
        this.selectedProjects &&
        this.selectedProjects.length > 0 &&
        this.selectedProjects.every(function (project) {
          return project.version && project.version === safeSelectedVersion;
        })
      );
    },
    getInfoPackage() {
      this.packageMetadata = null;
      const url = `https://api.nuget.org/v3/registration5-gz-semver2/${this.packageId}/index.json`.toLowerCase();

      const api = axios.create({
        adapter: cache.adapter
      });

      api({
        url: url,
        method: 'get'
      }).then( async(response) => {
        let result = [];
        const exists = this.existsItem(response.data.items);

        if (exists) {
          result = this.filter(response.data.items.map(x => x.items));
        } else {
          const items = response.data.items;
          let itemsPage = [];
          let filter = [];
          for (let index = 0, length = items.length; index < length; index++) {
            itemsPage = await this.getRegistrationPage(items[index]['@id']);
            filter = itemsPage.items.filter(x => x.catalogEntry.version == this.selectedVersion);
            if(filter.length > 0) {
              result = filter;
              break;
            }
          }
        }

        if(result.length > 0) {    
          const catalogEntry = result[0].catalogEntry;    
          const dependencyGroups = this.getDependencies(catalogEntry);        

          this.packageMetadata = {
            version: catalogEntry.version,
            authors: catalogEntry.authors,
            license: catalogEntry.license,
            licenseUrl: catalogEntry.licenseUrl,
            projectUrl: catalogEntry.projectUrl,
            description: catalogEntry.description,
            tags: catalogEntry.tags,
            datePublished: moment(catalogEntry.published).format('dddd, MMMM D, YYYY (MM/DD/YYYY)'),
            nugetUrl: `https://www.nuget.org/packages/${this.packageId}/${this.selectedVersion}`,
            dependencyGroups: dependencyGroups
          };
        } else {
          this.packageMetadata = {
            description: 'Error on request',
            dependencyGroups: []
          };
        }
      });  
    },
    getDependencies(catalogEntry) {
      let dependencyGroups = [];

      if(catalogEntry.dependencyGroups !== undefined) {
        let dependencies = [];

        for (let indexGroup = 0, lengthGroup = catalogEntry.dependencyGroups.length; indexGroup < lengthGroup; indexGroup++) {
          dependencies = [];
          const elementGroup = catalogEntry.dependencyGroups[indexGroup];

          let targetFramework = elementGroup.targetFramework === undefined || elementGroup.targetFramework === '' 
            ? 'Any, Version=v0.0'
            : elementGroup.targetFramework;

          if (elementGroup.dependencies !== undefined) {
            for (let indexDep = 0, lengthDep = elementGroup.dependencies.length;  indexDep < lengthDep; indexDep++) {
              let elementDep = elementGroup.dependencies[indexDep];
              dependencies.push({
                id: elementDep.id,
                range: elementDep.range
              });
            }
          } else {
            dependencies.push({
              id: 'No dependencies',
              range: ''
            });
          }                      

          dependencyGroups.push({
            targetFramework: targetFramework,
            dependencies: dependencies
          });
        }
      }
      return dependencyGroups;
    },
    existsItem(items) {
      let exists = false;
      for (let i in items) {
        if ('items' in items[i]) {
          exists = true;
          break;
        }
      }
      return exists;
    },
    filter(items) {
      let result = [];

      let filterResult = [];
      let element = {};
      for (let index = 0, length = items.length; index < length; index++) {
        element = items[index];
        filterResult = element.filter(x => x.catalogEntry.version == this.selectedVersion);              
        if (filterResult.length > 0) {
          result = filterResult;
          break;
        }     
      }
      return result;
    },
    getRegistrationPage(url) {
      const api = axios.create({
        adapter: cache.adapter
      });

      return api({
        url: url,
        method: 'get'
      }).then((response) => {
        return response.data;
      });
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

#package-description-container {
  margin: 5px 0px 0px 4px;
  border-top: 1px solid #fff;
}

.package-description a {  
  margin: 0;
  padding: 0;
} 

.package-description .table {
  border: 0;
}

.package-description .table tbody td:nth-child(1) {
  width: 100px;
}

.package-description .title-description {
  font-size: 14px;
  font-weight: bold;
}
</style>