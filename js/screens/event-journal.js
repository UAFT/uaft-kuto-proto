import { navigate } from '../router.js';

export function renderEventJournalPlaceholder() {
  const content = document.getElementById('content');
  const headerSub = document.getElementById('headerSub');
  const headerActions = document.getElementById('headerActions');
  const groupStatsBadge = document.getElementById('groupStatsBadge');
  const globalLockBtn = document.getElementById('globalLockBtn');
  if (headerSub) headerSub.innerHTML = `Журнал событий<span class="subline">Следующий экран этого же mini-app</span>`;
  if (headerActions) headerActions.innerHTML = `<button class="btn purple small" id="backToKutoFromJournal">← Назад в KUTO</button>`;
  if (groupStatsBadge) groupStatsBadge.textContent = 'ЖС';
  if (globalLockBtn) { globalLockBtn.textContent = '🔒'; globalLockBtn.classList.remove('unlocked'); }
  content.innerHTML = `<section class="student-profile-placeholder card"><h2>Журнал событий</h2><p>Экран будет собран следующим этапом на том же app-shell.</p></section>`;
  const btn = document.getElementById('backToKutoFromJournal');
  if (btn) btn.onclick = () => navigate('kuto');
}
