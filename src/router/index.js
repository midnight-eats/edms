/**
 * router/index.ts
 *
 * Automatic routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
//import { routes } from 'vue-router/auto-routes'
import Users from '@/components/Users.vue'
import Departments from '@/components/Departments.vue'
import Positions from '@/components/Positions.vue'
import Categories from '@/components/Categories.vue'
import Documents from '@/components/Documents.vue'
import HRDocumentTypes from '@/components/HRDocumentTypes.vue'
import HRDocuments from '@/components/HRDocuments.vue'
import MemoTypes from '@/components/MemoTypes.vue'
import Memos from '@/components/Memos.vue'
import ContractTypes from '@/components/ContractTypes.vue'
import Contracts from '@/components/Contracts.vue'
import AdministrativeDocumentTypes from '@/components/AdministrativeDocumentTypes.vue'
import AdministrativeDocuments from '@/components/AdministrativeDocuments.vue'
import DeliveryMethods from '@/components/DeliveryMethods.vue'
import Counterparties from '@/components/Counterparties.vue'
import OutgoingCorrespondences from '@/components/OutgoingCorrespondences.vue'
import index from '@/pages/index.vue';
import HelloWorld from '@/components/HelloWorld.vue';

const routes = [
  { path: '/', component: HelloWorld},
  { path: '/users', component: Users },
  { path: '/departments', component: Departments },
  { path: '/positions', component: Positions },
  { path: '/categories', component: Categories },
  { path: '/documents', component: Documents },
  { path: '/hr-document-types', component: HRDocumentTypes },
  { path: '/hr-documents', component: HRDocuments },
  { path: '/memo-types', component: MemoTypes },
  { path: '/memos', component: Memos },
  { path: '/contract-types', component: ContractTypes },
  { path: '/contracts', component: Contracts },
  { path: '/administrative-document-types', component: AdministrativeDocumentTypes },
  { path: '/administrative-documents', component: AdministrativeDocuments },
  { path: '/delivery-methods', component: DeliveryMethods },
  { path: '/counterparties', component: Counterparties },
  { path: '/outgoing-correspondences', component: OutgoingCorrespondences }
  //{ path: '/profile', component: ProfileView },
];

console.log(routes);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router