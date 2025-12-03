<template>
  <v-sheet border rounded>  
    <v-data-table-virtual
        :headers="headers"
        :items="users"
        :hide-default-footer="users.length < 20"
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
  </v-sheet>

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

  const headers = [
    { title: 'ID', align: 'start', key: 'id' },
    { title: 'ФИО', align: 'start', key: 'name' },
    { title: 'Логин', align: 'start', key: 'username' },
    { title: 'Эл. почта', align: 'start', key: 'email' },
    { title: 'Должность', align: 'start', key: 'positionId' },
    { title: 'Роль', align: 'start', key: 'role' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

  const users = ref([]);
  const positions = ref([]);
  const userDialog = shallowRef(false);  
  const formModel = ref(createNewUser());
  const isEditing = toRef(() => !!formModel.value.id);
  const errorMessage = shallowRef("");
  const tempModel = createNewUser();

  function loadData() {
    Promise.all([
      axios.get('/api/users/'),
      axios.get('/api/positions/')
    ])
    .then((responses) => {
      users.value = responses[0].data;
      positions.value = responses[1].data;
    });
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
      role: '',
      positionId: null
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
    tempModel.value = users.value.find(item => item.id === id);

    formModel.value = {
      id: tempModel.value.id,
      name: tempModel.value.name,
      username: tempModel.value.username,
      password: tempModel.value.password,
      email: tempModel.value.email,
      role: tempModel.value.role,
      positionId: tempModel.value.positionId
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
