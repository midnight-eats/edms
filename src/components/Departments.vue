<template>
  <v-sheet border rounded>
  <v-container fluid class="fill-height pa-0">
    <v-row dense>
      <v-col cols="4">
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

        <v-treeview
          :items="departments"
          v-model:activated="selectedDepartment"
          item-title="name"
          item-value="id"
          item-key="id"
          density="compact"
          activatable
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
                @click="removeDepartment(item)">
              </v-icon>
            </div>
          </template>
        </v-treeview>
      </v-col>
      
      <v-col cols="8">
        <v-data-table-virtual
            :headers="headers"
            :items="filteredUsers"
            :hide-default-footer="filteredUsers.length < 20"
        >
          <template v-slot:item.positionId="{ item }">
            {{ getPositionName(item.positionId) }}
          </template>

          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>
                <v-icon 
                  color="medium-emphasis" 
                  icon="mdi-book-multiple" 
                  size="x-small" start>
                </v-icon>
                Пользователи
              </v-toolbar-title>

              <v-btn
                class="me-2"
                prepend-icon="mdi-plus"
                rounded="lg"
                text="Добавить"
                @click="addUser"
              ></v-btn>
            </v-toolbar>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-icon 
                color="medium-emphasis" 
                icon="mdi-pencil" 
                size="small" 
                @click="editUser(item.id)">
              </v-icon>
              <v-icon 
                color="medium-emphasis" 
                icon="mdi-delete" 
                size="small" 
                @click="removeUser(item.id)">
              </v-icon>
            </div>
          </template>
        </v-data-table-virtual>
      </v-col>
    </v-row>
  </v-container>
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

  <v-dialog v-model="userDialog" max-width="500">
    <v-card :title="`${isEditing ? 'Изменение' : 'Добавление'} пользователя`">
      <template v-slot:text>
        <v-row>
          <v-col v-if="errorMessage" cols="12">
            <v-label :text="errorMessage"></v-label>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="formModel.name" label="ФИО"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="formModel.username" label="Логин"></v-text-field>
          </v-col>
          <v-col v-if="!isEditing" cols="12">
            <v-text-field v-model="formModel.password" label="Пароль"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="formModel.email" label="Эл. почта"></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-select
              label="Роль"
              :items="ROLES"
              v-model="formModel.role"
            ></v-select>
          </v-col>

          <v-col cols="12">
            <v-select
              label="Должность"
              :items="positions"
              item-title="name"
              item-value="id"
              v-model="formModel.positionId"
            ></v-select>
          </v-col>
        </v-row>
      </template>

      <v-divider></v-divider>

      <v-card-actions class="bg-surface-light">
        <v-btn text="Отменить" variant="plain" @click="cancelUser"></v-btn>

        <v-spacer></v-spacer>

        <v-btn text="Сохранить" @click="saveUser"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, ref, shallowRef, toRef } from 'vue';
  import axios from 'axios'; 
  
  const ROLES = ["сотрудник", "оператор", "контроллер", "администратор"];

  const users = ref([]);
  const positions = ref([]);
  const userDialog = shallowRef(false); 
  const departments = ref([]);
  const departmentDialog = shallowRef(false);  
  const formModel = ref(null);
  const tempModel = ref(null);
  const isEditing = toRef(() => !!formModel.value.id);
  const errorMessage = shallowRef("");
  const selectedDepartment = ref([]);
  const filteredUsers = computed(() => {
    return users.value.filter(item => item.departmentId === selectedDepartment.value[0]);
  })

  const headers = [
    { title: 'ID', align: 'start', key: 'id' },
    { title: 'ФИО', align: 'start', key: 'name' },
    { title: 'Логин', align: 'start', key: 'username' },
    { title: 'Эл. почта', align: 'start', key: 'email' },
    { title: 'Должность', align: 'start', key: 'positionId' },
    { title: 'Роль', align: 'start', key: 'role' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

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
      axios.get('/api/users/'),
      axios.get('/api/positions/'),
      axios.get('/api/departments/')
    ])
    .then((responses) => {
      users.value = responses[0].data;
      positions.value = responses[1].data;
      departments.value = responses[2].data;
    });
  }

  function createNewDepartment () {
    return {
      id: 0,
      name: '',
      departmentId: null
    };
  }

  function addDepartment(parentId) {
    formModel.value = createNewDepartment();
    formModel.value.departmentId = parentId;
    errorMessage.value = "";
    departmentDialog.value = true;
  }

  function removeDepartment(item) {
    console.log(item.id);
    Promise.all([axios.post(`/api/departments/delete`, item)])
    .then((responses) => {
      console.log(responses[0].data);

      if (item.departmentId === null) {
        const index = departments.value.findIndex(dept => dept.id === item.id);
        departments.value.splice(index, 1);
      } else {
        const department = findItem(departments.value, item.departmentId);
        const index = department.children.findIndex(dept => dept.id === item.id);
        department.children.splice(index, 1);
      }
    });
  }

  function editDepartment(id) {
    tempModel.value = createNewDepartment();
    tempModel.value = findItem(departments.value, id);

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

  function getPositionName(positionId) {
    const position = positions.value.find(pos => pos.id === positionId);
    console.log(positionId);
    return position ? position.name : 'Unknown';
  }

  function createNewUser () {
    return {
      id: 0,
      name: '',
      username: '',
      password: '',
      email: '',
      role: 'сотрудник',
      positionId: null,
      departmentId: selectedDepartment.value[0]
    };
  }

  function addUser() {
    formModel.value = createNewUser();
    errorMessage.value = "";
    userDialog.value = true;
  }

  function removeUser(id) {
    Promise.all([axios.post(`/api/users/delete/${id}`)])
    .then((responses) => {
      const index = users.value.findIndex(item => item.id === id);
      users.value.splice(index, 1);
    });
  }

  function editUser(id) {
    tempModel.value = createNewUser();
    tempModel.value = users.value.find(item => item.id === id);

    formModel.value = {
      id: tempModel.value.id,
      name: tempModel.value.name,
      username: tempModel.value.username,
      password: tempModel.value.password,
      email: tempModel.value.email,
      role: tempModel.value.role,
      positionId: tempModel.value.positionId,
      departmentId: tempModel.value.departmentId
    };

    errorMessage.value = "";
    userDialog.value = true;
  }

  function saveUser() {
    if (formModel.value.name.length == 0 ||
        formModel.value.username.length == 0 ||
        formModel.value.password.length == 0 ||
        formModel.value.email.length == 0 ||
        !formModel.value.positionId) {
      errorMessage.value = "Все поля должны быть заполнены";
      return;
    }


    var found = users.value.find(item => (item.username === formModel.value.username ||
                                          item.email === formModel.value.email));

    if (isEditing.value) {
      if (found && 
          (tempModel.value.username !== formModel.value.username &&
          tempModel.value.email !== formModel.value.email)) {
        errorMessage.value = "Запись с таким логином/эл. почтой уже существует в базе данных";
        return;
      }

      Promise.all([axios.post("/api/users/update", formModel.value)])
      .then((responses) => {           
        const index = users.value.findIndex(item => item.id === formModel.value.id);
        users.value[index] = formModel.value;
      });
    } 
    else {
      if (found) {
        errorMessage.value = "Запись с таким логином/эл. почтой уже существует в базе данных"; 
        return;
      }

      Promise.all([axios.post("/api/users/create", formModel.value)])
      .then((responses) => { 
        var serverUser = responses[0].data;
        console.log(serverUser);     
        users.value.push(serverUser);
      });
    }

    errorMessage.value = "";
    userDialog.value = false;
  }

  function cancelUser() {
    console.log(formModel.value.positionId);
    errorMessage.value = "";
    userDialog.value = false;
  }

  loadData();
</script>

<script mounted>
    console.log("mounted");
</script>
