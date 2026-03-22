import { navigate } from '../router.js';
import { appState } from '../state.js';

export function renderStudentPackagesPlaceholder() {
  const content = document.getElementById('content');
  const headerSub = document.getElementById('headerSub');
  const headerActions = document.getElementById('headerActions');
  const groupStatsBadge = document.getElementById('groupStatsBadge');
  const globalLockBtn = document.getElementById('globalLockBtn');
  if (headerSub) headerSub.innerHTML = `${appState.selectedStudentName || 'Пакеты'}<span class="subline">Следующий экран этого же mini-app</span>`;
  if (headerActions) headerActions.innerHTML = `<button class="btn purple small" id="backToKutoFromPackages">← Назад в KUTO</button>`;
  if (groupStatsBadge) groupStatsBadge.textContent = 'Пакеты';
  if (globalLockBtn) { globalLockBtn.textContent = '🔒'; globalLockBtn.classList.remove('unlocked'); }
  content.innerHTML = `<section class="student-profile-placeholder card"><h2>Пакеты ученика</h2><p>Экран будет собран следующим этапом.</p></section>`;
  const btn = document.getElementById('backToKutoFromPackages');
  if (btn) btn.onclick = () => navigate('kuto');
}
