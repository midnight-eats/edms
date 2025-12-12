<template>
  <OneFieldDataTable
    title="Типы ОРД"
    dialog-title="типа ОРД"
    api-endpoint="/api/administrative-document-types"
  />
</template>

<script setup>
  import OneFieldDataTable from './OneFieldDataTable.vue';
</script>

<script mounted>
  console.log("mounted");
</script>