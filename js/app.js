import { bootstrapApi } from './api.js';
import { getInitialRoute } from './router.js';
import { setBootstrap, appState } from './state.js';
import { initKutoScreen } from './screens/kuto.js';
import { renderStudentProfilePlaceholder } from './screens/student-profile.js';
import { renderStudentPackagesPlaceholder } from './screens/student-packages.js';
import { renderEventJournalPlaceholder } from './screens/event-journal.js';

let bootCache = null;

function renderCurrentRoute() {
  appState.route = getInitialRoute();
  // Clear journal slot when leaving kuto
  const journalSlot = document.getElementById('headerJournalSlot');
  if (journalSlot) journalSlot.innerHTML = '';

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
  // Restore content sections if they were wiped by placeholder screens
  const content = document.getElementById('content');
  if (content && !document.getElementById('view-list')) {
    content.innerHTML = `
      <section class="view active" id="view-list"></section>
      <section class="view" id="view-student"></section>
      <section class="view" id="view-progress"></section>
      <section class="view" id="view-packages"></section>
    `;
  }
  initKutoScreen({ bootstrap: bootCache || appState.boot });
}

async function start() {
  const boot = await bootstrapApi();
  bootCache = boot;
  setBootstrap(boot);
  renderCurrentRoute();
  window.addEventListener('hashchange', renderCurrentRoute);
}

start();
