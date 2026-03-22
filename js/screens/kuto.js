// js/screens/kuto.js — KUTO Main Screen
// Состав, Ученик, Прогресс, Пакеты — всё внутри одного экрана с табами

window.KutoScreen = (function () {
  let _container = null;
  let _view = "roster"; // roster | student | progress | packages
  let _selectedStudentId = null;
  let _lastTapTime = 0;
  let _lastTapDate = null;

  // ─── Helpers ───
  const MONTHS = [
    "Январь","Февраль","Март","Апрель","Май","Июнь",
    "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
  ];

  function fmt(n) {
    return n.toLocaleString("ru-RU");
  }

  function shortDate(d) {
    const dt = new Date(d);
    return dt.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  }

  function dayOfWeek(d) {
    return new Date(d).toLocaleDateString("ru-RU", { weekday: "short" });
  }

  function toast(msg, type) {
    const tc = document.getElementById("toast-container");
    const t = document.createElement("div");
    t.className = "toast toast-" + (type || "info");
    t.textContent = msg;
    tc.appendChild(t);
    setTimeout(() => t.classList.add("show"), 10);
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    }, 2400);
  }

  function showSheet(title, items, onSelect) {
    const overlay = document.getElementById("sheet-overlay");
    const panel = document.getElementById("sheet-panel");
    panel.innerHTML = "";

    const hdr = document.createElement("div");
    hdr.className = "sheet-header";
    hdr.innerHTML = '<span class="sheet-title">' + title + "</span>" +
      '<span class="sheet-close">✕</span>';
    panel.appendChild(hdr);

    const list = document.createElement("div");
    list.className = "sheet-list";
    items.forEach(function (item) {
      const row = document.createElement("div");
      row.className = "sheet-item";
      if (item.selected) row.classList.add("selected");
      row.textContent = item.label;
      row.addEventListener("click", function () {
        onSelect(item);
        closeSheet();
      });
      list.appendChild(row);
    });
    panel.appendChild(list);

    overlay.classList.remove("hidden");
    panel.classList.remove("hidden");

    function closeSheet() {
      overlay.classList.add("hidden");
      panel.classList.add("hidden");
    }

    overlay.onclick = closeSheet;
    hdr.querySelector(".sheet-close").onclick = closeSheet;
  }

  // ─── RENDER ENTRY ───
  function render(container) {
    _container = container;
    _view = "roster";
    _selectedStudentId = null;

    // Telegram back button
    if (window.Telegram && Telegram.WebApp.BackButton) {
      Telegram.WebApp.BackButton.hide();
    }

    _renderFull();
  }

  function _renderFull() {
    _container.innerHTML = "";

    if (_view === "roster") {
      _renderHeader();
      _renderFilters();
      _renderStudentList();
    } else if (_view === "student") {
      _renderStudentDetail();
    } else if (_view === "progress") {
      _renderProgress();
    } else if (_view === "packages") {
      _renderPackages();
    }
  }

  // ─── HEADER ───
  function _renderHeader() {
    const state = AppState.get();
    const group = state.group;
    const disc = state.discipline;
    const students = state.students || [];
    const activeCount = students.filter(s => s.status === "active").length;
    const totalCount = students.length;
    const limit = group ? group.limit : 0;
    const monthStr = MONTHS[state.month] + " " + state.year;
    const rhythm = group ? group.rhythm : "—";
    const typeLabel = state.trainingType === "group" ? "Групповая" : "Индивидуальная";

    const hdr = document.createElement("div");
    hdr.className = "kuto-header";

    hdr.innerHTML =
      '<div class="kuto-header-top">' +
        '<div class="kuto-header-left">' +
          '<div class="kuto-title">KUTO</div>' +
          '<div class="kuto-ctx">' +
            '<div class="kuto-ctx-line ctx-discipline">' + (disc ? disc.name : "—") + "</div>" +
            '<div class="kuto-ctx-line ctx-type">' + typeLabel + "</div>" +
            '<div class="kuto-ctx-line ctx-group">' + (group ? group.name : "—") + "</div>" +
            '<div class="kuto-ctx-line ctx-month">' + monthStr + "</div>" +
            '<div class="kuto-ctx-line ctx-rhythm">Ритм группы: ' + rhythm + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="kuto-header-right">' +
          '<div class="kuto-quota-row">' +
            '<span class="quota-active">' + activeCount + "</span>" +
            '<span class="quota-sep"> / </span>' +
            '<span class="quota-total">' + totalCount + "</span>" +
            '<span class="quota-sep"> / </span>' +
            '<span class="quota-limit">' + limit + "</span>" +
            '<button class="kuto-lock-btn" id="lock-btn">' +
              (state.editLocked ? "🔒" : "🔓") +
            "</button>" +
          "</div>" +
          (AppState.can("canOpenJournal")
            ? '<button class="kuto-journal-btn" id="journal-btn">📋 Журнал событий</button>'
            : "") +
        "</div>" +
      "</div>";

    _container.appendChild(hdr);

    // Зелёная кнопка "Добавить ученика"
    if (AppState.can("canAddStudentToGroup")) {
      const addBar = document.createElement("button");
      addBar.className = "kuto-add-student-bar";
      addBar.textContent = "+ Добавить ученика в группу";
      addBar.addEventListener("click", _onAddStudent);
      _container.appendChild(addBar);
    }

    // Listeners
    const lockBtn = document.getElementById("lock-btn");
    if (lockBtn) {
      lockBtn.addEventListener("click", function () {
        AppState.set("editLocked", !AppState.get("editLocked"));
        _renderFull();
      });
    }
    const jBtn = document.getElementById("journal-btn");
    if (jBtn) {
      jBtn.addEventListener("click", function () {
        Router.navigate("event-journal", { groupId: state.group ? state.group.id : null });
      });
    }
  }

  // ─── FILTERS ───
  function _renderFilters() {
    const state = AppState.get();
    const wrap = document.createElement("div");
    wrap.className = "kuto-filters";

    // Discipline picker
    wrap.appendChild(_makeFilterBtn("filter-disc", "Дисциплина", state.discipline ? state.discipline.name : "—", function () {
      showSheet("Дисциплина", state.disciplines.map(d => ({
        label: d.name, value: d, selected: state.discipline && state.discipline.id === d.id,
      })), async function (item) {
        AppState.set("discipline", item.value);
        const groups = await Api.getGroups(item.value.id);
        AppState.set({ groups: groups, group: groups[0] || null });
        if (groups[0]) {
          const students = await Api.getStudents(groups[0].id);
          AppState.set("students", students);
        } else {
          AppState.set("students", []);
        }
        _renderFull();
      });
    }));

    // Training type
    wrap.appendChild(_makeFilterBtn("filter-type", "Тип тренировки", state.trainingType === "group" ? "Групповая" : "Индивидуальная", function () {
      showSheet("Тип тренировки", [
        { label: "Групповая", value: "group", selected: state.trainingType === "group" },
        { label: "Индивидуальная", value: "individual", selected: state.trainingType === "individual" },
      ], function (item) {
        AppState.set("trainingType", item.value);
        _renderFull();
      });
    }));

    // Group / Trainer
    if (state.trainingType === "group") {
      wrap.appendChild(_makeFilterBtn("filter-group", "Группа", state.group ? state.group.name : "—", function () {
        showSheet("Группа", state.groups.map(g => ({
          label: g.name, value: g, selected: state.group && state.group.id === g.id,
        })), async function (item) {
          AppState.set("group", item.value);
          const students = await Api.getStudents(item.value.id);
          AppState.set("students", students);
          _renderFull();
        });
      }));
    } else {
      wrap.appendChild(_makeFilterBtn("filter-trainer", "Тренер", state.trainer ? state.trainer.name : "—", function () {
        showSheet("Тренер", state.trainers.map(t => ({
          label: t.name, value: t, selected: state.trainer && state.trainer.id === t.id,
        })), function (item) {
          AppState.set("trainer", item.value);
          _renderFull();
        });
      }));
    }

    // Month
    wrap.appendChild(_makeFilterBtn("filter-month", "Месяц", MONTHS[state.month], function () {
      showSheet("Месяц", MONTHS.map((m, i) => ({
        label: m, value: i, selected: state.month === i,
      })), function (item) {
        AppState.set("month", item.value);
        _renderFull();
      });
    }));

    // Year
    const curYear = new Date().getFullYear();
    const years = [curYear - 1, curYear, curYear + 1];
    wrap.appendChild(_makeFilterBtn("filter-year", "Год", String(state.year), function () {
      showSheet("Год", years.map(y => ({
        label: String(y), value: y, selected: state.year === y,
      })), function (item) {
        AppState.set("year", item.value);
        _renderFull();
      });
    }));

    // Search
    const searchWrap = document.createElement("div");
    searchWrap.className = "kuto-search-wrap";
    searchWrap.innerHTML = '<input type="text" class="kuto-search" placeholder="Поиск ученика…" value="' +
      (state.searchQuery || "") + '">';
    wrap.appendChild(searchWrap);

    _container.appendChild(wrap);

    // Search listener
    const input = wrap.querySelector(".kuto-search");
    let searchTimer = null;
    input.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        AppState.set("searchQuery", input.value.trim());
        _renderStudentListOnly();
      }, 250);
    });
  }

  function _makeFilterBtn(id, label, value, onClick) {
    const btn = document.createElement("button");
    btn.className = "kuto-filter-btn";
    btn.id = id;
    btn.innerHTML = '<span class="filter-label">' + label + '</span><span class="filter-value">' + value + ' ▾</span>';
    btn.addEventListener("click", onClick);
    return btn;
  }

  // ─── STUDENT LIST ───
  function _renderStudentList() {
    const listWrap = document.createElement("div");
    listWrap.className = "kuto-student-list";
    listWrap.id = "student-list";
    _container.appendChild(listWrap);
    _renderStudentListOnly();
  }

  function _renderStudentListOnly() {
    const listWrap = document.getElementById("student-list");
    if (!listWrap) return;
    listWrap.innerHTML = "";

    const state = AppState.get();
    let students = (state.students || []).filter(s => s.status === "active");
    const q = (state.searchQuery || "").toLowerCase();
    if (q) {
      students = students.filter(s =>
        (s.lastName + " " + s.firstName).toLowerCase().includes(q) ||
        (s.firstName + " " + s.lastName).toLowerCase().includes(q)
      );
    }

    if (students.length === 0) {
      listWrap.innerHTML = '<div class="kuto-empty">Нет учеников в текущем составе</div>';
      return;
    }

    students.forEach(function (st, idx) {
      const card = document.createElement("div");
      card.className = "student-card";
      card.dataset.sid = st.id;

      const paidClass = st.debt === 0 ? "val-green" : (st.paid > 0 ? "val-yellow" : "val-red");
      const debtClass = st.debt > 0 ? "val-red" : "val-green";
      const initials = (st.firstName[0] || "") + (st.lastName[0] || "");

      card.innerHTML =
        '<div class="sc-left">' +
          '<div class="sc-avatar" style="background:' + (st.avatarColor || "#666") + '">' +
            '<span class="sc-initials">' + initials + "</span>" +
          "</div>" +
          '<div class="sc-num">' + (idx + 1) + "</div>" +
        "</div>" +
        '<div class="sc-center">' +
          '<div class="sc-name">' + st.lastName + " " + st.firstName + "</div>" +
          '<div class="sc-status status-active">Активен</div>' +
          '<div class="sc-package">Пакет №' + st.packageNum + " • Блок " + st.block + "</div>" +
          '<div class="sc-kpi">' +
            '<span class="kpi-item ' + paidClass + '">Оплачено ' + fmt(st.paid) + "</span>" +
            '<span class="kpi-sep">•</span>' +
            '<span class="kpi-item ' + debtClass + '">Долг ' + fmt(st.debt) + "</span>" +
            '<span class="kpi-sep">•</span>' +
            '<span class="kpi-item val-green">Прогресс ' + st.progress + "%</span>" +
          "</div>" +
        "</div>" +
        '<div class="sc-right">' +
          (AppState.can("canRemoveStudentFromGroup")
            ? '<button class="sc-remove-btn" data-sid="' + st.id + '" title="Убрать из группы">↗</button>'
            : "") +
          (st.frozen
            ? '<button class="sc-freeze-btn" data-sid="' + st.id + '" title="Заморожен">❄</button>'
            : "") +
        "</div>";

      // Клик по карточке → экран ученика
      card.addEventListener("click", function (e) {
        if (e.target.closest(".sc-remove-btn") || e.target.closest(".sc-freeze-btn")) return;
        if (AppState.can("canOpenStudentProfile") || AppState.get("role") === "student") {
          _selectedStudentId = st.id;
          _view = "student";
          _showBackButton();
          _renderFull();
        }
      });

      listWrap.appendChild(card);
    });

    // Remove buttons
    listWrap.querySelectorAll(".sc-remove-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const sid = btn.dataset.sid;
        const st = students.find(s => s.id === sid);
        if (st && confirm("Убрать " + st.lastName + " " + st.firstName + " из группы?")) {
          Api.removeFromGroup(sid, AppState.get("group")?.id).then(function () {
            const updated = AppState.get("students").filter(s => s.id !== sid || s.status === "active");
            // Refresh
            Api.getStudents(AppState.get("group")?.id).then(function (sts) {
              AppState.set("students", sts);
              _renderStudentListOnly();
            });
          });
        }
      });
    });

    // Freeze buttons
    listWrap.querySelectorAll(".sc-freeze-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        toast("Пакет заморожен", "info");
      });
    });
  }

  // ─── STUDENT DETAIL ───
  function _renderStudentDetail() {
    const st = AppState.get("students").find(s => s.id === _selectedStudentId);
    if (!st) { _view = "roster"; _renderFull(); return; }

    const wrap = document.createElement("div");
    wrap.className = "kuto-student-detail";

    const initials = (st.firstName[0] || "") + (st.lastName[0] || "");

    // Sub-tabs
    const tabs = document.createElement("div");
    tabs.className = "sd-tabs";

    const tabItems = [
      { key: "student", label: "Ученик" },
      { key: "progress", label: "Прогресс" },
      { key: "packages", label: "Пакеты" },
    ];

    tabItems.forEach(function (t) {
      const tb = document.createElement("button");
      tb.className = "sd-tab" + (_view === t.key ? " active" : "");
      tb.textContent = t.label;
      tb.addEventListener("click", function () {
        _view = t.key;
        _renderFull();
      });
      tabs.appendChild(tb);
    });

    // Back + Card buttons row
    const topBar = document.createElement("div");
    topBar.className = "sd-topbar";
    topBar.innerHTML =
      '<button class="sd-back-btn">← Состав</button>' +
      '<button class="sd-card-btn">Карточка →</button>';
    wrap.appendChild(topBar);
    wrap.appendChild(tabs);

    // Student info
    const info = document.createElement("div");
    info.className = "sd-info";

    const paidClass = st.debt === 0 ? "val-green" : (st.paid > 0 ? "val-yellow" : "val-red");
    const costLabel = fmt(st.cost);

    info.innerHTML =
      '<div class="sd-avatar" style="background:' + (st.avatarColor || "#666") + '">' +
        '<span class="sd-initials">' + initials + "</span>" +
      "</div>" +
      '<div class="sd-main-info">' +
        '<div class="sd-name">' + st.lastName + " " + st.firstName + "</div>" +
        '<div class="sd-row"><span class="sd-label">Пакет №</span><span class="sd-val">' + st.packageNum + "</span></div>" +
        '<div class="sd-row"><span class="sd-label">Блок</span><span class="sd-val">' + st.block + "</span></div>" +
        '<div class="sd-row"><span class="sd-label">Дата начала</span><span class="sd-val">' + shortDate(st.activeSince) + "</span></div>" +
        '<div class="sd-row"><span class="sd-label">Активен по</span><span class="sd-val">' + shortDate(st.activeUntil) + "</span></div>" +
        '<div class="sd-row"><span class="sd-label">Стоимость</span><span class="sd-val val-yellow">' + costLabel + "</span></div>" +
        (st.discount > 0 ? '<div class="sd-row"><span class="sd-label">Скидка</span><span class="sd-val val-green">' + fmt(st.discount) + "</span></div>" : "") +
        '<div class="sd-row"><span class="sd-label">Оплачено</span><span class="sd-val ' + paidClass + '">' + fmt(st.paid) + "</span></div>" +
        '<div class="sd-row"><span class="sd-label">Долг</span><span class="sd-val ' + (st.debt > 0 ? "val-red" : "val-green") + '">' + fmt(st.debt) + "</span></div>" +
        '<div class="sd-row"><span class="sd-label">Прогресс</span><span class="sd-val val-green">' + st.progress + "%</span></div>" +
        '<div class="sd-row"><span class="sd-label">Подрядность</span><span class="sd-val">' + (st.consistency || 0) + "%</span></div>" +
        '<div class="sd-row"><span class="sd-label">Серия</span><span class="sd-val">' + (st.streak || 0) + "</span></div>" +
      "</div>";

    wrap.appendChild(info);

    // Action buttons
    const actions = document.createElement("div");
    actions.className = "sd-actions";

    if (AppState.can("canFreezePackage")) {
      const freezeBtn = document.createElement("button");
      freezeBtn.className = "sd-action-btn btn-freeze";
      freezeBtn.textContent = st.frozen ? "Разморозить" : "Заморозить";
      freezeBtn.addEventListener("click", function () {
        Api.freezePackage(st.id).then(function (res) {
          st.frozen = res.frozen;
          toast(res.frozen ? "Пакет заморожен" : "Пакет разморожен", "info");
          _renderFull();
        });
      });
      actions.appendChild(freezeBtn);
    }

    if (AppState.can("canExtendPackage")) {
      const extBtn = document.createElement("button");
      extBtn.className = "sd-action-btn btn-extend";
      extBtn.textContent = "Продлить пакет +7";
      extBtn.addEventListener("click", function () {
        Api.extendPackage(st.id, 7).then(function () {
          toast("Пакет продлён на 7 дней", "success");
        });
      });
      actions.appendChild(extBtn);
    }

    if (AppState.can("canMakePayment")) {
      const payBtn = document.createElement("button");
      payBtn.className = "sd-action-btn btn-pay";
      payBtn.textContent = st.debt > 0 ? "Внести доплату" : "Внести оплату";
      payBtn.addEventListener("click", function () {
        toast("Окно оплаты (интеграция)", "info");
      });
      actions.appendChild(payBtn);
    }

    if (AppState.can("canRemoveStudentFromGroup")) {
      const rmBtn = document.createElement("button");
      rmBtn.className = "sd-action-btn btn-remove";
      rmBtn.textContent = "Убрать из группы";
      rmBtn.addEventListener("click", function () {
        if (confirm("Убрать " + st.lastName + " " + st.firstName + " из группы?")) {
          Api.removeFromGroup(st.id, AppState.get("group")?.id).then(function () {
            toast("Ученик убран из группы", "info");
            _view = "roster";
            Api.getStudents(AppState.get("group")?.id).then(function (sts) {
              AppState.set("students", sts);
              _renderFull();
            });
          });
        }
      });
      actions.appendChild(rmBtn);
    }

    wrap.appendChild(actions);
    _container.appendChild(wrap);

    // Event listeners
    wrap.querySelector(".sd-back-btn").addEventListener("click", function () {
      _view = "roster";
      _hideBackButton();
      _renderFull();
    });
    wrap.querySelector(".sd-card-btn").addEventListener("click", function () {
      Router.navigate("student-profile", { studentId: st.id });
    });
  }

  // ─── PROGRESS ───
  function _renderProgress() {
    const st = AppState.get("students").find(s => s.id === _selectedStudentId);
    if (!st) { _view = "roster"; _renderFull(); return; }

    const wrap = document.createElement("div");
    wrap.className = "kuto-progress";

    // Top bar
    const topBar = document.createElement("div");
    topBar.className = "sd-topbar";
    topBar.innerHTML = '<button class="sd-back-btn">← Состав</button>';
    wrap.appendChild(topBar);

    // Tabs
    const tabs = document.createElement("div");
    tabs.className = "sd-tabs";
    [
      { key: "student", label: "Ученик" },
      { key: "progress", label: "Прогресс" },
      { key: "packages", label: "Пакеты" },
    ].forEach(function (t) {
      const tb = document.createElement("button");
      tb.className = "sd-tab" + (_view === t.key ? " active" : "");
      tb.textContent = t.label;
      tb.addEventListener("click", function () {
        _view = t.key;
        _renderFull();
      });
      tabs.appendChild(tb);
    });
    wrap.appendChild(tabs);

    // Header
    const hdr = document.createElement("div");
    hdr.className = "prog-header";
    hdr.innerHTML =
      '<div class="prog-name">' + st.lastName + " " + st.firstName + "</div>" +
      '<div class="prog-pkg">' + st.packageType + " • Пакет №" + st.packageNum + "</div>" +
      '<div class="prog-pct">' + st.progress + "%</div>";
    wrap.appendChild(hdr);

    // Dot progress bar
    const dotBar = document.createElement("div");
    dotBar.className = "prog-dots";
    st.trainings.forEach(function (tr) {
      const dot = document.createElement("span");
      dot.className = "prog-dot";
      if (tr.done && tr.late) dot.classList.add("dot-late");
      else if (tr.done) dot.classList.add("dot-done");
      else dot.classList.add("dot-empty");
      dotBar.appendChild(dot);
    });
    wrap.appendChild(dotBar);

    // Date carousel
    const carousel = document.createElement("div");
    carousel.className = "prog-carousel";
    st.trainings.forEach(function (tr) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const trDate = new Date(tr.date);
      const isFuture = trDate > today;

      const slot = document.createElement("div");
      slot.className = "prog-slot";
      if (tr.done && tr.late) slot.classList.add("slot-late");
      else if (tr.done) slot.classList.add("slot-done");
      else if (isFuture) slot.classList.add("slot-future");
      else slot.classList.add("slot-missed");

      slot.innerHTML =
        '<div class="slot-day">' + dayOfWeek(tr.date) + "</div>" +
        '<div class="slot-date">' + new Date(tr.date).getDate() + "</div>" +
        '<div class="slot-month">' + shortDate(tr.date).split(" ")[1] + "</div>" +
        (tr.done && tr.late ? '<div class="slot-late-icon">🔥</div>' : "") +
        (tr.done && !tr.late ? '<div class="slot-check">✓</div>' : "");

      // Double tap
      if (AppState.can("canMarkTraining")) {
        slot.addEventListener("click", function () {
          const now = Date.now();
          if (_lastTapDate === tr.date && now - _lastTapTime < 400) {
            // double tap
            if (isFuture) {
              toast("Дата ещё не наступила", "warn");
            } else {
              const newDone = !tr.done;
              Api.markTraining(st.id, tr.date, newDone).then(function (res) {
                if (res.ok) {
                  tr.done = newDone;
                  st.progress = res.progress;
                  _renderFull();
                  toast(newDone ? "Тренировка отмечена" : "Отметка снята", "success");
                } else if (res.error === "future_date") {
                  toast("Дата ещё не наступила", "warn");
                }
              });
            }
            _lastTapTime = 0;
            _lastTapDate = null;
          } else {
            _lastTapTime = now;
            _lastTapDate = tr.date;
          }
        });
      }

      carousel.appendChild(slot);
    });
    wrap.appendChild(carousel);

    _container.appendChild(wrap);

    // Back
    wrap.querySelector(".sd-back-btn").addEventListener("click", function () {
      _view = "roster";
      _hideBackButton();
      _renderFull();
    });
  }

  // ─── PACKAGES ───
  function _renderPackages() {
    const st = AppState.get("students").find(s => s.id === _selectedStudentId);
    if (!st) { _view = "roster"; _renderFull(); return; }

    const wrap = document.createElement("div");
    wrap.className = "kuto-packages";

    // Top bar
    const topBar = document.createElement("div");
    topBar.className = "sd-topbar";
    topBar.innerHTML =
      '<button class="sd-back-btn">← Состав</button>' +
      (AppState.can("canAddPackage") ? '<button class="sd-add-pkg-btn">+ Добавить пакет</button>' : "");
    wrap.appendChild(topBar);

    // Tabs
    const tabs = document.createElement("div");
    tabs.className = "sd-tabs";
    [
      { key: "student", label: "Ученик" },
      { key: "progress", label: "Прогресс" },
      { key: "packages", label: "Пакеты" },
    ].forEach(function (t) {
      const tb = document.createElement("button");
      tb.className = "sd-tab" + (_view === t.key ? " active" : "");
      tb.textContent = t.label;
      tb.addEventListener("click", function () {
        _view = t.key;
        _renderFull();
      });
      tabs.appendChild(tb);
    });
    wrap.appendChild(tabs);

    // Package card (mock: один пакет = данные ученика)
    const pkCard = document.createElement("div");
    pkCard.className = "pkg-card";

    const paidLabel = st.paid === st.cost ? "Оплата" : (st.paid > 0 ? "Частичная оплата" : "");
    const paymentDate = st.payments.length > 0 ? shortDate(st.payments[0].date) : "";

    pkCard.innerHTML =
      '<div class="pkg-header-row">' +
        '<span class="pkg-title">Пакет №' + st.packageNum + "</span>" +
        '<span class="pkg-type">' + st.packageType + "</span>" +
      "</div>" +
      '<div class="pkg-meta">' +
        (AppState.get("discipline") ? '<div class="pkg-line">Дисциплина: ' + AppState.get("discipline").name + "</div>" : "") +
        '<div class="pkg-line">Период: ' + shortDate(st.activeSince) + " — " + shortDate(st.activeUntil) + "</div>" +
        '<div class="pkg-line val-green">Прогресс: ' + st.progress + "%</div>" +
        '<div class="pkg-line val-yellow">Стоимость: ' + fmt(st.cost) + "</div>" +
        (st.discount > 0 ? '<div class="pkg-line val-green">Скидка: ' + fmt(st.discount) + "</div>" : "") +
        '<div class="pkg-line ' + (st.paid > 0 ? "val-green" : "") + '">Оплачено: ' + fmt(st.paid) +
          (st.paid > 0 && paymentDate ? " (" + paymentDate + ")" : "") + "</div>" +
        '<div class="pkg-line ' + (st.debt > 0 ? "val-red" : "val-green") + '">Долг: ' + fmt(st.debt) + "</div>" +
      "</div>";

    // Dot progress
    const dots = document.createElement("div");
    dots.className = "prog-dots pkg-dots";
    st.trainings.forEach(function (tr) {
      const d = document.createElement("span");
      d.className = "prog-dot";
      if (tr.done && tr.late) d.classList.add("dot-late");
      else if (tr.done) d.classList.add("dot-done");
      else d.classList.add("dot-empty");
      dots.appendChild(d);
    });
    pkCard.appendChild(dots);

    // Payments history
    if (st.payments.length > 0) {
      const payHdr = document.createElement("div");
      payHdr.className = "pkg-pay-title";
      payHdr.textContent = "История оплат";
      pkCard.appendChild(payHdr);

      st.payments.forEach(function (p) {
        const pRow = document.createElement("div");
        pRow.className = "pkg-pay-row";
        pRow.innerHTML =
          '<span class="pkg-pay-type">' + p.type + "</span>" +
          '<span class="pkg-pay-amount">' + fmt(p.amount) + "</span>" +
          '<span class="pkg-pay-date">' + shortDate(p.date) + "</span>" +
          '<span class="pkg-pay-method">' + (p.method === "nalichnaya" ? "Наличная" : "Безналичная") + "</span>";
        pkCard.appendChild(pRow);
      });
    }

    wrap.appendChild(pkCard);
    _container.appendChild(wrap);

    // Listeners
    wrap.querySelector(".sd-back-btn").addEventListener("click", function () {
      _view = "roster";
      _hideBackButton();
      _renderFull();
    });
    const addPkg = wrap.querySelector(".sd-add-pkg-btn");
    if (addPkg) {
      addPkg.addEventListener("click", function () {
        toast("Добавление пакета (интеграция)", "info");
      });
    }
  }

  // ─── ADD STUDENT MODAL ───
  function _onAddStudent() {
    showSheet("Добавить ученика", [
      { label: "Новый", value: "new" },
      { label: "Из списка", value: "list" },
      { label: "Из группы", value: "from_group" },
      { label: "В другую группу", value: "to_group" },
    ], function (item) {
      if (item.value === "new") {
        _showNewStudentForm();
      } else {
        toast(item.label + " — режим (интеграция)", "info");
      }
    });
  }

  function _showNewStudentForm() {
    const overlay = document.getElementById("sheet-overlay");
    const panel = document.getElementById("sheet-panel");
    panel.innerHTML = "";

    const hdr = document.createElement("div");
    hdr.className = "sheet-header";
    hdr.innerHTML = '<span class="sheet-title">Новый ученик</span><span class="sheet-close">✕</span>';
    panel.appendChild(hdr);

    const form = document.createElement("div");
    form.className = "sheet-form";
    form.innerHTML =
      '<div class="sf-field"><label>Фамилия</label><input type="text" id="sf-last" placeholder="Фамилия"></div>' +
      '<div class="sf-field"><label>Имя</label><input type="text" id="sf-first" placeholder="Имя"></div>' +
      '<div class="sf-field"><label>Телефон</label><input type="tel" id="sf-phone" placeholder="+7 ..."></div>' +
      '<div class="sf-field"><label>Дата рождения</label><input type="date" id="sf-bday"></div>' +
      '<div class="sf-field"><label>Пол</label>' +
        '<div class="sf-gender-seg">' +
          '<button class="sf-seg active" data-g="М">М</button>' +
          '<button class="sf-seg" data-g="Ж">Ж</button>' +
        '</div>' +
      '</div>' +
      '<button class="sf-submit">Добавить</button>';
    panel.appendChild(form);

    overlay.classList.remove("hidden");
    panel.classList.remove("hidden");

    // Gender toggle
    form.querySelectorAll(".sf-seg").forEach(function (btn) {
      btn.addEventListener("click", function () {
        form.querySelectorAll(".sf-seg").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // Submit
    form.querySelector(".sf-submit").addEventListener("click", function () {
      toast("Ученик добавлен (mock)", "success");
      overlay.classList.add("hidden");
      panel.classList.add("hidden");
    });

    hdr.querySelector(".sheet-close").addEventListener("click", function () {
      overlay.classList.add("hidden");
      panel.classList.add("hidden");
    });
    overlay.onclick = function () {
      overlay.classList.add("hidden");
      panel.classList.add("hidden");
    };
  }

  // ─── TG BACK BUTTON helpers ───
  function _showBackButton() {
    if (window.Telegram && Telegram.WebApp.BackButton) {
      Telegram.WebApp.BackButton.show();
    }
  }
  function _hideBackButton() {
    if (window.Telegram && Telegram.WebApp.BackButton) {
      Telegram.WebApp.BackButton.hide();
    }
  }

  return { render: render };
})();
