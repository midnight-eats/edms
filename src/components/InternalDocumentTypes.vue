<template>
  <OneFieldDataTable
    title="Типы внутреннего документа"
    dialog-title="типа внутреннего документа"
    api-endpoint="/api/internal-document-types"
  />
</template>

<script setup>
  import OneFieldDataTable from './OneFieldDataTable.vue';
</script>

<script mounted>
  console.log("mounted");
</script>