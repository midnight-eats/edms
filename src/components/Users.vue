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
            <v-icon color="medium-emphasis" icon="mdi-book-multiple" size="x-small" start></v-icon>
            Пользователи
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
          <v-icon color="medium-emphasis" icon="mdi-pencil" size="small" @click="editItem(item.id)"></v-icon>
          <v-icon color="medium-emphasis" icon="mdi-delete" size="small" @click="removeItem(item.id)"></v-icon>
        </div>
    </template>  
  </v-data-table-virtual>
  </v-sheet>


<v-dialog v-model="dialog" max-width="500">
    <v-card :title="`${isEditing ? 'Изменение' : 'Добавление'} пользователя`">
      <template v-slot:text>
        <v-row>

          <v-col cols="12">
            <v-text-field v-model="formModel.name" label="ФИО"></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="formModel.login" label="Логин"></v-text-field>
          </v-col>

          
          <v-col cols="12" md="6">
            <v-text-field v-model="formModel.password" label="Пароль"></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field v-model="formModel.post" label="Должность"></v-text-field>
          </v-col>


          <!--v-col cols="12" md="6">
            <v-select v-model="formModel.genre" :items="['Fiction', 'Dystopian', 'Non-Fiction', 'Sci-Fi']" label="Genre"></v-select>
          </v-col-->

          <!--v-col cols="12" md="6">
            <v-number-input v-model="formModel.year" :max="currentYear" :min="1" label="Year"></v-number-input>
          </v-col-->

          <v-col cols="12" md="6">
            <v-number-input v-model="formModel.age" :min="1" label="Возраст"></v-number-input>
          </v-col>
        </v-row>
      </template>

      <v-divider></v-divider>

      <v-card-actions class="bg-surface-light">
        <v-btn text="Отменить" variant="plain" @click="dialog = false"></v-btn>

        <v-spacer></v-spacer>

        <v-btn text="Сохранить" @click="save"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


</template>

<script setup>
  import { computed, ref, shallowRef, toRef } from 'vue';
  import axios from 'axios';  


  const headers = [
    { title: 'ФИО', align: 'start', key: 'name' },
    { title: 'Логин', align: 'start', key: 'login' },
    { title: 'Пароль', align: 'start', key: 'password' },
    { title: 'Должность', align: 'start', key: 'post'},
    { title: 'Возраст', align: 'end', key: 'age' },
    { title: 'Действия', key: 'actions', align: 'end', sortable: false },

  ]


  const items = ref([])
  const dialog = shallowRef(false)  
  const formModel = ref(createNewRecord())  
  const isEditing = toRef(() => !!formModel.value.id)  

  function loadData()
  {
        console.log("loadData");
        //this.loading = true

        Promise.all([
            axios.get('/api/users/')
        ])
        .then((responses) =>
        {
            console.log(responses);            
            console.log(responses[0].data);
            //users = responses[0].data;

            /*
            responses[0].data.forEach(u => 
            {
                users.push(u);
                
            });
            */

            items.value = responses[0].data;


            /*
            this.items = []
            responses[0].data.data.forEach(d =>
              {
                o = new Notch()
                Object.assign(o, d)
                this.items.push(o)
              })


            this.units = responses[1].data.data
            this.loading = false
            */
        })

  }

    function addItem()
    {
      formModel.value = createNewRecord()
      dialog.value = true      
    }

    function removeItem(id)
    {
      Promise.all([axios.post(`/api/users/delete/${id}`)])
        .then((responses) =>
        {
            console.log(responses);            
            console.log(responses[0].data);

            const index = items.value.findIndex(item => item.id === id)
            items.value.splice(index, 1)
            console.log("removeItem", id)
        })

    }

    
    function createNewRecord () 
    {
        return {
            name: '',
            login: '',
            password: '',
            post: '',
            age: 21,
        }
    }


    function editItem(id)
    {
        const found = items.value.find(item => item.id === id)

        formModel.value = 
        {
            id: found.id,
            name: found.name,
            login: found.login,
            password: found.password,
            post: found.post,
            age: found.age,//found.pages,
         }


        dialog.value = true
        console.log("editItem", id)
    }

    function save()
    {





      if (isEditing.value) 
      {

        Promise.all([axios.post("/api/users/update", formModel.value)])
        .then((responses) =>
        {           
            const index = items.value.findIndex(item => item.id === formModel.value.id)
            items.value[index] = formModel.value
        })
      } 
      else 
      {
        Promise.all([axios.post("/api/users/create", formModel.value)])
        .then((responses) =>
        { 
            var serverUser = responses[0].data
            console.log(serverUser)     
            items.value.push(serverUser)
        })

      }
  
      dialog.value = false
    }


    console.log("setup end");
  loadData();
</script>

<script mounted>
    console.log("mounted");
</script>


