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

  <v-dialog v-model="documentDialog" max-width="800">
    <v-card :title="`${isEditingDocument ? 'Изменение' : 'Добавление'} документа`">
    <v-tabs v-model="tab" color="primary">
      <v-tab value="document">Документ</v-tab>
      <v-tab value="route">Маршрут</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="document">
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-text-field 
                v-model="formModel.name"
                label="Название"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field 
                v-model="formModel.description"
                label="Описание"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card>
      </v-tabs-window-item>
      <v-tabs-window-item value="route">
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-text-field 
                v-model="formModel.route.name"
                label="Название"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-data-table-virtual
              :headers="routeStageHeaders"
              :items="formModel.route.routeStages"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>
                    <v-icon 
                      color="medium-emphasis" 
                      icon="mdi-book-multiple" 
                      size="x-small" start>
                    </v-icon>
                    Этапы
                  </v-toolbar-title>

                  <v-btn
                    class="me-2"
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
        </v-card>
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
</template>

<script setup>
  import { computed, ref, shallowRef, toRef } from 'vue';
  import axios from 'axios';
  import useVuelidate from '@vuelidate/core';
  import { required } from '@vuelidate/validators';  

  const headers = [
    { title: 'ID', align: 'start', key: 'id' },
    { title: 'Название', align: 'start', key: 'name' },
    { title: 'Описание', align: 'start', key: 'description' },
    { title: 'Дата создания', align: 'start', key: 'created_at' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

  const routeStageHeaders = [
    { title: 'ID', align: 'start', key: 'id' },
    { title: 'Название', align: 'start', key: 'name' },
    { title: 'Порядковый номер', align: 'start', key: 'step' },
    { title: 'Условие перехода на след. этап', align: 'start', key: 'all_or_one' },
    { title: 'Дата начала', align: 'start', key: 'start_date' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

  const tab = ref('document');
  const documents = ref([]);
  const documentDialog = shallowRef(false);  
  const formModel = ref(createNewDocument());
  const tempModel = createNewDocument();
  const isEditingDocument = toRef(() => !!formModel.value.id);
  const errorMessage = ref({ model: '', name: '' });

  function loadData() {
    Promise.all([
      axios.get('/api/documents/')
    ])
    .then((responses) => {
      documents.value = responses[0].data;
    });
  }

  function addDocument() {
    formModel.value = createNewDocument();
    documentDialog.value = true;
  }

  function removeDocument(id) {
    Promise.all([axios.post(`/api/documents/delete/${id}`)])
    .then((responses) => {
      const index = documents.value.findIndex(item => item.id === id);
      documents.value.splice(index, 1);
    });
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

  function editDocument(id) {
    tempModel.value = documents.value.find(item => item.id === id);

    formModel.value = {
      id: tempModel.value.id,
      name: tempModel.value.name,
    };

    documentDialog.value = true;
  }

  async function saveDocument() {
    var found = documents.value.find(item => item.name === formModel.value.name);

    if (isEditingDocument.value) {
      if (found && tempModel.value.name !== formModel.value.name) {
        errorMessage.value.name = "";
        errorMessage.value.model = "Такая запись уже существует в базе данных";
        return;
      }

      Promise.all([axios.post("/api/documents/update", formModel.value)])
      .then((responses) => {           
        const index = documents.value.findIndex(item => item.id === formModel.value.id);
        documents.value[index] = formModel.value;
      });
    } 
    else {
      if (found) {
        errorMessage.value.name = "";
        errorMessage.value.model = "Такая запись уже существует в базе данных"; 
        return;
      }

      Promise.all([axios.post("/api/documents/create", formModel.value)])
      .then((responses) => { 
        var serverPosition = responses[0].data;
        console.log(serverPosition);     
        documents.value.push(serverPosition);
      });
    }

    // errorMessage.value = "";
    documentDialog.value = false;
  }

  function cancelDocument() {
    errorMessage.value.name = "";
    errorMessage.value.model = "";
    documentDialog.value = false;
  }

  loadData();
</script>

<script mounted>
    console.log("mounted");
</script>
