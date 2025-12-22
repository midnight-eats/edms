<template>
  <v-sheet border rounded>  
  <v-data-table-virtual
    :headers="headers"
    :items="documents"
    :hide-default-footer="documents.length < 20"
  >
    <template v-slot:item.routeStage.start_date="{ item }">
      {{ item.routeStage.start_date.toLocaleDateString('ru-RU') }}
    </template>
    
    <template v-slot:item.routeStage.end_date="{ item }">
      {{ item.routeStage.end_date.toLocaleDateString('ru-RU') }}
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
          ОРД
        </v-toolbar-title>
      </v-toolbar>
    </template>

    <template v-slot:item.actions="{ item }">
      <div class="d-flex ga-2 justify-end">
        <v-icon 
          color="medium-emphasis" 
          icon="mdi-eye-outline" 
          size="small" 
          @click="inspectDocument(item)">
        </v-icon>
      </div>
    </template>  

  </v-data-table-virtual>
  </v-sheet>

  <v-dialog v-model="documentDialog" max-width="1200">
    <v-card :title="`Просмотр документа`">
    <container class="pr-6 pl-6" style="overflow-y: auto;">
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            label="Автор"
            item-title="name"
            item-value="id"
            v-model="documentModel.document.author"
            readonly
          >
          </v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-select
            label="Тип документа"
            item-title="name"
            item-value="id"
            v-model="documentModel.administrativeDocumentType"
            readonly
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-text-field 
            v-model="documentModel.document.subject"
            label="Тема"
            readonly
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
            readonly
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
            readonly
          ></v-number-input>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            label="Для исполнения"
            item-title="name"
            item-value="id"
            v-model="documentModel.forExecution"
            readonly
          >
          </v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            label="Для ознакомпления"
            item-title="name"
            item-value="id"
            v-model="documentModel.forFamiliarization"
            readonly
          >
          </v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            label="Контроль осуществляет"
            item-title="name"
            item-value="id"
            v-model="documentModel.supervisor"
            readonly
          >
          </v-autocomplete>
        </v-col>
      </v-row>
    </container>

    <v-divider></v-divider>

    <v-card-actions class="bg-surface-light">
      <v-btn 
        text="Отменить" 
        variant="plain"
        @click="cancelDocument">
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn 
        text="Согласовать" 
        @click="acceptDocument">
      </v-btn>
    </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, ref, shallowRef, toRef } from 'vue';
  import axios from 'axios';
  import { VDateInput } from 'vuetify/labs/VDateInput';

  const headers = [
    { title: 'ID', align: 'start', key: 'id' },
    { title: 'Тема', align: 'start', key: 'document.subject' },
    { title: 'Автор', align: 'start', key: 'document.author' },
    { title: 'Дата начала', align: 'start', key: 'routeStage.start_date' },
    { title: 'Дата окончания', align: 'start', key: 'routeStage.end_date' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

  const documents = ref([]);
  const documentDialog = shallowRef(false);
  const documentModel = ref(createNewDocument());

  function loadData() {
    Promise.all([
      axios.get('/api/active/administrative-documents/')
    ])
    .then((responses) => {
      documents.value = responses[0].data;

      if (documents.value.length > 0) {
        for (const doc of documents.value) {
          doc.routeStage.start_date = new Date(doc.routeStage.start_date);
          let endDate = new Date();
          endDate.setDate(doc.routeStage.start_date.getDate() + doc.routeStage.duration);
          doc.routeStage.end_date = endDate;
        }
      };
    });
  }

  function createNewDocument () {
    return {
      id: 0,
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
        created_at: new Date()
      },
      routeStage: {
        id: 0,
        name: '',
        all_or_one: false,
        start_date: new Date(),
        end_date: new Date(),
        duration: 1,
        routeId: 1,
        routeStageUser: {
          id: 0,
          result: false,
          routeStageId: 0,
          userId: 0
        }
      },
      administrativeDocumentType: {
        id: 0,
        name: ''
      },
      forExecution: {
        id: 0,
        name: ''
      },
      forFamiliarization: {
        id: 0,
        name: ''
      },
      supervisor: {
        id: 0,
        name: ''
      }
    };
  }

  function inspectDocument(item) {
    documentModel.value = documents.value.find(doc => doc.id === item.id);
    documentDialog.value = true;
  }

  async function acceptDocument() {
    Promise.all([axios.post("/api/active/administrative-documents/accept", documentModel.value)])
    .then((responses) => {           
      const index = documents.value.findIndex(item => item.id === documentModel.value.id);
      documents.value.splice(index, 1);
    });

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

  loadData();
</script>

<script mounted>
    console.log("mounted");
</script>
