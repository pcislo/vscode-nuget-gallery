<template>
  <div>
    <input class="filterBox" @input="$emit('filterChanged', $event.target.value)" />
    <button @click="$emit('filter')">Filter</button>
    <input v-model="isPrerelease"  class="prereleaseBox" type="checkbox" /><span>Prerelease</span>
  </div>
</template>

<script>
export default {
  name: "Filters",
  data(){
    return {
      isPrerelease: false
    }
  },
  watch: {
    isPrerelease(newValue){
      this.$emit("isPrerelease", newValue)
    }
  }
};
</script>

<style lang="scss" scoped>
input.filterBox {
  margin: 10px;
  width: 200px;
}

input.prereleaseBox {
  margin-left: 10px;
}

</style>