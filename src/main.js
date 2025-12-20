/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue';
import mitt from 'mitt';
const emitter = mitt();

// Composables
import { createApp } from 'vue';

// Styles
import 'unfonts.css';

const app = createApp(App);
app.config.globalProperties.emitter = emitter;

registerPlugins(app);

app.mount('#app');
