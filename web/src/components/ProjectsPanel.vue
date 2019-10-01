<template>
  <div id="package-info-template">
    <div class="package-header">
      <button>Refresh</button>
      <!-- <span class="title">{{ data.id }}</span> by {{ data.authorsString }} -->
    </div>
    <div class="project-version-info">
      <div v-for="(project, index) in projects" :key="index">
        <input type="checkbox" />
        <span>{{ project.projectName }}</span>
        <!-- <span class="version-badge">{{ project.version }}</span> -->
      </div>
    </div>
    <div class="package-version-container">
      <select id="package-version-selector" v-if="selectedPackage">
        <option :value="selectedPackage.version">
          {{ selectedPackage.version }}
        </option>
      </select>
      <button>Install</button>
      <button>Uninstall</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProjectsPanel",
  props: {
    projects: Array,
    selectedPackage: Object
  }
};
</script>