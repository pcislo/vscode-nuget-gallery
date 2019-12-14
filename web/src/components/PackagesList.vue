<template>
  <div
    class="packages-list-container"
    v-if="status == 'loaded'"
    @scroll="onScroll"
  >
    <div ref="innerContainer" v-if="packages && packages.length > 0">
      <packages-list-item
        v-for="(packageInfo, index) in packages"
        :packageInfo="packageInfo"
        :key="index"
        :isSelected="selectedPackage == packageInfo"
        @click.native="selectPackage(packageInfo)"
      ></packages-list-item>
    </div>
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
      status: "loaded",
      morePackagesStatus: "loaded",
      page: 0,
      pageSize: 20
    };
  },
  props: {
    filter: String
  },
  methods: {
    onScroll(e) {
      let bottom = e.target.scrollTop + e.target.getBoundingClientRect().height;
      let height = this.$refs.innerContainer.getBoundingClientRect().height;
      if (bottom > height - 200 && this.morePackagesStatus == "loaded") {
        this.page += 1;
        this.appendPackages();
      }
    },
    appendPackages() {
      this.morePackagesStatus = "loading";
      axios
        .get("https://api-v2v3search-0.nuget.org/query", {
          params: {
            q: this.filter,
            take: this.pageSize,
            skip: this.page * this.pageSize
          }
        })
        .then(response => {
          this.morePackagesStatus = "loaded";
          if (response.data && response.data.data.length > 0)
            response.data.data.forEach(x => this.packages.push(x));
          else this.morePackagesStatus = "all";
        })
        .catch(err => {
          console.error(err);
          this.morePackagesStatus = "error";
        });
    },
    refresh() {
      this.page = 0;
      this.selectPackage(null);
      this.packages = null;
      this.status = "loading";
      axios
        .get("https://api-v2v3search-0.nuget.org/query", {
          params: {
            q: this.filter,
            take: this.pageSize
          }
        })
        .then(response => {
          if (response.data) this.packages = response.data.data;
          this.status = "loaded";
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
.packages-list-container {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}
</style>