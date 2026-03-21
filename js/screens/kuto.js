window.UAFT = window.UAFT || {};

(function(ns){
  const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const WEEK = ['ВС','ПН','ВТ','СР','ЧТ','ПТ','СБ'];
  const LETTERS = ['Все','А','Б','В','Г','Д','Е','Ж','З','И','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Э','Ю','Я'];

  function el(id){ return document.getElementById(id); }
  function fmtName(s){ return `${s.lastName} ${s.firstName}`; }
  function money(n){ return `${n}`; }
  function cap(v){ return v == null ? '' : String(v); }
  function parseDate(iso){ const d = new Date(iso + 'T00:00:00'); return d; }
  function isPast(dateIso, todayIso){
    return parseDate(dateIso).getTime() < parseDate(todayIso).getTime();
  }
  function isFuture(dateIso, todayIso){
    return parseDate(dateIso).getTime() > parseDate(todayIso).getTime();
  }
  function dayNum(iso){ return parseDate(iso).getDate(); }
  function dayW(iso){ return WEEK[parseDate(iso).getDay()]; }

  function getBoot(){ return ns.state.boot; }
  function getStudents(){ return getBoot().students; }
  function getActiveStudents(){ return getStudents().filter(s => s.activeInGroup); }
  function getSelectedStudent(){
    const active = getActiveStudents();
    const found = active.find(s => s.id === ns.state.ui.selectedStudentId);
    return found || active[0] || null;
  }
  function getSelectedPackage(student){
    if (!student) return null;
    const chosenId = ns.state.ui.selectedPackageIdByStudent[student.id];
    return student.packages.find(p => p.id === chosenId) || student.packages[0] || null;
  }
  function getProgressSlots(student){
    return getBoot().progress[student.id]?.slots || [];
  }
  function getVisibleStudents(){
    const q = ns.state.ui.groupSearch.trim().toLowerCase();
    let items = getActiveStudents();
    if (!q) return items;
    return items.filter(s => fmtName(s).toLowerCase().includes(q));
  }
  function permissions(){
    return ns.state.permissions;
  }
  function can(action){
    return !!permissions()[action];
  }
  function setSubView(sub){
    ns.state.ui.kutoSubView = sub;
    render();
  }
  function setSelectedStudent(id){
    ns.state.ui.selectedStudentId = id;
    render();
  }

  function showToast(msg){
    let toast = el('app-toast');
    if (!toast){
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function openModal(title, contentHtml){
    const app = el('app');
    let backdrop = el('app-modal');
    if (!backdrop){
      backdrop = document.createElement('div');
      backdrop.id = 'app-modal';
      backdrop.className = 'sheet-backdrop show';
      backdrop.innerHTML = `<div class="sheet"><div class="sheet-head"><div><div class="sheet-title"></div></div><button class="close" type="button">×</button></div><div class="sheet-body"></div></div>`;
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', (e)=>{
        if (e.target.id === 'app-modal' || e.target.classList.contains('close')) closeModal();
      });
    }
    backdrop.querySelector('.sheet-title').textContent = title;
    backdrop.querySelector('.sheet-body').innerHTML = contentHtml;
    backdrop.classList.add('show');
  }
  function closeModal(){
    const backdrop = el('app-modal');
    if (backdrop) backdrop.classList.remove('show');
  }

  function roleBadge(role){
    return `Роль: ${role}`;
  }

  function renderHeader(){
    const ctx = getBoot().context;
    const sub = ctx.trainingType === 'Индивидуальная'
      ? `${ctx.discipline} • ${ctx.trainingType} • ${ctx.trainer} • ${MONTHS[ctx.month]} ${ctx.year}`
      : `${ctx.discipline} • ${ctx.trainingType} • ${ctx.group} • ${MONTHS[ctx.month]} ${ctx.year}`;

    const stats = `${ctx.activeCount}.${ctx.totalInGroup}.${ctx.groupLimit}`;
    const lockText = can('canEditTraining') ? (ns.state.ui.editUnlocked ? '🔓' : '🔒') : '👁';

    return `
      <header class="topbar">
        <div class="title-row">
          <div>
            <h1>KUTO</h1>
            <div class="sub">${sub}</div>
          </div>
          <div class="head-right">
            <div class="badge">${stats}</div>
            <button class="lock-btn ${ns.state.ui.editUnlocked ? 'unlocked' : ''}" id="global-lock-btn" ${can('canEditTraining') ? '' : 'disabled'}>${lockText}</button>
          </div>
        </div>
      </header>
    `;
  }

  function renderContextCard(){
    const ctx = getBoot().context;
    return `
      <section class="card sticky-card">
        <div class="context-grid">
          <label class="field">
            <span>Дисциплина</span>
            <select id="ctx-discipline">
              ${ctx.disciplines.map(x => `<option ${x===ctx.discipline?'selected':''}>${x}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Тип</span>
            <select id="ctx-training-type">
              ${ctx.trainingTypes.map(x => `<option ${x===ctx.trainingType?'selected':''}>${x}</option>`).join('')}
            </select>
          </label>
          <label class="field ${ctx.trainingType === 'Индивидуальная' ? '' : ''}">
            <span>${ctx.trainingType === 'Индивидуальная' ? 'Тренер' : 'Группа'}</span>
            <select id="ctx-group-trainer">
              ${(ctx.trainingType === 'Индивидуальная' ? ctx.trainers : ctx.groups).map(x => `<option ${(ctx.trainingType === 'Индивидуальная' ? x===ctx.trainer : x===ctx.group)?'selected':''}>${x}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Месяц / Год</span>
            <div class="compact-bar">
              <select id="ctx-month">${MONTHS.map((m,i)=>`<option value="${i}" ${i===ctx.month?'selected':''}>${m}</option>`).join('')}</select>
              <input id="ctx-year" value="${ctx.year}" inputmode="numeric" />
            </div>
          </label>
          <label class="field" style="grid-column:1 / -1">
            <span>Поиск ученика</span>
            <input id="group-search" value="${cap(ns.state.ui.groupSearch)}" placeholder="Фамилия или имя" />
          </label>
        </div>
      </section>
    `;
  }

  function studentRow(student){
    const debtChip = student.debt > 0 ? `<span class="chip debt">Долг ${student.debt}</span>` : '';
    const stateChipClass = student.activeStatusLabel === 'Заморожен' ? 'frozen' : (student.debt > 0 ? 'debt' : 'ok');
    const stateChip = `<span class="chip ${stateChipClass}">${student.activeStatusLabel}</span>`;
    return `
      <div class="row ${student.id===ns.state.ui.selectedStudentId?'selected':''}" data-student-row="${student.id}">
        <div class="avatar">${student.avatarLetter}</div>
        <div class="row-main">
          <div class="fio">${fmtName(student)}</div>
          <div class="row-meta">
            <span class="chip activePkg">Пакет № ${student.packageNumber}</span>
            <span class="chip">${student.packageFront}</span>
            ${stateChip}
            ${debtChip}
          </div>
          <div class="row-kpis">
            <div>Оплачено: ${money(student.paid)}</div>
            <div>Долг: ${money(student.debt)}</div>
            <div>Прогресс: ${student.packageUsed}/${student.packageTotal}</div>
            <div>Подрядность: ${student.streak}</div>
          </div>
        </div>
        <div class="row-side">
          ${can('canManageGroupMembers') ? `<button class="btn tiny danger" data-remove-from-group="${student.id}">Убрать из группы</button>` : ''}
        </div>
      </div>
    `;
  }

  function renderListView(){
    const visible = getVisibleStudents();
    const addBtn = can('canManageGroupMembers')
      ? `<button class="btn blue" id="add-student-btn">Добавить ученика в группу</button>`
      : '';
    return `
      ${renderContextCard()}
      <section class="card">
        <div class="toolbar">${addBtn}</div>
      </section>
      <section class="card list-wrap">
        ${visible.map(studentRow).join('')}
      </section>
    `;
  }

  function renderStudentView(){
    const s = getSelectedStudent();
    if (!s) return `<section class="card">Нет активных учеников</section>`;
    const statusChipClass = s.activeStatusLabel === 'Заморожен' ? 'frozen' : (s.debt > 0 ? 'debt' : 'ok');
    const canPayments = can('canManagePayments');
    const canFreeze = can('canFreezeExtend');
    const removeLabel = can('canManageGroupMembers') ? 'Убрать из группы' : '';
    return `
      <section class="card hero">
        <div class="hero-top">
          <button class="hero-avatar" id="avatar-btn">${s.avatarLetter}</button>
          <div>
            <h2>${fmtName(s)}</h2>
            <div class="mini-note">Пакет № ${s.packageNumber} • ${s.packageFront} • <span class="chip ${statusChipClass}">${s.activeStatusLabel}</span></div>
            <div class="mini-note">${getBoot().context.discipline} • ${getBoot().context.trainingType} • ${getBoot().context.group}</div>
          </div>
          <div class="chip">Роль: ${ns.state.role}</div>
        </div>

        <div class="facts">
          <div class="fact"><div class="label">Дата начала пакета</div><div class="value">${s.packageStart}</div></div>
          <div class="fact"><div class="label">Активен по</div><div class="value">${s.activeUntil}</div></div>
          <div class="fact"><div class="label">Стоимость</div><div class="value">${money(s.packagePrice)}</div></div>
          <div class="fact"><div class="label">Скидка</div><div class="value">${money(s.discount)}</div></div>
          <div class="fact"><div class="label">Оплачено</div><div class="value">${money(s.paid)}</div></div>
          <div class="fact"><div class="label">Долг</div><div class="value">${money(s.debt)}</div></div>
          <div class="fact"><div class="label">Прогресс</div><div class="value">${s.packageUsed}/${s.packageTotal}</div></div>
          <div class="fact"><div class="label">Подрядность</div><div class="value">${s.streak}</div></div>
          <div class="fact"><div class="label">Серия</div><div class="value">${s.series}</div></div>
          <div class="fact"><div class="label">Продление</div><div class="value">${s.extensionDays} дн</div></div>
        </div>

        <div class="actions">
          ${canFreeze ? `<button class="btn warn" data-student-freeze="${s.id}">Заморозить</button>` : ''}
          ${canFreeze ? `<button class="btn blue" data-student-extend="${s.id}">Продлить пакет +7</button>` : ''}
          ${canPayments ? `<button class="btn green" data-student-payment="${s.id}">${s.debt > 0 ? 'Внести доплату' : 'Внести оплату'}</button>` : ''}
          ${can('canManageGroupMembers') ? `<button class="btn danger" data-remove-from-group="${s.id}">${removeLabel}</button>` : ''}
        </div>
      </section>
    `;
  }

  function slotClass(slot){
    if (slot.state === 'missed') return 'slot missed';
    if (!slot.label) return 'slot empty';
    if (/^\d+\/\d+$/.test(slot.label)) return 'slot block';
    if (slot.label === 'P') return 'slot trial';
    if (/^БОН/.test(slot.label)) return 'slot bonus';
    return 'slot single';
  }

  function packagePills(student){
    const selected = getSelectedPackage(student);
    return student.packages.map(pkg => {
      const active = selected && pkg.id === selected.id;
      const dim = pkg.progressPercent >= 100 ? 'dim' : '';
      return `<button class="pkg-pill ${active ? 'active':''} ${dim}" data-select-package="${student.id}|${pkg.id}">Пакет № ${pkg.number} • ${pkg.front}</button>`;
    }).join('');
  }

  function progressBar(student){
    const selected = getSelectedPackage(student);
    if (!selected) return '';
    const percent = Math.max(0, Math.min(100, selected.progressPercent || 0));
    return `
      <section class="card progress-meter">
        <div class="progress-meter-head">
          <div class="progress-meter-title">Прогресс пакета</div>
          <div class="badge">${percent}%</div>
        </div>
        <div class="meter-track"><div class="meter-fill" style="width:${percent}%"></div></div>
      </section>
    `;
  }

  function renderProgressView(){
    const student = getSelectedStudent();
    if (!student) return `<section class="card">Нет активных учеников</section>`;
    const slots = getProgressSlots(student);
    const selectedPkg = getSelectedPackage(student);
    return `
      ${progressBar(student)}
      <section class="card">
        <div class="progress-head">
          <div class="pkg-title">${fmtName(student)}</div>
          <div class="compact-bar">
            <span class="chip activePkg">Пакет № ${student.packageNumber}</span>
            <span class="chip">${student.packageFront}</span>
          </div>
        </div>
        <div class="package-selector">${packagePills(student)}</div>
      </section>
      <section class="card month-strip">
        <div class="days">
          ${slots.map(slot => `
            <div class="day-card">
              <div>
                <div class="day-date">${dayNum(slot.date)}</div>
                <div class="day-dow">${dayW(slot.date)}</div>
              </div>
              <div class="${slotClass(slot)}" data-slot="${student.id}|${slot.date}">
                <div class="mainMark">${slot.label || (slot.state === 'missed' ? 'Пропуск' : '+')}</div>
                <div class="slotSub">${slot.packageNumber ? `Пакет № ${slot.packageNumber}` : (selectedPkg ? `Пакет № ${selectedPkg.number}` : 'Выберите пакет')}</div>
                <div class="slotSub">${slot.packageFront || (selectedPkg ? selectedPkg.front : '')}</div>
                <div class="slotSub">${can('canEditTraining') ? (ns.state.ui.editUnlocked ? 'Зажмите для отметки' : 'Откройте замок') : 'Только просмотр'}</div>
              </div>
              ${(slot.start || slot.checkin) ? `<div class="time-meta"><div>Старт ${slot.start || '—'}</div><div>Приход ${slot.checkin || '—'}</div></div>` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderPackagesView(){
    const student = getSelectedStudent();
    if (!student) return `<section class="card">Нет активных учеников</section>`;
    const addBtn = can('canManagePackages') ? `<button class="btn blue" id="add-package-btn">Добавить пакет</button>` : '';
    return `
      <section class="card sticky-card">
        <div class="toolbar">${addBtn}</div>
      </section>
      <section class="card package-list">
        ${student.packages.map(pkg => `
          <div class="package-card" data-package-card="${student.id}|${pkg.id}">
            <div class="package-top">
              <div>
                <div class="pkg-title">Пакет № ${pkg.number} • ${pkg.front}</div>
                <div class="pkg-meta">
                  <span class="chip">${pkg.start} → ${pkg.activeUntil}</span>
                  <span class="chip">Прогресс ${pkg.progressPercent}%</span>
                </div>
              </div>
              <div class="chip ${pkg.debt > 0 ? 'debt' : 'ok'}">${pkg.debt > 0 ? `Долг ${pkg.debt}` : 'Закрыт'}</div>
            </div>
            <div class="row-kpis">
              <div>Стоимость: ${pkg.price}</div>
              <div>Оплачено: ${pkg.paid}</div>
              <div>Скидка: ${pkg.discount}</div>
              <div>Долг: ${pkg.debt}</div>
            </div>
          </div>
        `).join('')}
      </section>
    `;
  }

  function renderBody(){
    const sub = ns.state.ui.kutoSubView;
    if (sub === 'student') return renderStudentView();
    if (sub === 'progress') return renderProgressView();
    if (sub === 'packages') return renderPackagesView();
    return renderListView();
  }

  function renderRoot(){
    const app = el('app');
    app.innerHTML = `
      <div class="app">
        ${renderHeader()}
        <main class="content">${renderBody()}</main>
        <nav class="bottom-nav">
          <div class="bottom-row">
            <button class="nav-btn ${ns.state.ui.kutoSubView === 'list' ? 'active':''}" data-sub-view="list">Состав</button>
            <button class="nav-btn ${ns.state.ui.kutoSubView === 'student' ? 'active':''}" data-sub-view="student">Ученик</button>
            <button class="nav-btn ${ns.state.ui.kutoSubView === 'progress' ? 'active':''}" data-sub-view="progress">Прогресс</button>
            <button class="nav-btn ${ns.state.ui.kutoSubView === 'packages' ? 'active':''}" data-sub-view="packages">Пакеты</button>
          </div>
        </nav>
      </div>
    `;
    bindEvents();
  }

  function bindEvents(){
    const app = el('app');

    const lockBtn = document.getElementById('global-lock-btn');
    if (lockBtn && can('canEditTraining')){
      lockBtn.addEventListener('click', () => {
        ns.state.ui.editUnlocked = !ns.state.ui.editUnlocked;
        render();
      });
    }

    app.querySelectorAll('[data-sub-view]').forEach(btn => {
      btn.addEventListener('click', () => setSubView(btn.getAttribute('data-sub-view')));
    });

    const searchInput = document.getElementById('group-search');
    if (searchInput){
      searchInput.addEventListener('input', (e) => {
        ns.state.ui.groupSearch = e.target.value;
        render();
      });
    }

    app.querySelectorAll('[data-student-row]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('[data-remove-from-group]')) return;
        setSelectedStudent(row.getAttribute('data-student-row'));
        setSubView('student');
      });
    });

    app.querySelectorAll('[data-remove-from-group]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!can('canManageGroupMembers')) return;
        const id = btn.getAttribute('data-remove-from-group');
        const student = getStudents().find(x => x.id === id);
        if (!student) return;
        if (window.confirm(`Убрать ${fmtName(student)} из группы?`)){
          student.activeInGroup = false;
          const active = getActiveStudents();
          const ctx = getBoot().context;
          ctx.activeCount = active.length;
          if (!active.find(s => s.id === ns.state.ui.selectedStudentId)){
            ns.state.ui.selectedStudentId = active[0]?.id || null;
            ns.state.ui.kutoSubView = 'list';
          }
          render();
        }
      });
    });

    const avatarBtn = document.getElementById('avatar-btn');
    if (avatarBtn){
      avatarBtn.addEventListener('click', () => {
        openModal('Аватар', `
          <div class="sheet-group">
            <button class="btn blue">Сфотографировать</button>
            <button class="btn">Из галереи</button>
          </div>
        `);
      });
    }

    const addStudentBtn = document.getElementById('add-student-btn');
    if (addStudentBtn){
      addStudentBtn.addEventListener('click', () => {
        openModal('Добавить ученика в группу', `
          <div class="sheet-group">
            <button class="btn blue" id="sheet-new-student">Новый</button>
            <button class="btn" id="sheet-from-list">Из списка</button>
            <button class="btn" id="sheet-from-group">Из группы</button>
            <button class="btn" id="sheet-second-group">В другую группу</button>
          </div>
        `);
        setTimeout(bindStudentModal, 0);
      });
    }

    app.querySelectorAll('[data-student-freeze]').forEach(btn => btn.addEventListener('click', ()=>showToast('Заморозка: backend action')));
    app.querySelectorAll('[data-student-extend]').forEach(btn => btn.addEventListener('click', ()=>showToast('Продление +7: backend action')));
    app.querySelectorAll('[data-student-payment]').forEach(btn => btn.addEventListener('click', ()=>showToast('Оплата: backend action')));

    app.querySelectorAll('[data-select-package]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [studentId, pkgId] = btn.getAttribute('data-select-package').split('|');
        ns.state.ui.selectedPackageIdByStudent[studentId] = pkgId;
        render();
      });
    });

    let holdTimer = null;
    app.querySelectorAll('[data-slot]').forEach(slotEl => {
      const [studentId, date] = slotEl.getAttribute('data-slot').split('|');
      const begin = () => {
        clearTimeout(holdTimer);
        holdTimer = setTimeout(() => toggleSlot(studentId, date), 550);
      };
      const cancel = () => {
        clearTimeout(holdTimer);
      };

      slotEl.addEventListener('mousedown', begin);
      slotEl.addEventListener('mouseup', cancel);
      slotEl.addEventListener('mouseleave', cancel);
      slotEl.addEventListener('touchstart', begin, {passive:true});
      slotEl.addEventListener('touchend', cancel);
      slotEl.addEventListener('touchcancel', cancel);

      slotEl.addEventListener('click', () => {
        const student = getStudents().find(s => s.id === studentId);
        const slot = getProgressSlots(student).find(x => x.date === date);
        const title = `${fmtName(student)} • ${date}`;
        const details = `
          <div class="sheet-group">
            <div class="choice"><div><div class="name">${slot.label || 'Пустой слот'}</div><div class="meta">${slot.packageNumber ? `Пакет № ${slot.packageNumber}` : 'Пакет не выбран'}</div></div></div>
            <div class="choice"><div><div class="name">Старт</div><div class="meta">${slot.start || '—'}</div></div></div>
            <div class="choice"><div><div class="name">Приход</div><div class="meta">${slot.checkin || '—'}</div></div></div>
          </div>
        `;
        openModal(title, details);
      });
    });

    const addPackageBtn = document.getElementById('add-package-btn');
    if (addPackageBtn){
      addPackageBtn.addEventListener('click', () => {
        openModal('Добавить пакет', `
          <div class="sheet-group">
            <button class="btn">Блок 4</button>
            <button class="btn">Блок 8</button>
            <button class="btn">Блок 12</button>
            <button class="btn warn">Бонус 1</button>
            <button class="btn warn">Бонус 2</button>
            <button class="btn">Разовая</button>
          </div>
        `);
      });
    }

    app.querySelectorAll('[data-package-card]').forEach(card => {
      card.addEventListener('click', () => {
        const [studentId, pkgId] = card.getAttribute('data-package-card').split('|');
        const student = getStudents().find(s => s.id === studentId);
        const pkg = student?.packages.find(p => p.id === pkgId);
        if (!student || !pkg) return;
        const slots = getProgressSlots(student).filter(s => s.packageId === pkgId);
        openModal(`Пакет № ${pkg.number} • ${pkg.front}`, `
          <div class="sheet-group">
            <div class="choice"><div><div class="name">Период</div><div class="meta">${pkg.start} → ${pkg.activeUntil}</div></div></div>
            <div class="choice"><div><div class="name">Стоимость / Оплачено / Долг</div><div class="meta">${pkg.price} / ${pkg.paid} / ${pkg.debt}</div></div></div>
            <div class="choice"><div><div class="name">Скидка</div><div class="meta">${pkg.discount}</div></div></div>
            <div class="choice"><div><div class="name">Прогресс</div><div class="meta">${pkg.progressPercent}%</div></div></div>
            <div class="choice"><div><div class="name">Заморозка / Продление</div><div class="meta">${pkg.freeze} / ${pkg.extend}</div></div></div>
            <div class="sheet-title" style="font-size:18px;margin-top:6px;">Тренировочные даты</div>
            ${slots.length ? slots.map(s => `<div class="choice"><div><div class="name">${s.date}</div><div class="meta">${s.label} • старт ${s.start || '—'} • приход ${s.checkin || '—'}</div></div></div>`).join('') : '<div class="choice"><div><div class="name">Нет тренировок</div></div></div>'}
          </div>
        `);
      });
    });
  }

  function bindStudentModal(){
    const newBtn = document.getElementById('sheet-new-student');
    const listBtn = document.getElementById('sheet-from-list');
    const groupBtn = document.getElementById('sheet-from-group');
    const secondBtn = document.getElementById('sheet-second-group');

    if (newBtn){
      newBtn.addEventListener('click', () => {
        openModal('Новый ученик', `
          <div class="sheet-group">
            <label class="field"><span>Фамилия</span><input placeholder="Иванов" /></label>
            <label class="field"><span>Имя</span><input placeholder="Иван" /></label>
            <label class="field"><span>Телефон</span><input placeholder="+7 ..." /></label>
            <label class="field"><span>Дата рождения</span><input type="date" /></label>
            <label class="field"><span>Пол</span><select><option>М</option><option>Ж</option></select></label>
            <button class="btn blue">Создать и добавить в группу</button>
          </div>
        `);
      });
    }
    if (listBtn){
      listBtn.addEventListener('click', () => {
        const pool = getBoot().studentPool;
        openModal('Из списка', `
          <div class="sheet-group">
            <input id="pool-search-inline" placeholder="Поиск по фамилии / имени" />
            <div class="alpha">${LETTERS.map(l => `<button class="btn tiny">${l}</button>`).join('')}</div>
            ${pool.map(p => `<div class="choice"><div><div class="name">${p.lastName} ${p.firstName}</div><div class="meta">${p.phone} • ${p.dob} • ${p.sex}</div></div><button class="btn tiny blue">Добавить</button></div>`).join('')}
          </div>
        `);
      });
    }
    if (groupBtn){
      groupBtn.addEventListener('click', () => {
        const pool = getBoot().groupPool;
        openModal('Из группы', `
          <div class="sheet-group">
            ${pool.map(p => `<div class="choice"><div><div class="name">${p.lastName} ${p.firstName}</div><div class="meta">${p.phone} • ${p.dob} • ${p.sex}</div></div><button class="btn tiny blue">Вернуть</button></div>`).join('')}
          </div>
        `);
      });
    }
    if (secondBtn){
      secondBtn.addEventListener('click', () => {
        const groups = getBoot().context.groups;
        openModal('В другую группу', `
          <div class="sheet-group">
            ${groups.map(g => `<div class="choice"><div><div class="name">${g}</div><div class="meta">Добавить ученика в ещё одну группу</div></div><button class="btn tiny blue">Выбрать</button></div>`).join('')}
          </div>
        `);
      });
    }
  }

  function toggleSlot(studentId, date){
    if (!can('canEditTraining')){
      showToast('Только просмотр');
      return;
    }
    if (!ns.state.ui.editUnlocked){
      showToast('Откройте замок');
      return;
    }

    const boot = getBoot();
    const student = getStudents().find(s => s.id === studentId);
    const slot = getProgressSlots(student).find(x => x.date === date);
    if (!slot) return;

    if (isFuture(date, boot.today)){
      showToast('Дата ещё не наступила');
      return;
    }

    const selectedPkg = getSelectedPackage(student);
    if (!selectedPkg){
      showToast('Сначала выберите пакет');
      return;
    }

    if (slot.state === 'marked' || slot.label){
      slot.label = '';
      slot.packageId = '';
      slot.packageNumber = null;
      slot.packageFront = '';
      slot.start = '';
      slot.checkin = '';
      slot.state = isPast(date, boot.today) ? 'missed' : 'empty';
      showToast('Тренировка снята');
    } else {
      const nextValue = getNextPackageMark(student, selectedPkg);
      slot.label = nextValue.label;
      slot.packageId = selectedPkg.id;
      slot.packageNumber = selectedPkg.number;
      slot.packageFront = selectedPkg.front;
      slot.start = '18:30';
      slot.checkin = '18:28';
      slot.state = 'marked';
      showToast('Тренировка отмечена');
    }
    render();
  }

  function getNextPackageMark(student, pkg){
    const slots = getProgressSlots(student).filter(x => x.packageId === pkg.id && x.label);
    const count = slots.length + 1;
    if (pkg.kind === 'trial') return { label: 'P' };
    if (pkg.kind === 'bonus') return { label: `БОН ${count}` };
    if (pkg.kind === 'single') return { label: String(count) };
    return { label: `${count}/${pkg.total}` };
  }

  function render(){
    renderRoot();
  }

  ns.screens = ns.screens || {};
  ns.screens.kuto = { render };
})(window.UAFT);
