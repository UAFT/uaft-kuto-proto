import { bootstrapAuth } from './api.js';
import { setAuth } from './state.js';
import { startRouter } from './router.js';

async function boot() {
  const auth = await bootstrapAuth();
  setAuth(auth);
  window.__UAFT_ROLE__ = auth;
  startRouter();
}

boot();
