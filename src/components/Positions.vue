<template>
  <OneFieldDataTable
    title="Должности"
    dialog-title="должности"
    api-endpoint="/api/positions"
  />
</template>

<script setup>
  import OneFieldDataTable from './OneFieldDataTable.vue';
</script>

<script mounted>
  console.log("mounted");
</script>