
import { bootstrapApi } from './api.js';
import { getInitialRoute } from './router.js';
import { setBootstrap, appState } from './state.js';
import { initKutoScreen } from './screens/kuto.js';
import { renderStudentProfilePlaceholder } from './screens/student-profile.js';
import { renderStudentPackagesPlaceholder } from './screens/student-packages.js';
import { renderEventJournalPlaceholder } from './screens/event-journal.js';

async function start() {
  const boot = await bootstrapApi();
  setBootstrap(boot);
  appState.route = getInitialRoute();

  if (appState.route === 'student-profile') {
    renderStudentProfilePlaceholder();
    return;
  }
  if (appState.route === 'student-packages') {
    renderStudentPackagesPlaceholder();
    return;
  }
  if (appState.route === 'event-journal') {
    renderEventJournalPlaceholder();
    return;
  }

  initKutoScreen({ bootstrap: boot });
}

start();
