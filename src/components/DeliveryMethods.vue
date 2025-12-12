<template>
  <OneFieldDataTable
    title="Способы доставки"
    dialog-title="способа доставки"
    api-endpoint="/api/delivery-methods"
  />
</template>

<script setup>
  import OneFieldDataTable from './OneFieldDataTable.vue';
</script>

<script mounted>
  console.log("mounted");
</script>