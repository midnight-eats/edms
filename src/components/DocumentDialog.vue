<!-- DocumentFormWrapper.vue -->
<template>
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
          <slot name="document-content"></slot>
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
          @click="$emit('cancel')">
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          text="Сохранить" 
          @click="$emit('save')">
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { ref } from 'vue';

  const props = defineProps({
    documentDialog: {
      type: Boolean,
      required: true
    },
    documentModel: {
      type: Object,
      required: true
    },
    isEditingDocument: {
      type: Boolean,
      required: true
    },
    routeStageHeaders: {
      type: Array,
      required: true
    }
  });

  defineEmits(['cancel', 'save']);

  const tab = ref('document');
</script>