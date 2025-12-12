<template>
  <v-sheet border rounded>  
  <v-data-table-virtual
    :headers="headers"
    :items="documents"
    :hide-default-footer="documents.length < 20"
  >
    <template v-slot:item.created_at="{ item }">
      {{ item.created_at.toLocaleDateString('ru-RU') }}
    </template>

    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>
          <v-icon 
            color="medium-emphasis" 
            icon="mdi-book-multiple" 
            size="x-small" start>
          </v-icon>
          Документы
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
          @click="editDocument(item.id)">
        </v-icon>
        <v-icon 
          color="medium-emphasis" 
          icon="mdi-delete" 
          size="small" 
          @click="removeDocument(item.id)">
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

    <v-tabs-window class="pr-6 pl-6" v-model="tab">
      <v-tabs-window-item  value="document">
        <container>
          <v-row>
            <v-col cols="12">
              <v-text-field 
                v-model="documentModel.name"
                label="Название"
              ></v-text-field>
            </v-col>
          </v-row>          
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="documentModel.description"
                label="Описание"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="documentModel.body"
                label="Содержимое"
                auto-grow
              ></v-textarea>
            </v-col>
          </v-row>
        </container>
      </v-tabs-window-item>
      <v-tabs-window-item value="route">
        <container>
          <v-row>
            <v-col cols="12">
              <v-text-field 
                v-model="documentModel.route.name"
                label="Название"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row class="pa-3">
            <v-data-table-virtual
              :headers="routeStageHeaders"
              :items="documentModel.route.routeStages"
              cols="12"
            >
              <template v-slot:item.all_or_one="{ item }">
                {{ item.all_or_one ? "Согласие всех участников" : "Согласие одного участника" }}
              </template>
              <template v-slot:item.routeStageUsers="{ item }">
                {{ formatRouteStageUsers(item.routeStageUsers) }}
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
            v-if="!documentModel.route.routeStages.length > 0"
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
                  @click="addRouteStageUser()"
                ></v-btn>
              </v-toolbar>
            </template>

            <template v-slot:item.actions="{ item }">
              <div class="d-flex ga-2 justify-end">
                <v-icon 
                  color="medium-emphasis" 
                  icon="mdi-delete" 
                  size="small"
                  @click="removeRouteStageUser(item.id)"></v-icon>
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
                    @click="saveRouteStageUser(item)">
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
        @click="cancelRouteStageUser">
      </v-btn>
    </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, ref, shallowRef, toRef } from 'vue';
  import axios from 'axios';
  import { VDateInput } from 'vuetify/labs/VDateInput'

  const headers = [
    { title: 'ID', align: 'start', key: 'id' },
    { title: 'Название', align: 'start', key: 'name' },
    { title: 'Описание', align: 'start', key: 'description' },
    { title: 'Дата создания', align: 'start', key: 'created_at' },
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
  const documents = ref([]);
  const documentDialog = shallowRef(false);  
  const documentModel = ref(createNewDocument());
  const tempDocumentModel = createNewDocument();
  const routeStageModel = ref(createNewRouteStage());
  const tempRouteStageModel = createNewRouteStage();
  const routeStageDialog = shallowRef(false);
  const userDialog = shallowRef(false);
  const isEditingDocument = toRef(() => !!documentModel.value.id);
  const isEditingRouteStage = toRef(() => !!routeStageModel.value.id);
  const errorMessage = ref("");
  const selectedDepartment = ref([]);
  const departments = ref([]);
  const users = ref([]);
  const filteredUsers = computed(() => {
    return users.value.filter(item => item.departmentId === selectedDepartment.value[0]);
  })

  function loadData() {
    Promise.all([
      axios.get('/api/documents/')
    ])
    .then((responses) => {
      documents.value = responses[0].data;

      for (const document of documents.value)
        document.created_at = new Date(document.created_at);
    });
  }

  function createNewDocument () {
    return {
      id: 0,
      name: '',
      description: '',
      body: '',
      created_at: new Date(),
      route: {
        id: 0,
        name: '',
        routeStages: []
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
    ])
    .then((responses) => {
      users.value = responses[0].data;
      departments.value = responses[1].data;
    });

    documentModel.value = createNewDocument();
    documentDialog.value = true;
  }

  function removeDocument(id) {
    Promise.all([axios.post(`/api/documents/delete/${id}`)])
    .then((responses) => {
      const index = documents.value.findIndex(item => item.id === id);
      documents.value.splice(index, 1);
    });
  }

  function editDocument(id) {
    Promise.all([
      axios.get('/api/users/plain'),
      axios.get('/api/departments/'),
      axios.get(`/api/routes/${id}`)
    ])
    .then((responses) => {
      users.value = responses[0].data;
      departments.value = responses[1].data;

      tempDocumentModel.value = documents.value.find(item => item.id === id);
      tempDocumentModel.value.route = responses[2].data;

      for (const routeStage of tempDocumentModel.value.route.routeStages)
        routeStage.start_date = new Date(routeStage.start_date);

      documentModel.value = {
        id: tempDocumentModel.value.id,
        name: tempDocumentModel.value.name,
        description: tempDocumentModel.value.description,
        body: tempDocumentModel.value.body,
        created_at: tempDocumentModel.value.created_at,
        route: tempDocumentModel.value.route
      };

      documentDialog.value = true;
    });
  }

  async function saveDocument() {
    if (isEditingDocument.value) {
      Promise.all([axios.post("/api/documents/update", documentModel.value)])
      .then((responses) => {           
        const index = documents.value.findIndex(item => item.id === documentModel.value.id);
        documents.value[index] = documentModel.value;
      });
    } 
    else {
      documentModel.value.created_at = documentModel.value.route.routeStages[0].start_date;

      Promise.all([axios.post("/api/documents/create", documentModel.value)])
      .then((responses) => { 
        var serverDocument = responses[0].data;
        documents.value.push(serverDocument);
      });
    }

    // errorMessage.value = "";
    documentDialog.value = false;
  }

  function cancelDocument() {
    documentDialog.value = false;
  }

  function formatRouteStageUsers(routeStageUsers) {
    let mergedList = '';
    let len = routeStageUsers.length;

    for (let i = 0; i < len; i++) {
      mergedList += routeStageUsers[i].user.position.name +
                    ' ' +
                    routeStageUsers[i].user.name;

      if (i < len - 1)
        mergedList += ', ';
    }

    return mergedList;
  }

  function addRouteStage() {
    routeStageModel.value = createNewRouteStage();
    const len = documentModel.value.route.routeStages.length;

    if (len > 0)
      routeStageModel.value.start_date.setDate(
        documentModel.value.route.routeStages[len - 1].start_date.getDate() + 
        documentModel.value.route.routeStages[len - 1].duration);

    routeStageDialog.value = true;
  }

  function removeRouteStage(step) {
    const index = documentModel.value.route.routeStages.findIndex(item => item.step === step);
    documentModel.value.route.routeStages.splice(index, 1);
    
    documentModel.value.route.routeStages.forEach((routeStage, index) => {
        routeStage.step = index + 1;
    });
  }

  function editRouteStage(step) {
    tempRouteStageModel.value = documentModel.value.route.routeStages.find(item => item.step === step);

    routeStageModel.value = {
      id: tempRouteStageModel.value.id,
      name: tempRouteStageModel.value.name,
      step: tempRouteStageModel.value.step,
      all_or_one: tempRouteStageModel.value.all_or_one,
      duration: tempRouteStageModel.value.duration,
      start_date: tempRouteStageModel.value.start_date,
      routeStageUsers: tempRouteStageModel.value.routeStageUsers
    };

    routeStageDialog.value = true;
  }

  async function saveRouteStage() {  
    if (isEditingRouteStage.value) {
      //const index = documents.value.route.routeStages.findIndex(item => item.id === routeStageModel.value.id);
      //documents.value.route.routeStages[index] = routeStageModel.value;
    } else {
      routeStageModel.value.step = documentModel.value.route.routeStages.length + 1;
      documentModel.value.route.routeStages.push(routeStageModel.value);
    }

    // errorMessage.value = "";
    routeStageDialog.value = false;
  }

  function cancelRouteStage() {
    routeStageDialog.value = false;
  }


  function addRouteStageUser() {
    userDialog.value = true;
  }

  function removeRouteStageUser(id) {
    const index = routeStageModel.value.routeStageUsers.findIndex(item => item.id === id);
    routeStageModel.value.routeStageUsers.splice(index, 1);
  }

  async function saveRouteStageUser(user) {
    routeStageModel.value.routeStageUsers.push({
      id: 0,
      routeStageId: routeStageModel.value.id,
      userId: user.id,
      user: user
    });

    userDialog.value = false;
  }

  function cancelRouteStageUser() {
    userDialog.value = false;
  }

  loadData();
</script>

<script mounted>
    console.log("mounted");
</script>
