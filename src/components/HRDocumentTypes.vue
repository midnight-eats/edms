<template>
  <OneFieldDataTable
    title="Типы кадрового документа"
    dialog-title="типа кадрового документа"
    api-endpoint="/api/hr-document-types"
  />
</template>

<script setup>
  import OneFieldDataTable from './OneFieldDataTable.vue';
</script>

<script mounted>
  console.log("mounted");
</script>