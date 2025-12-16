<template>
  <v-sheet border rounded>  
  <v-data-table-virtual
    :headers="headers"
    :items="documents"
    :hide-default-footer="documents.length < 20"
  >
    <template v-slot:item.document.created_at="{ item }">
      {{ item.document.created_at.toLocaleDateString('ru-RU') }}
    </template>

    <template v-slot:item.document.author="{ item }">
      {{ formatUser(item.document.author) }}
    </template>

    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>
          <v-icon 
            color="medium-emphasis" 
            icon="mdi-book-multiple" 
            size="x-small" start>
          </v-icon>
          Служебные записки
        </v-toolbar-title>

        <v-btn
          class="me-2"
          prepend-icon="mdi-plus"
          rounded="lg"
          text="Добавить"
          @click="addDocument"
        ></v-btn>
      </v-toolbar>
    </template>

    <template v-slot:item.actions="{ item }">
      <div class="d-flex ga-2 justify-end">
        <v-icon 
          color="medium-emphasis" 
          icon="mdi-pencil" 
          size="small" 
          @click="editDocument(item)">
        </v-icon>
        <v-icon 
          color="medium-emphasis" 
          icon="mdi-delete" 
          size="small" 
          @click="removeDocument(item)">
        </v-icon>
      </div>
    </template>  

  </v-data-table-virtual>
  </v-sheet>

  <v-dialog v-model="documentDialog" max-width="1200">
    <v-card :title="`${isEditingDocument ? 'Изменение' : 'Добавление'} документа`">
    <container class="pr-6 pl-6 pb-6">
    <v-tabs v-model="tab" color="primary">
      <v-tab value="document">Документ</v-tab>
      <v-tab value="route">Маршрут</v-tab>
    </v-tabs>
    </container>

    <v-tabs-window class="pr-6 pl-6" style="overflow-y: auto;" v-model="tab">
      <v-tabs-window-item value="document">
        <container>
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                label="Автор"
                :items="users"
                item-title="name"
                item-value="id"
                v-model="documentModel.document.authorId"
                readonly
                @click="addUser('author')"
              >
              </v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-select
                label="Тип документа"
                :items="documentTypes"
                item-title="name"
                item-value="id"
                v-model="documentModel.memoTypeId"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field 
                v-model="documentModel.document.subject"
                label="Тема"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="documentModel.document.body"
                label="Содержание"
                auto-grow
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-number-input
                v-model="documentModel.document.duration"
                :reverse="false"
                controlVariant="default"
                label="Длительность"
                :hideInput="false"
                :inset="false"
                :min="1"
              ></v-number-input>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                label="Руководитель инциатора"
                :items="users"
                item-title="name"
                item-value="id"
                v-model="documentModel.authorManagerId"
                readonly
                @click="addUser('authormanagerid')"
              >
              </v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                label="Подписант"
                :items="users"
                item-title="name"
                item-value="id"
                v-model="documentModel.signatoryId"
                readonly
                @click="addUser('signatory')"
              >
              </v-autocomplete>
            </v-col>
          </v-row>
        </container>
      </v-tabs-window-item>
      <v-tabs-window-item value="route">
        <container>
          <v-row>
            <v-col cols="12">
              <v-text-field 
                v-model="documentModel.document.route.name"
                label="Название"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row class="pa-3">
            <v-data-table-virtual
              :headers="routeStageHeaders"
              :items="documentModel.document.route.routeStages"
              cols="12"
            >
              <template v-slot:item.all_or_one="{ item }">
                {{ item.all_or_one ? "Согласие всех участников" : "Согласие одного участника" }}
              </template>
              <template v-slot:item.routeStageUsers="{ item }">
                {{ formatUsers(item.routeStageUsers) }}
              </template>
              <template v-slot:item.start_date="{ item }">
                {{ item.start_date.toLocaleDateString('ru-RU') }}
              </template>

              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title class="text-subtitle-1 font-weight-medium">
                    Этапы
                  </v-toolbar-title>
                  <v-btn
                    class="text-subtitle-1 font-weight-medium"
                    prepend-icon="mdi-plus"
                    rounded="lg"
                    text="Добавить"
                    @click="addRouteStage"
                  ></v-btn>
                </v-toolbar>
              </template>

              <template v-slot:item.actions="{ item }">
                <div class="d-flex ga-2 justify-end">
                  <v-icon 
                    color="medium-emphasis" 
                    icon="mdi-pencil" 
                    size="small" 
                    @click="editRouteStage(item.step)">
                  </v-icon>
                  <v-icon 
                    color="medium-emphasis" 
                    icon="mdi-delete" 
                    size="small" 
                    @click="removeRouteStage(item.step)">
                  </v-icon>
                </div>
              </template>  
            </v-data-table-virtual>
          </v-row>
        </container>
      </v-tabs-window-item>
    </v-tabs-window>

    <v-divider></v-divider>

    <v-card-actions class="bg-surface-light">
      <v-btn 
        text="Отменить" 
        variant="plain"
        @click="cancelDocument">
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn 
        text="Сохранить" 
        @click="saveDocument">
      </v-btn>
    </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="routeStageDialog" max-width="1100">
    <v-card :title="`${isEditingRouteStage ? 'Изменение' : 'Добавление'} этапа`">
      <container class="pr-6 pl-6">
        <v-row class="pt-6">
          <v-col>
            <v-text-field 
              v-model="routeStageModel.name"
              label="Название"
              required
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <v-number-input
              v-model="routeStageModel.duration"
              :reverse="false"
              controlVariant="default"
              label="Длительность"
              :hideInput="false"
              :inset="false"
              :min="1"
            ></v-number-input>
          </v-col>
          <v-col cols="8">
            <v-date-input
            v-if="!documentModel.document.route.routeStages.length > 0"
            v-model="routeStageModel.start_date"
            label="Дата начала"
            ></v-date-input>
          </v-col>
        </v-row>     
        <v-row class="pa-3">
          <v-data-table-virtual
            :headers="routeStageUserHeaders"
            :items="routeStageModel.routeStageUsers"
          >
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title class="text-subtitle-1 font-weight-medium">
                  Участники
                </v-toolbar-title>

                <v-btn
                  class="text-subtitle-1 font-weight-medium"
                  prepend-icon="mdi-plus"
                  rounded="lg"
                  text="Добавить"
                  @click="addUser('routestageuser')"
                ></v-btn>
              </v-toolbar>
            </template>

            <template v-slot:item.actions="{ item }">
              <div class="d-flex ga-2 justify-end">
                <v-icon 
                  color="medium-emphasis" 
                  icon="mdi-delete" 
                  size="small"
                  @click="removeUser(item.id)"></v-icon>
              </div>
            </template>  
          </v-data-table-virtual>
        </v-row>
        <v-row>
          <v-col>
            <v-radio-group
            v-if="routeStageModel.routeStageUsers.length > 1"
            v-model="routeStageModel.all_or_one"
            label="Условие перехода на следующий этап">
              <v-radio 
              label="Согласие одного участника"
              :value="false"></v-radio>
              <v-radio label="Согласие всех участников"
              :value="true"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>    
      </container>

    <v-divider></v-divider>

    <v-card-actions class="bg-surface-light">
      <v-btn 
        text="Отменить" 
        variant="plain"
        @click="cancelRouteStage">
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn 
        text="Сохранить" 
        @click="saveRouteStage">
      </v-btn>
    </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="userDialog" max-width="1000">
    <v-card :title="`Добавление участника`">
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
            ></v-treeview>
          </v-col>
          
          <v-col cols="8">
            <v-data-table-virtual
                :headers="userHeaders"
                :items="filteredUsers"
                :hide-default-footer="filteredUsers.length < 20"
            >
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
                </v-toolbar>
              </template>

              <template v-slot:item.actions="{ item }">
                <div class="d-flex ga-2 justify-end">
                  <v-icon 
                    color="medium-emphasis" 
                    icon="mdi-plus" 
                    size="small" 
                    @click="saveUser(item)">
                  </v-icon>
                </div>
              </template>
            </v-data-table-virtual>
          </v-col>
        </v-row>
      </v-container>

    <v-divider></v-divider>

    <v-card-actions class="bg-surface-light">
      <v-btn 
        text="Отменить" 
        variant="plain"
        @click="cancelUser">
      </v-btn>
    </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="departmentDialog" max-width="1000">
    <v-card :title="`Добавление подразделения`">
      <v-container fluid class="fill-height pa-0">
        <v-row dense>
          <v-col cols="12">
            <v-treeview
              :items="departments"
              item-title="name"
              item-value="id"
              item-key="id"
              density="compact"
              rounded
            >
              <template v-slot:append="{ item }">
                <div class="d-flex ga-2 justify-end">
                  <v-icon 
                    color="medium-emphasis" 
                    icon="mdi-plus" 
                    size="small" 
                    @click="saveDepartment(item)">
                  </v-icon>
                </div>
              </template>
            </v-treeview>
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions class="bg-surface-light">
        <v-btn 
          text="Отменить" 
          variant="plain"
          @click="departmentDialog.value=false">
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, ref, shallowRef, toRef } from 'vue';
  import axios from 'axios';
  import { VDateInput } from 'vuetify/labs/VDateInput';
  import { cloneDeep, indexOf } from 'lodash';

  const headers = [
    { title: 'ID', align: 'start', key: 'id' },
    { title: 'Тема', align: 'start', key: 'document.subject' },
    { title: 'Автор', align: 'start', key: 'document.author' },
    { title: 'Дата создания', align: 'start', key: 'document.created_at' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

  const routeStageHeaders = [
    { title: 'Название', align: 'start', key: 'name', sortable: false },
    { title: 'Порядковый номер', align: 'start', key: 'step', sortable: false },
    { title: 'Условие перехода на след. этап', align: 'start', key: 'all_or_one', sortable: false },
    { title: 'Дата начала', align: 'start', key: 'start_date', sortable: false },
    { title: 'Длительность', align: 'start', key: 'duration', sortable: false },
    { title: 'Участники', align: 'start', key: 'routeStageUsers', sortable: false },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

  const routeStageUserHeaders = [
    { title: 'Имя', align: 'start', key: 'user.name' },
    { title: 'Логин', align: 'start', key: 'user.username' },
    { title: 'Эл. почта', align: 'start', key: 'user.email' },
    { title: 'Роль', align: 'start', key: 'user.role' },
    { title: 'Должность', align: 'start', key: 'user.position.name' },
    { title: 'Подразделение', align: 'start', key: 'user.department.name' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

    const userHeaders = [
    { title: 'Имя', align: 'start', key: 'name' },
    { title: 'Логин', align: 'start', key: 'username' },
    { title: 'Эл. почта', align: 'start', key: 'email' },
    { title: 'Роль', align: 'start', key: 'role' },
    { title: 'Должность', align: 'start', key: 'position.name' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

  const tab = ref('document');
  const state = ref('');
  const documents = ref([]);
  const documentTypes = ref([]);
  const documentDialog = shallowRef(false);
  const departmentDialog = shallowRef(false);
  const documentModel = ref(createNewDocument());
  const tempDocumentModel = createNewDocument();
  const routeStageModel = ref(createNewRouteStage());
  const tempRouteStageModel = createNewRouteStage();
  const routeStageDialog = shallowRef(false);
  const userDialog = shallowRef(false);
  const isEditingDocument = toRef(() => !!documentModel.value.id);
  const isEditingRouteStage = ref(false);
  const errorMessage = ref("");
  const selectedDepartment = ref([]);
  const departments = ref([]);
  const users = ref([]);
  const filteredUsers = computed(() => {
    return users.value.filter(item => item.departmentId === selectedDepartment.value[0]);
  });

  function loadData() {
    Promise.all([
      axios.get('/api/memos/')
    ])
    .then((responses) => {
      documents.value = responses[0].data;

      for (const doc of documents.value)
        doc.document.created_at = new Date(doc.document.created_at);
    });
  }

  async function saveDepartment(item) {  
    documentModel.value.department = item;

    departmentDialog.value = false;
  }

  function createNewDocument () {
    return {
      id: 0,
      memoTypeId: null,
      authorManagerId: null,
      authorManager: {
        id: 0,
        name: ''        
      },
      signatory: {
        id: 0,
        name: ''        
      },
      signatoryId: null,
      document: {
        id: 0,
        authorId: null,
        author: {
          id: 0,
          name: ''
        },
        subject: '',
        body: '',
        duration: 1,
        created_at: new Date(),
        route: {
          id: 0,
          name: '',
          routeStages: []
        }
      }
    };
  }

  function createNewRouteStage () {
    return {
      id: 0,
      name: '',
      step: 1,
      all_or_one: false,
      duration: 1,
      start_date: new Date(),
      routeStageUsers: []
    }
  }

  function addDocument() {
    Promise.all([
      axios.get('/api/users/plain'),
      axios.get('/api/departments/'),
      axios.get('/api/memo-types/')
    ])
    .then((responses) => {
      users.value = responses[0].data;
      departments.value = responses[1].data;
      documentTypes.value = responses[2].data;
    });

    documentModel.value = createNewDocument();
    documentDialog.value = true;
  }

  function removeDocument(item) {
    Promise.all([axios.post(`/api/memos/delete`, item)])
    .then((responses) => {
      const index = documents.value.findIndex(doc => doc.id === item.id);
      documents.value.splice(index, 1);
    });
  }

  function editDocument(item) {
    Promise.all([
      axios.get('/api/users/plain'),
      axios.get('/api/departments/'),
      axios.get('/api/memo-types/'),
      axios.get(`/api/routes/${item.document.id}`)
    ])
    .then((responses) => {
      users.value = responses[0].data;
      departments.value = responses[1].data;
      documentTypes.value = responses[2].data;

      tempDocumentModel.value = documents.value.find(doc => doc.id === item.id);
      tempDocumentModel.value.document.route = responses[3].data;

      for (const routeStage of tempDocumentModel.value.document.route.routeStages)
        routeStage.start_date = new Date(routeStage.start_date);

      documentModel.value = cloneDeep({
        id: tempDocumentModel.value.id,
        authorManager: tempDocumentModel.value.authorManager, 
        authorManagerId: tempDocumentModel.value.authorManagerId,
        signatory: tempDocumentModel.value.signatory, 
        signatoryId: tempDocumentModel.value.signatoryId,
        memoTypeId: tempDocumentModel.value.memoTypeId,
        document: tempDocumentModel.value.document
      });

      console.log(documentModel.value.authorManagerId);

      documentDialog.value = true;
    });
  }

  async function saveDocument() {
    if (isEditingDocument.value) {
      const data = {
        original: tempDocumentModel.value,
        updated: documentModel.value
      };

      console.log(data.updated.document.route.routeStages.length);

      Promise.all([axios.post("/api/memos/update", data)])
      .then((responses) => {           
        const index = documents.value.findIndex(item => item.id === documentModel.value.id);
        documents.value[index] = documentModel.value;
      });
    } 
    else {
      documentModel.value.document.created_at = documentModel.value.document.route.routeStages[0].start_date;

      Promise.all([axios.post("/api/memos/create", documentModel.value)])
      .then((responses) => { 
        var serverDocument = responses[0].data;
        serverDocument.document.created_at = new Date(serverDocument.document.created_at);
        documents.value.push(serverDocument);
      });
    }

    // errorMessage.value = "";
    documentDialog.value = false;
  }

  function cancelDocument() {
    documentDialog.value = false;
  }

  function formatUser(user) {
    return user.position.name +
            ' ' +
            user.name;
  }

  function formatUsers(routeStageUsers) {
    let mergedList = '';
    let len = routeStageUsers.length;

    for (let i = 0; i < len; i++) {
      mergedList += formatUser(routeStageUsers[i].user);

      if (i < len - 1)
        mergedList += ', ';
    }

    return mergedList;
  }

  function addRouteStage() {
    routeStageModel.value = createNewRouteStage();
    const len = documentModel.value.document.route.routeStages.length;

    if (len > 0)
      routeStageModel.value.start_date.setDate(
        documentModel.value.document.route.routeStages[len - 1].start_date.getDate() + 
        documentModel.value.document.route.routeStages[len - 1].duration);

    routeStageDialog.value = true;
  }

  function removeRouteStage(step) {
    const index = documentModel.value.document.route.routeStages.findIndex(item => item.step === step);
    documentModel.value.document.route.routeStages.splice(index, 1);
    
    documentModel.value.document.route.routeStages.forEach((routeStage, index) => {
        routeStage.step = index + 1;
    });
  }

  function editRouteStage(step) {
    tempRouteStageModel.value = documentModel.value.document.route.routeStages
                                .find(item => item.step === step);

    routeStageModel.value = cloneDeep({
      id: tempRouteStageModel.value.id,
      name: tempRouteStageModel.value.name,
      step: tempRouteStageModel.value.step,
      all_or_one: tempRouteStageModel.value.all_or_one,
      duration: tempRouteStageModel.value.duration,
      start_date: tempRouteStageModel.value.start_date,
      routeStageUsers: tempRouteStageModel.value.routeStageUsers
    });

    isEditingRouteStage.value = true;
    routeStageDialog.value = true;
  }

  async function saveRouteStage() {  
    if (isEditingRouteStage.value) {
      const index = documentModel.value.document.route.routeStages.findIndex(item => item.id === routeStageModel.value.id);
      documentModel.value.document.route.routeStages[index] = routeStageModel.value;
      isEditingRouteStage.value = false;
    } else {
      routeStageModel.value.step = documentModel.value.document.route.routeStages.length + 1;
      documentModel.value.document.route.routeStages.push(routeStageModel.value);
    }

    routeStageDialog.value = false;
  }

  function cancelRouteStage() {
    routeStageDialog.value = false;
  }


  function addUser(currState) {
    state.value = currState;

    userDialog.value = true;
  }

  function removeUser(id) {
    const index = routeStageModel.value.routeStageUsers.findIndex(item => item.id === id);
    routeStageModel.value.routeStageUsers.splice(index, 1);
  }

  async function saveUser(user) {
    if (state.value == 'routestageuser') {    
      routeStageModel.value.routeStageUsers.push({
        id: 0,
        routeStageId: routeStageModel.value.id,
        userId: user.id,
        user: user
      });
    } else if (state.value == 'author') {
      documentModel.value.document.author = user;
      documentModel.value.document.authorId = user.id;
    } else if (state.value == 'authormanagerid') {
      documentModel.value.authorManager = user;
      documentModel.value.authorManagerId = user.id;
    } else if (state.value == 'signatory') {
      documentModel.value.signatory = user;
      documentModel.value.signatoryId = user.id;
    }

    state.value = '';
    userDialog.value = false;
  }

  function cancelUser() {
    userDialog.value = false;
  }

  loadData();
</script>

<script mounted>
    console.log("mounted");
</script>
