<template>
  <div>
    <select v-model="selectedSource">
      <option :key="source.name" v-for="source in sources" :value="source">
        {{ source.name }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: "SourceSelector",
  data() {
    return {
      source: null
    };
  },
  watch: {
    sources(newValue) {
      if (newValue && newValue.length > 0) this.selectedSource = newValue[0];
      else this.selectedSource = null;
    }
  },
  props: {
    sources: Array
  },
  computed: {
    selectedSource: {
      get() {
        return this.source;
      },
      set(value) {
        this.source = value;
        this.$emit("sourceChanged", this.source);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
select {
  margin: 10px;
  width: 200px;
}
</style>