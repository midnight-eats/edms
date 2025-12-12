<template>
  <OneFieldDataTable
    title="Типы служебной записки"
    dialog-title="типа служебной записки"
    api-endpoint="/api/memo-types"
  />
</template>

<script setup>
  import OneFieldDataTable from './OneFieldDataTable.vue';
</script>

<script mounted>
  console.log("mounted");
</script>