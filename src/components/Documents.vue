<template>
  <v-sheet border rounded>  
  <v-data-table-virtual
    :headers="headers"
    :items="documents"
    :hide-default-footer="documents.length < 20"
  >
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

  <v-dialog v-model="documentDialog" max-width="1100">
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
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field 
                v-model="documentModel.description"
                label="Описание"
                required
              ></v-text-field>
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
                    @click="editRouteStage(item.id)">
                  </v-icon>
                  <v-icon 
                    color="medium-emphasis" 
                    icon="mdi-delete" 
                    size="small" 
                    @click="removeRouteStage(item.id)">
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

  <v-dialog v-model="routeStageDialog" max-width="1000">
    <v-card :title="`${isEditingRouteStage ? 'Изменение' : 'Добавление'} этапа`">
      <container class="pr-6 pl-6">
        <v-row class="pt-6">
          <v-text-field 
            v-model="routeStageModel.name"
            label="Название"
            required
          ></v-text-field>
        </v-row>
        <v-row>
          <v-col>
            <v-date-input
            v-model="routeStageModel.start_date"
            label="Дата начала"
            ></v-date-input>
          </v-col>
          <v-col>
            <v-date-input
            v-model="routeStageModel.end_date"
            label="Дата окончания"
            ></v-date-input>
          </v-col>
        </v-row>  
        <v-row>
          <v-col>
            <v-radio-group v-model="routeStageModel.all_or_one">
              <v-radio 
              label="Согласие одного участника"
              :value="false"></v-radio>
              <v-radio label="Согласие всех участников"
              :value="true"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>       
        <v-row class="pa-3">
          <v-data-table-virtual
            :headers="routeStageUserHeaders"
            :items="routeStageModel.routeStageUsers"
          >
          <template v-slot:item.positionId="{ item }">
            {{ getPositionName(item.positionId) }}
          </template>

          <template v-slot:item.departmentId="{ item }">
            {{ getDepartmentName(item.departmentId) }}
          </template>

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
                  icon="mdi-pencil" 
                  size="small">
                </v-icon>
                <v-icon 
                  color="medium-emphasis" 
                  icon="mdi-delete" 
                  size="small">
                </v-icon>
              </div>
            </template>  
          </v-data-table-virtual>
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

  <v-dialog v-model="userDialog" max-width="900">
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
  import { useDate } from 'vuetify'

  const headers = [
    { title: 'ID', align: 'start', key: 'id' },
    { title: 'Название', align: 'start', key: 'name' },
    { title: 'Описание', align: 'start', key: 'description' },
    { title: 'Дата создания', align: 'start', key: 'created_at' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

  const routeStageHeaders = [
    { title: 'Название', align: 'start', key: 'name' },
    { title: 'Порядковый номер', align: 'start', key: 'step' },
    { title: 'Условие перехода на след. этап', align: 'start', key: 'all_or_one' },
    { title: 'Дата начала', align: 'start', key: 'start_date' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

  const routeStageUserHeaders = [
    { title: 'Имя', align: 'start', key: 'name' },
    { title: 'Логин', align: 'start', key: 'username' },
    { title: 'Эл. почта', align: 'start', key: 'email' },
    { title: 'Роль', align: 'start', key: 'role' },
    { title: 'Должность', align: 'start', key: 'positionId' },
    { title: 'Подразделение', align: 'start', key: 'departmentId' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

    const userHeaders = [
    { title: 'Имя', align: 'start', key: 'name' },
    { title: 'Логин', align: 'start', key: 'username' },
    { title: 'Эл. почта', align: 'start', key: 'email' },
    { title: 'Роль', align: 'start', key: 'role' },
    { title: 'Должность', align: 'start', key: 'positionId' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

  const ROLES = ["сотрудник", "оператор", "контроллер", "администратор"];

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
  const positions = ref([]);
  const filteredUsers = computed(() => {
    return users.value.filter(item => item.departmentId === selectedDepartment.value[0]);
  })

  function loadData() {
    Promise.all([
      axios.get('/api/documents/')
    ])
    .then((responses) => {
      documents.value = responses[0].data;
    });
  }


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

  function getPositionName(positionId) {
    const position = positions.value.find(pos => pos.id === positionId);
    return position.name;
  }

  function getDepartmentName(departmentId) {
    const department = findItem(departments.value, departmentId);
    return department.name;
  }

  function createNewDocument () {
    return {
      id: 0,
      name: '',
      description: '',
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
      start_date: null,
      end_date: null,
      routeStageUsers: []
    }
  }

  function addDocument() {
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
    tempDocumentModel.value = documents.value.find(item => item.id === id);

    documentModel.value = {
      id: tempDocumentModel.value.id,
      name: tempDocumentModel.value.name,
      route: tempDocumentModel.value.route
    };

    documentDialog.value = true;
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

  function addRouteStage() {
    routeStageModel.value = createNewRouteStage();
    routeStageDialog.value = true;
  }

  function removeRouteStage(id) {
    const index = documents.value.route.routeStages.findIndex(item => item.id === id);
    documents.value.route.routeStages.splice(index, 1);
  }

  function editRouteStage(id) {
    tempRouteStageModel.value = documents.value.route.routeStages.find(item => item.id === id);

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
    } 
    else {   
      routeStageModel.value.step = documentModel.value.route.routeStages.length + 1;
      documentModel.value.route.routeStages.push(routeStageModel.value);
      console.log(documentModel.value.route.routeStages[0].name);
      console.log(documentModel.value.route.routeStages[0].step);
      console.log(documentModel.value.route.routeStages[0].all_or_one);
      console.log(documentModel.value.route.routeStages[0].start_date);
      console.log(documentModel.value.route.routeStages[0].end_date);
    }

    // errorMessage.value = "";
    routeStageDialog.value = false;
  }

  function cancelRouteStage() {
    routeStageDialog.value = false;
  }


  function addRouteStageUser() {
    Promise.all([
      axios.get('/api/departments'),
      axios.get('/api/users/'),
      axios.get('/api/positions/')
    ])
    .then((responses) => {
      departments.value = responses[0].data;
      users.value = responses[1].data;
      positions.value = responses[2].data;
    });

    userDialog.value = true;
  }

  function removeRouteStageUser(id) {
    const index = documents.value.route.routeStages.findIndex(item => item.id === id);
    documents.value.route.routeStages.splice(index, 1);
  }

  async function saveRouteStageUser(user) {
    // errorMessage.value = "";
    routeStageModel.value.routeStageUsers.push(user);
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
