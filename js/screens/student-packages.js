// js/screens/student-packages.js — Пакеты ученика (placeholder)

window.StudentPackagesScreen = (function () {
  function render(container, params) {
    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "profile-screen";

    const topBar = document.createElement("div");
    topBar.className = "sd-topbar";
    topBar.innerHTML = '<button class="sd-back-btn">← Назад</button>';
    wrap.appendChild(topBar);

    const title = document.createElement("div");
    title.className = "profile-title";
    title.textContent = "Пакеты ученика";
    wrap.appendChild(title);

    const ph = document.createElement("div");
    ph.className = "profile-placeholder";
    ph.textContent = "Экран пакетов будет доступен после backend-интеграции";
    wrap.appendChild(ph);

    container.appendChild(wrap);

    wrap.querySelector(".sd-back-btn").addEventListener("click", function () {
      Router.back();
    });
  }

  return { render: render };
})();
