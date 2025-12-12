<template>
  <OneFieldDataTable
    title="Виды кадрового документа"
    dialog-title="вида кадрового документа"
    api-endpoint="/api/hr-document-types"
  />
</template>

<script setup>
  import OneFieldDataTable from './OneFieldDataTable.vue';
</script>

<script mounted>
  console.log("mounted");
</script>