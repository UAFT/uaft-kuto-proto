import { appState, setScreen } from './state.js';
import { initKutoScreen } from './screens/kuto.js';

export function startRouter() {
  setScreen('kuto');
  initKutoScreen({
    role: appState.auth?.role || 'director',
    permissions: appState.permissions || {},
  });
}
