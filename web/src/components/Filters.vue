<template>
  <div>
    <input @input="$emit('filterChanged', $event.target.value)" />
    <button @click="$emit('filter')">Filter</button>
  </div>
</template>

<script>
export default {
  name: "Filters"
};
</script>

<style lang="scss" scoped>
input {
  margin: 10px;
  width: 200px;
}
</style>