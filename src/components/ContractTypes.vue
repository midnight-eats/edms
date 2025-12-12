<template>
  <OneFieldDataTable
    title="Типы договора"
    dialog-title="типа договора"
    api-endpoint="/api/contract-types"
  />
</template>

<script setup>
  import OneFieldDataTable from './OneFieldDataTable.vue';
</script>

<script mounted>
  console.log("mounted");
</script>