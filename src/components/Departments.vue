<template>
  <v-sheet border rounded>
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon 
          color="medium-emphasis" 
          icon="mdi-book-multiple" 
          size="x-small" start>
        </v-icon>
        Подразделения
      </v-toolbar-title>

      <v-btn
        class="me-2"
        prepend-icon="mdi-plus"
        rounded="lg"
        text="Добавить"
        @click="addItem"
      ></v-btn>
    </v-toolbar>

    <v-row justify="space-between" dense>
      <v-col cols="12">
        <v-treeview
          :items="items"
          density="compact"
          item-title="name"
          item-value="id"
          activatable
          open-on-click
          border
          rounded
        ></v-treeview>
      </v-col>
    </v-row>
  </v-sheet>

  <v-dialog v-model="dialog" max-width="500">
    <v-card :title="`${isEditing ? 'Изменение' : 'Добавление'} подразделения`">
      <template v-slot:text>
        <v-row>
          <v-col v-if="errorMessage" cols="12">
            <v-label :text="errorMessage"></v-label>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="formModel.name" label="Название"></v-text-field>
          </v-col>
        </v-row>
      </template>

      <v-divider></v-divider>

      <v-card-actions class="bg-surface-light">
        <v-btn text="Отменить" variant="plain" @click="cancel"></v-btn>

        <v-spacer></v-spacer>

        <v-btn text="Сохранить" @click="save"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { ref, shallowRef, toRef, watch } from 'vue';
  import axios from 'axios';  

  const departments = ref([]);
  const dialog = shallowRef(false);  
  const formModel = ref(createNewRecord());
  const isEditing = toRef(() => !!formModel.value.id);
  const errorMessage = shallowRef("");
  const tempModel = createNewRecord();
  const items = ref([]);

  function traverseTree(tree) {
    for (const item of tree) {
      if (item.children && item.children.length > 0)
        traverseTree(item.children);
      else {
        Promise.all([
          axios.get(`/api/departments/children/${item.id}`)
        ])
        .then((responses) => {
          item.children = responses[0].data;
          return;
        });
      }

    }
    return null;
  }

  function loadData() {
    Promise.all([
      axios.get('/api/departments/')
    ])
    .then((responses) => {
      items.value = responses[0].data;
      //traverseTree(items.value);
    });
  }

  function createNewRecord () {
    return {
      id: 0,
      name: '',
      children: []
    };
  }

  function addItem() {
    formModel.value = createNewRecord();
    errorMessage.value = "";
    dialog.value = true;
  }

  function removeItem(id) {
    Promise.all([axios.post(`/api/departments/delete/${id}`)])
    .then((responses) => {
      const index = items.value.findIndex(item => item.id === id);
      items.value.splice(index, 1);
    });
  }

  function editItem(id) {
    tempModel.value = items.value.find(item => item.id === id);

    formModel.value = {
      id: tempModel.value.id,
      name: tempModel.value.name,
      children: tempModel.value.children
    };

    errorMessage.value = "";
    dialog.value = true;
  }

  function save() {
    if (formModel.value.name.length == 0) {
      errorMessage.value = "Все поля должны быть заполнены";
      return;
    }

    if (isEditing.value) {
      Promise.all([axios.post("/api/departments/update", formModel.value)])
      .then((responses) => {           
        const index = items.value.findIndex(item => item.id === formModel.value.id);
        items.value[index] = formModel.value;
      });
    } 
    else {
      Promise.all([axios.post("/api/departments/create", formModel.value)])
      .then((responses) => { 
        var serverDepartment = responses[0].data;
        console.log(serverDepartment);     
        items.value.push(serverDepartment);
      });
    }

    errorMessage.value = "";
    dialog.value = false;
  }

  function cancel() {
    console.log(formModel.value.positionId);
    errorMessage.value = "";
    dialog.value = false;
  }

  loadData();
</script>

<script mounted>
    console.log("mounted");
</script>
