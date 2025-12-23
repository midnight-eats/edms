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
import IncomingCorrespondences from '@/components/IncomingCorrespondences.vue'
import InternalDocumentTypes from '@/components/InternalDocumentTypes.vue'
import InternalDocuments from '@/components/InternalDocuments.vue'
import LoginForm from '@/components/LoginForm.vue'
import ActiveHRDocuments from '@/components/ActiveHRDocuments.vue'
import ArchivedHRDocuments from '@/components/ArchivedHRDocuments.vue'
import ActiveMemos from '@/components/ActiveMemos.vue'
import ArchivedMemos from '@/components/ArchivedMemos.vue'
import ActiveContracts from '@/components/ActiveContracts.vue'
import ArchivedContracts from '@/components/ArchivedContracts.vue'
import ActiveAdministrativeDocuments from '@/components/ActiveAdministrativeDocuments.vue'
import ArchivedAdministrativeDocuments from '@/components/ArchivedAdministrativeDocuments.vue'
import ActiveOutgoingCorrespondences from '@/components/ActiveOutgoingCorrespondences.vue'
import ArchivedOutgoingCorrespondences from '@/components/ArchivedOutgoingCorrespondences.vue'
import ActiveIncomingCorrespondences from '@/components/ActiveIncomingCorrespondences.vue'
import ArchivedIncomingCorrespondences from '@/components/ArchivedIncomingCorrespondences.vue'
import ActiveInternalDocuments from '@/components/ActiveInternalDocuments.vue'
import ArchivedInternalDocuments from '@/components/ArchivedInternalDocuments.vue'
import HelloWorld from '@/components/HelloWorld.vue';

const routes = [
  { path: '/', component: HelloWorld, meta: { requiresAuth: true }},
  { path: '/users', component: Users, meta: { requiresAuth: true } },
  { path: '/departments', component: Departments, meta: { requiresAuth: true } },
  { path: '/positions', component: Positions, meta: { requiresAuth: true } },
  { path: '/categories', component: Categories, meta: { requiresAuth: true } },
  { path: '/documents', component: Documents, meta: { requiresAuth: true } },
  { path: '/hr-document-types', component: HRDocumentTypes, meta: { requiresAuth: true } },
  { path: '/hr-documents', component: HRDocuments, meta: { requiresAuth: true } },
  { path: '/memo-types', component: MemoTypes, meta: { requiresAuth: true } },
  { path: '/memos', component: Memos, meta: { requiresAuth: true } },
  { path: '/contract-types', component: ContractTypes, meta: { requiresAuth: true } },
  { path: '/contracts', component: Contracts, meta: { requiresAuth: true } },
  { path: '/administrative-document-types', component: AdministrativeDocumentTypes, meta: { requiresAuth: true } },
  { path: '/administrative-documents', component: AdministrativeDocuments, meta: { requiresAuth: true } },
  { path: '/delivery-methods', component: DeliveryMethods, meta: { requiresAuth: true } },
  { path: '/counterparties', component: Counterparties, meta: { requiresAuth: true } },
  { path: '/outgoing-correspondences', component: OutgoingCorrespondences, meta: { requiresAuth: true } },
  { path: '/incoming-correspondences', component: IncomingCorrespondences, meta: { requiresAuth: true } },
  { path: '/internal-document-types', component: InternalDocumentTypes, meta: { requiresAuth: true } },
  { path: '/internal-documents', component: InternalDocuments, meta: { requiresAuth: true } },
  { path: '/active/hr-documents', component: ActiveHRDocuments, meta: { requiresAuth: true } },
  { path: '/archived/hr-documents', component: ArchivedHRDocuments, meta: { requiresAuth: true } },
  { path: '/active/memos', component: ActiveMemos, meta: { requiresAuth: true } },
  { path: '/archived/memos', component: ArchivedMemos, meta: { requiresAuth: true } },
  { path: '/active/contracts', component: ActiveContracts, meta: { requiresAuth: true } },
  { path: '/archived/contracts', component: ArchivedContracts, meta: { requiresAuth: true } },
  { path: '/active/administrative-documents', component: ActiveAdministrativeDocuments, meta: { requiresAuth: true } },
  { path: '/archived/administrative-documents', component: ArchivedAdministrativeDocuments, meta: { requiresAuth: true } },
  { path: '/active/outgoing-correspondences', component: ActiveOutgoingCorrespondences, meta: { requiresAuth: true } },
  { path: '/archived/outgoing-correspondences', component: ArchivedOutgoingCorrespondences, meta: { requiresAuth: true } },
  { path: '/active/incoming-correspondences', component: ActiveIncomingCorrespondences, meta: { requiresAuth: true } },
  { path: '/archived/incoming-correspondences', component: ArchivedIncomingCorrespondences, meta: { requiresAuth: true } },
  { path: '/active/internal-documents', component: ActiveInternalDocuments, meta: { requiresAuth: true } },
  { path: '/archived/internal-documents', component: ArchivedInternalDocuments, meta: { requiresAuth: true } },
  { path: '/login', component: LoginForm }
];

console.log(routes);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = localStorage.getItem('userToken'); // Check if token exists
  //console.log('yay');
  console.log(`requireAuth: ${requiresAuth}`);
  console.log(`isAuthenticated: ${isAuthenticated}`);

  if (requiresAuth && !(isAuthenticated)) {
    console.log('relogin');
    // If route requires auth and user is not logged in, redirect to login page
    next('/login');
  } else {
    next(); // Proceed as normal
  }
});

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