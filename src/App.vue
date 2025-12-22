<template>
  <v-app>
  <v-locale-provider locale="ru">
    <v-navigation-drawer width='400' app v-model="drawer">
      <v-list nav dense>
        <!--v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item-->
        <v-list-group value="activeDocuments">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-bell-ring"
              title="Активные"
            ></v-list-item>       
          </template>
          <v-list-item prepend-icon="mdi-file-document-multiple" title="Кадровые документы" to="/active/hr-documents"></v-list-item>
          <v-list-item prepend-icon="mdi-note-edit-outline" title="Служебные записки" to="/active/memos"></v-list-item>
          <v-list-item prepend-icon="mdi-file-sign" title="Договоры" to="/active/contracts"></v-list-item>
          <v-list-item prepend-icon="mdi-order-bool-descending-variant" title="ОРД" to="/active/administrative-documents"></v-list-item>
          <v-list-item prepend-icon="mdi-email-arrow-right" title="Исходящие корреспонденции" to="/active/outgoing-correspondences"></v-list-item>
          <v-list-item prepend-icon="mdi-email-arrow-left" title="Входящие корреспонденции" to="/active/incoming-correspondences"></v-list-item>
          <!--v-list-item prepend-icon="mdi-folder-home" title="Внутренние документы" to="/internal-documents"></v-list-item-->
        </v-list-group>
        <v-list-group value="archivedDocuments">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-archive"
              title="Архив"
            ></v-list-item>
          </template>
          <v-list-item prepend-icon="mdi-file-document-multiple" title="Кадровые документы" to="/archived/hr-documents"></v-list-item>
          <v-list-item prepend-icon="mdi-note-edit-outline" title="Служебные записки" to="/archived/memos"></v-list-item>
          <v-list-item prepend-icon="mdi-file-sign" title="Договоры" to="/archived/contracts"></v-list-item>
          <v-list-item prepend-icon="mdi-order-bool-descending-variant" title="ОРД" to="/archived/administrative-documents"></v-list-item>
          <v-list-item prepend-icon="mdi-email-arrow-right" title="Исходящие корреспонденции" to="/archived/outgoing-correspondences"></v-list-item>
          <v-list-item prepend-icon="mdi-email-arrow-left" title="Входящие корреспонденции" to="/archived/incoming-correspondences"></v-list-item>
          <!--v-list-item prepend-icon="mdi-folder-home" title="Внутренние документы" to="/internal-documents"></v-list-item-->
        </v-list-group>
        <v-list-group value="documents">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-file-document-multiple-outline"
              title="Документы"
            ></v-list-item>       
          </template>
          <v-list-item prepend-icon="mdi-file-document-multiple" title="Кадровые документы" to="/hr-documents"></v-list-item>
          <v-list-item prepend-icon="mdi-note-edit-outline" title="Служебные записки" to="/memos"></v-list-item>
          <v-list-item prepend-icon="mdi-file-sign" title="Договоры" to="/contracts"></v-list-item>
          <v-list-item prepend-icon="mdi-order-bool-descending-variant" title="ОРД" to="/administrative-documents"></v-list-item>
          <v-list-item prepend-icon="mdi-email-arrow-right" title="Исходящие корреспонденции" to="/outgoing-correspondences"></v-list-item>
          <v-list-item prepend-icon="mdi-email-arrow-left" title="Входящие корреспонденции" to="/incoming-correspondences"></v-list-item>
          <v-list-item prepend-icon="mdi-folder-home" title="Внутренние документы" to="/internal-documents"></v-list-item>
        </v-list-group>

        <v-list-group value="documentTypes">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-list-box-outline"
              title="Типы документов"
            ></v-list-item>          
          </template>
          <v-list-item prepend-icon="mdi-file-document-multiple" title="Виды кадрового документа" to="/hr-document-types"></v-list-item>
          <v-list-item prepend-icon="mdi-note-edit-outline" title="Типы служебной записки" to="/memo-types"></v-list-item>
          <v-list-item prepend-icon="mdi-file-sign" title="Типы договора" to="/contract-types"></v-list-item>
          <v-list-item prepend-icon="mdi-order-bool-descending-variant" title="Типы ОРД" to="/administrative-document-types"></v-list-item>
          <v-list-item prepend-icon="mdi-folder-home" title="Типы внутреннего документа" to="/internal-document-types"></v-list-item>
        </v-list-group>

        <v-list-group value="people">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-account-group-outline"
              title="Люди"
            ></v-list-item>
          </template>
          <v-list-item prepend-icon="mdi-account-group" title="Департаменты и пользователи" to="/departments"></v-list-item>
          <v-list-item prepend-icon="mdi-badge-account-outline" title="Должности" to="/positions"></v-list-item>
          <v-list-item prepend-icon="mdi-face-agent" title="Контрагенты" to="/counterparties"></v-list-item>
        </v-list-group>
        
          <v-list-item prepend-icon="mdi-truck-fast" title="Способы доставки" to="/delivery-methods"></v-list-item>
          <!--v-list-item prepend-icon="mdi-account" title="Категории" to="/categories"></v-list-item-->
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app v-model="appbar">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>EDMS</v-toolbar-title>
      <v-btn 
        text="Выйти"
        href="/login"
        @click='logOut()'
        >
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-locale-provider>
  </v-app>
</template>

<script>

  import { ref } from 'vue';

export default 
{
  name: "sidebar",

  data() 
  {
    console.log("DATA");

    return  {
      drawer: ref(true),
      appbar: ref(true),

    };
  },
  mounted() 
  { 

    this.emitter.on("loggedin", () => this.showAll());
    this.emitter.on("loggedout", () => this.hideAll());

    //this.emitter.on("toggle-sidebar", isOpen => {
    //  this.isOpen = isOpen;
    console.log("MOUNTED");

  },
  setup()
  {
    //drawer.value = false
    console.log("SETUP");
    //this.drawer.value = false;    
  },
  methods:
  {
    showAll() {
      console.log("LOGINED!!!");
      this.drawer = true;
      this.appbar = true;
    },

    hideAll() {
      console.log("LOGGED OUT!!!");
      this.drawer = false;
      this.appbar = false;
    },

    logOut() {
      localStorage.removeItem('userToken');
    }
  }


}
</script>