<template>
  <div class="packages-list-item" :class="{ selected: isSelected }">
    <img :src="iconUrl" @error="packageInfo.iconUrl = null" />
    <div class="package-header">
      <span class="title">{{ packageInfo.id }}</span> by
      {{ authors }}
    </div>
    <div class="package-version">v{{ packageInfo.version }}</div>
    <div v-if="packageInfo.summary" class="package-description">
      {{ packageInfo.summary }}
    </div>
    <div v-else class="package-description">{{ packageInfo.description }}</div>
  </div>
</template>

<script>
export default {
  name: "PackagesListItem",
  props: {
    packageInfo: Object,
    isSelected: Boolean
  },
  computed: {
    authors() {
      return this.packageInfo && this.packageInfo.authors
        ? this.packageInfo.authors.join(", ")
        : null;
    },
    iconUrl() {
      return this.packageInfo && this.packageInfo.iconUrl
        ? this.packageInfo.iconUrl
        : "https://www.nuget.org/Content/gallery/img/default-package-icon.svg";
    }
  }
};
</script>

<style lang="scss" scoped>
.packages-list-item:hover {
  background: var(--vscode-list-hoverBackground);
  color: var(--vscode-list-hoverForeground);
  cursor: pointer;
}

.packages-list-item.selected {
  background: var(--vscode-list-activeSelectionBackground);
  color: var(--vscode-list-activeSelectionForeground);
}

.packages-list-item {
  height: 60px;
  margin: 3px;
  display: grid;
  grid-template-columns: 60px auto 60px;
  grid-template-rows: 20px auto;
  grid-gap: 3px;

  .package-header {
    grid-row: 1;
    grid-column: 2;
    .title {
      font-weight: bold;
      font-size: 16px;
    }
  }

  .package-description {
    grid-column: 2 / 3;
    overflow: hidden;
  }

  .package-version {
    grid-column: 3;
    margin-right: 2px;
    text-align: right;
  }

  img {
    grid-row: 1 / 3;
    width: 50px;
    height: 50px;
    margin: 5px;
  }
}
</style>