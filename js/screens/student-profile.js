// js/screens/student-profile.js — Карточка ученика (placeholder)

window.StudentProfileScreen = (function () {
  function render(container, params) {
    const studentId = params.studentId;

    // Telegram back
    if (window.Telegram && Telegram.WebApp.BackButton) {
      Telegram.WebApp.BackButton.show();
    }

    const st = AppState.get("students").find(s => s.id === studentId);

    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "profile-screen";

    const topBar = document.createElement("div");
    topBar.className = "sd-topbar";
    topBar.innerHTML = '<button class="sd-back-btn">← Назад</button>';
    wrap.appendChild(topBar);

    const title = document.createElement("div");
    title.className = "profile-title";
    title.textContent = "Карточка ученика";
    wrap.appendChild(title);

    if (st) {
      const info = document.createElement("div");
      info.className = "profile-info";
      info.innerHTML =
        '<div class="sd-avatar big" style="background:' + (st.avatarColor || "#666") + '">' +
          '<span class="sd-initials">' + (st.firstName[0] || "") + (st.lastName[0] || "") + "</span>" +
        "</div>" +
        '<div class="profile-name">' + st.lastName + " " + st.firstName + "</div>" +
        '<div class="profile-row">Телефон: ' + (st.phone || "—") + "</div>" +
        '<div class="profile-row">Дата рождения: ' + (st.birthDate || "—") + "</div>" +
        '<div class="profile-row">Пол: ' + (st.gender || "—") + "</div>" +
        '<div class="profile-placeholder">Полная карточка ученика будет доступна после backend-интеграции</div>';
      wrap.appendChild(info);
    } else {
      wrap.innerHTML += '<div class="profile-placeholder">Ученик не найден</div>';
    }

    container.appendChild(wrap);

    // Back
    wrap.querySelector(".sd-back-btn").addEventListener("click", function () {
      Router.back();
    });
  }

  return { render: render };
})();
