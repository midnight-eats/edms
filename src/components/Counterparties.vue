<template>
  <OneFieldDataTable
    title="Контрагенты"
    dialog-title="контрагента"
    api-endpoint="/api/counterparties"
  />
</template>

<script setup>
  import OneFieldDataTable from './OneFieldDataTable.vue';
</script>

<script mounted>
  console.log("mounted");
</script>