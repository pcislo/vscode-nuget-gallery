<template>
  <div v-if="status == 'loaded'">
    <template v-if="packages && packages.data && packages.data.length > 0">
      <packages-list-item
        v-for="(packageInfo, index) in packages.data"
        :packageInfo="packageInfo"
        :key="index"
        :isSelected="selectedPackage == packageInfo"
        @click.native="selectPackage(packageInfo)"
      ></packages-list-item>
    </template>
    <h4 v-else>No packages found</h4>
  </div>
  <loader v-else-if="status == 'loading'" />
  <div v-else>
    <h4>Error</h4>
  </div>
</template>

<script>
import PackagesListItem from "@/components/PackagesListItem";
import Loader from "@/components/Loader";
import axios from "axios";

export default {
  name: "PackagesList",
  components: {
    PackagesListItem,
    Loader
  },
  data() {
    return {
      packages: [],
      selectedPackage: null,
      status: "loaded"
    };
  },
  props: {
    filter: String
  },
  methods: {
    refresh() {
      this.selectPackage(null);
      this.packages = null;
      this.status = "loading";
      axios
        .get("https://api-v2v3search-0.nuget.org/query", {
          params: {
            q: this.filter
          }
        })
        .then(response => {
          this.packages = response.data;
          this.status = "loaded";

          //   packages.data.forEach(x => {
          //     x.authorsString = x.authors.join(", ");
          //     x.versions.reverse();
          //   });

          //   let template = document.getElementById("packages-list-items-template")
          //     .innerHTML;
          //   let result = Mustache.render(template, packages);
          //   document.getElementById(
          //     "packages-list-items-container"
          //   ).innerHTML = result;
        })
        .catch(err => {
          console.error(err);
          this.status = "error";
        });
    },
    selectPackage(selectedPackage) {
      this.selectedPackage = selectedPackage;
      this.$emit("packageChanged", selectedPackage);
    }
  },
  mounted() {
    this.refresh();
  }
};
</script>

<style lang="scss" scoped>
.packages-list {
  grid-row: 2;
  grid-column: 1;
  border-right: 1px solid var(--vscode-sideBar-border);
  overflow: auto;
}
</style>