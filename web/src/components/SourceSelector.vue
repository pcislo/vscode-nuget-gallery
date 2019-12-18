<template>
  <div>
    <select>
      <option :key="source.name" v-for="source in sources">
        {{ source.name }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: "SourceSelector",
  props: {
    sources: Array
  }
};
</script>

<style lang="scss" scoped>
select {
  margin: 10px;
  width: 200px;
}
</style>