import { Router, RouterMode } from '@esmx/router';
import { createVueApp } from './create-app';
import { routes } from './routes';
const router = new Router({ root: '#app', mode: RouterMode.history, routes });
const { app } = createVueApp(router);
app.mount('#app');
