import { navigate } from '../router.js';
import { appState } from '../state.js';

export function renderStudentProfilePlaceholder() {
  const content = document.getElementById('content');
  const headerSub = document.getElementById('headerSub');
  const headerActions = document.getElementById('headerActions');
  const groupStatsBadge = document.getElementById('groupStatsBadge');
  const globalLockBtn = document.getElementById('globalLockBtn');
  if (headerSub) headerSub.innerHTML = `${appState.selectedStudentName || 'Карточка ученика'}<span class="subline">Следующий экран этого же mini-app</span>`;
  if (headerActions) headerActions.innerHTML = `<button class="btn purple small" id="backToKutoFromCard">← Назад в KUTO</button>`;
  if (groupStatsBadge) groupStatsBadge.textContent = 'Карточка';
  if (globalLockBtn) { globalLockBtn.textContent = '🔒'; globalLockBtn.classList.remove('unlocked'); }
  content.innerHTML = `<section class="student-profile-placeholder card"><h2>Карточка ученика</h2><p>Экран будет собран следующим этапом на базе выбранного ученика.</p></section>`;
  const btn = document.getElementById('backToKutoFromCard');
  if (btn) btn.onclick = () => navigate('kuto');
}
