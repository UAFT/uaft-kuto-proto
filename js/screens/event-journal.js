// js/screens/event-journal.js — Журнал событий (placeholder)

window.EventJournalScreen = (function () {
  function render(container, params) {
    if (window.Telegram && Telegram.WebApp.BackButton) {
      Telegram.WebApp.BackButton.show();
    }

    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "profile-screen";

    const topBar = document.createElement("div");
    topBar.className = "sd-topbar";
    topBar.innerHTML = '<button class="sd-back-btn">← Назад к KUTO</button>';
    wrap.appendChild(topBar);

    const title = document.createElement("div");
    title.className = "profile-title journal-title";
    title.textContent = "📋 Журнал событий";
    wrap.appendChild(title);

    const groupId = params.groupId;
    const group = AppState.get("groups").find(g => g.id === groupId);

    if (group) {
      const ctx = document.createElement("div");
      ctx.className = "journal-ctx";
      ctx.textContent = group.name + " • " + (AppState.get("discipline") ? AppState.get("discipline").name : "");
      wrap.appendChild(ctx);
    }

    const ph = document.createElement("div");
    ph.className = "profile-placeholder";
    ph.textContent = "Журнал событий группы будет доступен после backend-интеграции";
    wrap.appendChild(ph);

    container.appendChild(wrap);

    wrap.querySelector(".sd-back-btn").addEventListener("click", function () {
      Router.back();
    });
  }

  return { render: render };
})();
