<template>
  <v-sheet border rounded>  
  <v-data-table-virtual
    :headers="headers"
    :items="items"
    :hide-default-footer="items.length < 20"
  >

  <template v-slot:top>
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon 
          color="medium-emphasis" 
          icon="mdi-book-multiple" 
          size="x-small" start>
        </v-icon>
        Способы доставки
      </v-toolbar-title>

      <v-btn
        class="me-2"
        prepend-icon="mdi-plus"
        rounded="lg"
        text="Добавить"
        @click="addItem"
      ></v-btn>
    </v-toolbar>
  </template>

    <template v-slot:item.actions="{ item }">
      <div class="d-flex ga-2 justify-end">
        <v-icon 
          color="medium-emphasis" 
          icon="mdi-pencil" 
          size="small" 
          @click="editItem(item.id)">
        </v-icon>
        <v-icon 
          color="medium-emphasis" 
          icon="mdi-delete" 
          size="small" 
          @click="removeItem(item.id)">
        </v-icon>
      </div>
    </template>  
  </v-data-table-virtual>
  </v-sheet>

  <v-dialog v-model="dialog" max-width="500">
    <v-card :title="`${isEditing ? 'Изменение' : 'Добавление'} способа доставки`">
      <template v-slot:text>
        <v-row>
          <v-col v-if="errorMessage" cols="12">
            <v-label :text="errorMessage"></v-label>
          </v-col>
          <v-col cols="12">
            <v-text-field 
              v-model="formModel.name"
              label="Название"
              required
            ></v-text-field>
          </v-col>
        </v-row>
      </template>

      <v-divider></v-divider>

      <v-card-actions class="bg-surface-light">
        <v-btn 
          text="Отменить" 
          variant="plain"
          @click="cancel">
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          text="Сохранить" 
          @click="save">
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, ref, shallowRef, toRef } from 'vue';
  import axios from 'axios'; 

  const headers = [
    { title: 'ID', align: 'start', key: 'id' },
    { title: 'Название', align: 'start', key: 'name' },
    { title: '', key: 'actions', align: 'end', sortable: false },
  ];

  const items = ref([]);
  const dialog = shallowRef(false);  
  const formModel = ref(createNewRecord());
  const isEditing = toRef(() => !!formModel.value.id);
  const errorMessage = ref('');
  const tempModel = ref(createNewRecord());

  function loadData() {
    Promise.all([
      axios.get('/api/delivery-methods/')
    ])
    .then((responses) => {
      items.value = responses[0].data;
    });
  }

  function addItem() {
    formModel.value = createNewRecord();
    dialog.value = true;
  }

  function removeItem(id) {
    Promise.all([axios.post(`/api/delivery-methods/delete/${id}`)])
    .then((responses) => {
      const index = items.value.findIndex(item => item.id === id);
      items.value.splice(index, 1);
    });
  }

  function createNewRecord () {
    return {
      id: 0,
      name: '',
    };
  }

  function editItem(id) {
    tempModel.value = items.value.find(item => item.id === id);

    formModel.value = {
      id: tempModel.value.id,
      name: tempModel.value.name,
    };

    dialog.value = true;
  }

  async function save() {
    if (formModel.value.name.length === 0) {
      errorMessage.value = "Поле должно быть заполнено";

      return;
    }

    const found = items.value.find(item => item.name === formModel.value.name);

    if (isEditing.value) {
      if (found && tempModel.value.name !== formModel.value.name) {
        errorMessage.value = "Такая запись уже существует в базе данных";
        return;
      }

      Promise.all([axios.post("/api/delivery-methods/update", formModel.value)])
      .then((responses) => {           
        const index = items.value.findIndex(item => item.id === formModel.value.id);
        items.value[index] = formModel.value;
      });
    } 
    else {
      if (found) {
        errorMessage.value = "Такая запись уже существует в базе данных"; 
        return;
      }

      Promise.all([axios.post("/api/delivery-methods/create", formModel.value)])
      .then((responses) => { 
        var serverDeliveryMethod = responses[0].data;
        console.log(serverDeliveryMethod);     
        items.value.push(serverDeliveryMethod);
      });
    }

    errorMessage.value = "";
    dialog.value = false;
  }

  function cancel() {
    errorMessage.value = "";
    dialog.value = false;
  }

  loadData();
</script>

<script mounted>
    console.log("mounted");
</script>
