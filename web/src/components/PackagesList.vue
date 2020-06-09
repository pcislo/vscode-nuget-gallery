<template>
  <div class="packages-list-container" v-if="status == 'loaded'" @scroll="onScroll($event)">
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
    filter: String,
    isPrerelease: Boolean,
    source: Object
  },
  watch: {
    source() {
      this.refresh();
    },
    isPrerelease(){
      this.refresh();
    }
  },
  methods: {
    onScroll(e) {
      if (
        this.morePackagesStatus == "loading" ||
        this.morePackagesStatus == "all"
      ) {
        return;
      }

      let bottom = e.target.scrollTop + e.target.getBoundingClientRect().height;
      let height = this.$refs.innerContainer.getBoundingClientRect().height;

      if (bottom > height - 200 && this.morePackagesStatus == "loaded") {
        this.page += 1;
        this.queryNextPackagesPage();
      }
    },
    refresh() {
      if (!this.source) return;

      this.status = "loading";

      this.page = 0;
      this.selectPackage(null);
      this.packages = null;

      this.$emit("refreshPackages", {
        source: this.source,
        page: this.page,
        pageSize: this.pageSize,
        filter: this.filter,
        prerelease: this.isPrerelease
      });
    },
    listPackages(packages) {
      this.packages = packages;
      this.status = "loaded";
    },
    queryNextPackagesPage() {
      if (!this.source) return;

      this.morePackagesStatus = "loading";

      this.$emit("queryPackagesPage", {
        source: this.source,
        page: this.page,
        pageSize: this.pageSize,
        filter: this.filter
      });
    },
    appendPackages(packages) {
      if (packages.length > 0) {
        this.morePackagesStatus = "loaded";
        packages.forEach(p => this.packages.push(p));
      } else {
        this.morePackagesStatus = "all";
      }
    },
    selectPackage(selectedPackage) {
      this.selectedPackage = selectedPackage;
      this.$emit("packageChanged", selectedPackage);
    }
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