<template>
  <v-app>
  <v-locale-provider locale="ru">
    <v-navigation-drawer app v-model="drawer">
      <v-list nav dense>
        <v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
        <!--v-list-item prepend-icon="mdi-view-dashboard" title="Пользователи" to="/users"></v-list-item-->
        <v-list-item prepend-icon="mdi-file-document-multiple-outline" title="Документы" to="/documents"></v-list-item>
        <v-list-item prepend-icon="mdi-file-document-multiple-outline" title="Виды кадрового документа" to="/hr-document-types"></v-list-item>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Департаменты и пользователи" to="/departments"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="Должности" to="/positions"></v-list-item>
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