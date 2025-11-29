<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer">
      <v-list nav dense>
        <!-- Link to HomeView -->
        <v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
        <!-- Link to DashboardView -->
        <v-list-item prepend-icon="mdi-view-dashboard" title="Users" to="/users"></v-list-item>
        <!-- Link to ProfileView -->
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
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
const drawer = ref(null);
</script>