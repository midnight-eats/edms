<template>
  <v-app>
  <v-locale-provider locale="ru">
    <v-navigation-drawer app v-model="drawer">
      <v-list nav dense>
        <v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
        <!--v-list-item prepend-icon="mdi-human" title="Документы" to="/documents"></v-list-item-->
        <v-list-item prepend-icon="mdi-file-document-multiple-outline" title="Кадровые документы" to="/hr-documents"></v-list-item>
        <v-list-item prepend-icon="mdi-file-document-multiple-outline" title="Служебные записки" to="/memos"></v-list-item>
        <v-list-item prepend-icon="mdi-file-sign" title="Договоры" to="/contracts"></v-list-item>
        <v-list-item prepend-icon="mdi-file-sign" title="ОРД" to="/administrative-documents"></v-list-item>
        <v-list-item prepend-icon="mdi-file-document-multiple-outline" title="Виды кадрового документа" to="/hr-document-types"></v-list-item>
        <v-list-item prepend-icon="mdi-file-document-multiple-outline" title="Типы служебной записки" to="/memo-types"></v-list-item>
        <v-list-item prepend-icon="mdi-file-document-multiple-outline" title="Типы договора" to="/contract-types"></v-list-item>
        <v-list-item prepend-icon="mdi-file-document-multiple-outline" title="Типы ОРД" to="/administrative-document-types"></v-list-item>
        <v-list-item prepend-icon="mdi-truck-fast" title="Способы доставки" to="/delivery-methods"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group" title="Департаменты и пользователи" to="/departments"></v-list-item>
        <v-list-item prepend-icon="mdi-badge-account-outline" title="Должности" to="/positions"></v-list-item>
        <v-list-item prepend-icon="mdi-face-agent" title="Контрагенты" to="/counterparties"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="Категории" to="/categories"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>EDMS</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-locale-provider>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue';
  const drawer = ref(null);
</script>