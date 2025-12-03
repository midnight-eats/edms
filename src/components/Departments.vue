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
        @click="addDepartment"
      ></v-btn>
    </v-toolbar>

    <v-row justify="space-between" dense>
      <v-col cols="12">
        <v-treeview
          :items="departments"
          item-title="name"
          item-value="id"
          item-key="id"
          density="compact"
          activatable
          border
          rounded
        >
          <template v-slot:append="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-icon 
                color="medium-emphasis" 
                icon="mdi-plus" 
                size="small" 
                @click="addDepartment(item)">
              </v-icon>
              <v-icon 
                color="medium-emphasis" 
                icon="mdi-pencil" 
                size="small" 
                @click="editDepartment(item)">
              </v-icon>
              <v-icon 
                color="medium-emphasis" 
                icon="mdi-delete" 
                size="small" 
                @click="removeDepartment(item)">
              </v-icon>
            </div>
          </template>
        </v-treeview>
      </v-col>
    </v-row>
  </v-sheet>

  <v-dialog v-model="departmentDialog" max-width="500">
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
  const departmentDialog = shallowRef(false);  
  const formModel = ref(createNewDepartment());
  const isEditing = toRef(() => !!formModel.value.id);
  const errorMessage = shallowRef("");
  const tempModel = createNewDepartment();

  function loadData() {
    Promise.all([
      axios.get('/api/departments/')
    ])
    .then((responses) => {
      departments.value = responses[0].data;
    });
  }

  function createNewDepartment () {
    return {
      id: 0,
      name: '',
      children: []
    };
  }

  function addDepartment() {
    formModel.value = createNewDepartment();
    errorMessage.value = "";
    departmentDialog.value = true;
  }

  function removeDepartment(id) {
    Promise.all([axios.post(`/api/departments/delete/${id}`)])
    .then((responses) => {
      const index = departments.value.findIndex(item => item.id === id);
      departments.value.splice(index, 1);
    });
  }

  function editItem(id) {
    tempModel.value = departments.value.find(item => item.id === id);

    formModel.value = {
      id: tempModel.value.id,
      name: tempModel.value.name,
      children: tempModel.value.children
    };

    errorMessage.value = "";
    departmentDialog.value = true;
  }

  function save() {
    if (formModel.value.name.length == 0) {
      errorMessage.value = "Все поля должны быть заполнены";
      return;
    }

    if (isEditing.value) {
      Promise.all([axios.post("/api/departments/update", formModel.value)])
      .then((responses) => {           
        const index = departments.value.findIndex(item => item.id === formModel.value.id);
        departments.value[index] = formModel.value;
      });
    } 
    else {
      Promise.all([axios.post("/api/departments/create", formModel.value)])
      .then((responses) => { 
        var serverDepartment = responses[0].data;
        console.log(serverDepartment);     
        departments.value.push(serverDepartment);
      });
    }

    errorMessage.value = "";
    departmentDialog.value = false;
  }

  function cancel() {
    errorMessage.value = "";
    departmentDialog.value = false;
  }

  loadData();
</script>

<script mounted>
    console.log("mounted");
</script>
