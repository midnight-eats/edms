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
        @click="addDepartment(null)"
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
                @click="addDepartment(item.id)">
              </v-icon>
              <v-icon 
                color="medium-emphasis" 
                icon="mdi-pencil" 
                size="small" 
                @click="editDepartment(item.id)">
              </v-icon>
              <v-icon 
                color="medium-emphasis" 
                icon="mdi-delete" 
                size="small" 
                @click="removeDepartment(item.id, item.departmentId)">
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
        <v-btn text="Отменить" variant="plain" @click="cancelDepartment"></v-btn>

        <v-spacer></v-spacer>

        <v-btn text="Сохранить" @click="saveDepartment"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { ref, shallowRef, toRef } from 'vue';
  import axios from 'axios';  

  const departments = ref([]);
  const departmentDialog = shallowRef(false);  
  const formModel = ref(createNewDepartment());
  const tempModel = createNewDepartment();
  const isEditing = toRef(() => !!formModel.value.id);
  const errorMessage = shallowRef("");

  function findItem(items, id) {
    for (const item of items) {
      if (item.id === id)
        return item;

      if (item.children && item.children.length > 0) {
        const found = findItem(item.children, id);

        if (found) 
          return found;
      }
    }

    return null;
  }

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
      departmentId: null
    };
  }

  function addDepartment(id) {
    formModel.value = createNewDepartment();
    formModel.value.departmentId = id;
    errorMessage.value = "";
    departmentDialog.value = true;
  }

  function removeDepartment(id, parentId) {
    Promise.all([axios.post(`/api/departments/delete/${id}`)])
    .then((responses) => {
      const department = findItem(departments.value, parentId);
      department = formModel.value;
      if (department) {
        if (department.children) {
          const index = department.children.findIndex(item => item.id === id);
          department.children.splice(index, 1);
        }
      } else {
        const index = departments.value.findIndex(item => item.id === id);
        department.value.splice(index, 1);
      }
    });
  }

  function editDepartment(id) {
    const found = findItem(departments.value, id);

    tempModel.value = {
      id: id,
      name: found.name,
      departmentId: found.departmentId
    };

    formModel.value = {
      id: tempModel.value.id,
      name: tempModel.value.name,
      departmentId: tempModel.value.departmentId
    };

    errorMessage.value = "";
    departmentDialog.value = true;
  }

  function saveDepartment() {
    if (formModel.value.name.length === 0) {
      errorMessage.value = "Все поля должны быть заполнены";
      return;
    }

    if (isEditing.value) {
      Promise.all([axios.post("/api/departments/update", formModel.value)])
      .then((responses) => {           
        const department = findItem(departments.value, formModel.value.id);
        department.id = formModel.value.id;
        department.name = formModel.value.name;
        department.departmentId = formModel.value.departmentId;
      });
    } else {
      Promise.all([axios.post("/api/departments/create", formModel.value)])
      .then((responses) => { 
        var serverDepartment = responses[0].data;   
        const department = findItem(departments.value, serverDepartment.departmentId);
        
        if (department) {
          if (department.children)
            department.children.push(serverDepartment);
          else
            department.children = [serverDepartment];
        } else {
          departments.value.push(serverDepartment);
        }
      });
    }

    errorMessage.value = "";
    departmentDialog.value = false;
  }

  function cancelDepartment() {
    errorMessage.value = "";
    departmentDialog.value = false;
  }

  loadData();
</script>

<script mounted>
    console.log("mounted");
</script>
