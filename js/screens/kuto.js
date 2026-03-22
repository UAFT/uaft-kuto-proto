export function initKutoScreen() {

  const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const WEEK = ['ВС','ПН','ВТ','СР','ЧТ','ПТ','СБ'];
  const LETTERS = ['Все','А','Б','В','Г','Д','Е','Ж','З','И','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Э','Ю','Я'];

  const roleCtx = window.__UAFT_ROLE__ || { role: 'director', permissions: {} };
  const perms = {
    canViewKuto: true,
    canManageGroupMembers: true,
    canAddPackage: true,
    canMarkTraining: true,
    canEditStudent: true,
    canViewFinancials: true,
    canFreezePackage: true,
    canExtendPackage: true,
    canEnterPayment: true,
    ...(roleCtx.permissions || {})
  };

  const app = {
    view: 'list',
    discipline: 'Кикбоксинг',
    trainingType: 'Групповая',
    group: 'Группа A',
    trainer: 'Тренер Алексей',
    month: 8,
    year: 2025,
    trainingDateLimit: 12,
    demoTodayIso: '2025-09-20',
    progressScrollByStudent: {},
    query: '',
    poolQuery: '',
    poolLetter: 'Все',
    editUnlocked: false,
    selectedStudentId: 'u2',
    selectedPackageByStudent: {},
    groupLimit: 20,
    groupRhythm: ['ПН','СР','ПТ'],
    groupTotal: 15,
    store: new Map(),
    groupsCatalog: ['Группа A','Группа B','Группа C','Группа D'],
    trainersCatalog: ['Тренер Алексей','Тренер Ирина','Тренер Руслан'],
    studentPool: [
      {id:'sp1', fullName:'Смирнов Егор', phone:'+7 989 000-11-21', dob:'2012-05-03', sex:'М'},
      {id:'sp2', fullName:'Зайцева Полина', phone:'+7 989 000-21-52', dob:'2011-12-19', sex:'Ж'},
      {id:'sp3', fullName:'Кузнецов Максим', phone:'+7 989 000-34-77', dob:'2014-01-27', sex:'М'},
      {id:'sp4', fullName:'Иванов Иван', phone:'+7 989 111-22-33', dob:'2010-09-12', sex:'М'}
    ],
    groupPool: [
      {id:'gp1', fullName:'Лазарев Никита', phone:'+7 989 777-10-10', dob:'2011-03-07', sex:'М'},
      {id:'gp2', fullName:'Тарасова Вера', phone:'+7 989 888-22-22', dob:'2012-08-21', sex:'Ж'}
    ]
  };

  const els = {
    headerSub: document.getElementById('headerSub'),
    headerActions: document.getElementById('headerActions'),
    groupStatsBadge: document.getElementById('groupStatsBadge'),
    globalLockBtn: document.getElementById('globalLockBtn'),
    list: document.getElementById('view-list'),
    student: document.getElementById('view-student'),
    progress: document.getElementById('view-progress'),
    packages: document.getElementById('view-packages'),
    content: document.getElementById('content'),
    sheetBackdrop: document.getElementById('sheetBackdrop'),
    sheet: document.getElementById('sheet'),
    toast: document.getElementById('toast')
  };

  function uid(){ return Math.random().toString(36).slice(2,10); }
  function monthKey(){ return `${app.year}-${String(app.month+1).padStart(2,'0')}`; }
  function initials(name){ return String(name || '').split(' ').filter(Boolean).slice(0,2).map(s => (s[0] || '').toUpperCase()).join(''); }
  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function esc(s){ return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function formatDate(iso){ if(!iso) return '—'; const [y,m,d] = String(iso).split('-'); return y&&m&&d ? `${d}.${m}.${y}` : iso; }
  function addDays(iso, days){ const dt=new Date(iso+'T00:00:00'); dt.setDate(dt.getDate()+days); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; }
  function money(v){ return String(v || 0); }
  function paymentTitle(payments, i){
    if(!payments || !payments.length) return 'Оплата';
    if(payments.length===1){
      const p=payments[0];
      return Number(p.amount||0) >= 0 ? (i===0 && payments.length===1 && Number(p.amount||0)>0 ? 'Оплата' : 'Оплата') : 'Оплата';
    }
    return i===0 ? 'Частичная оплата' : 'Доплата';
  }
  function paidLabel(paid, paidDate){
    return Number(paid||0) > 0 && paidDate ? `Оплачено • ${formatDate(paidDate)}` : 'Оплачено';
  }
  function progressMarkers(student, pkg){
    const total = Number(pkg?.total || 0);
    if(!total) return '';
    const slots = slotsOfPackage(student, pkg.id);
    return `<div class="meter-markers">${Array.from({length: total}).map((_,i)=>{
      const slot=slots[i];
      if(!slot) return `<div class="m-dot empty">${i+1}</div>`;
      const late = isLate(slot.arrival, slot.start);
      return `<div class="m-dot ${late ? 'late' : 'done'}">${i+1}</div>`;
    }).join('')}</div>`;
  }
  function requireUnlocked(msg='Откройте замок'){ if(!perms.canMarkTraining){ showToast('Только просмотр'); return false; } if(app.editUnlocked) return true; showToast(msg); return false; }
  function scrollTop(){ els.content.scrollTop = 0; }
  function firstLetter(name){ return (String(name||'').trim()[0] || '').toUpperCase(); }

  function currentMonthStart(){
    return `${app.year}-${String(app.month+1).padStart(2,'0')}-01`;
  }
  function currentMonthEnd(){
    return `${app.year}-${String(app.month+1).padStart(2,'0')}-29`;
  }

  function contextEntityLabel(){ return app.trainingType === 'Индивидуальная' ? 'Тренер' : 'Группа'; }
  function contextEntityValue(){ return app.trainingType === 'Индивидуальная' ? app.trainer : app.group; }
  function fullContext(){ return `${app.discipline} • ${app.trainingType} • ${contextEntityValue()} • ${MONTHS[app.month]} ${app.year}`; }
  function todayDate(){ return new Date(app.demoTodayIso + 'T00:00:00'); }
  function dateIso(dt){ return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; }
  function isPastTrainingDate(dt){ return dateIso(dt) < app.demoTodayIso; }

  function isLate(arrival, start){ return !!arrival && !!start && String(arrival) > String(start); }

  function pkg(id, number, label, type, total, startDate, activeUntil, price, paid, discount, current=false, open=true, paidDate=null, payments=null){
    const basePayments = payments || (paid > 0 ? [{amount: Number(paid||0), date: (paidDate || startDate), method:'Наличные'}] : []);
    const totalPaid = basePayments.reduce((s,x)=>s+Number(x.amount||0),0);
    return {id, number, label, type, total, startDate, activeUntil, price, paid: totalPaid, discount, current, open, progress:'0', discipline:app.discipline, paidDate: paidDate || startDate, payments: basePayments};
  }

  function createStudent(data){
    const fullName = data.fullName || [data.lastName, data.firstName].filter(Boolean).join(' ').trim() || 'Новый ученик';
    const lastName = data.lastName || (fullName.split(/\s+/)[0] || '');
    const firstName = data.firstName || (fullName.split(/\s+/).slice(1).join(' ') || '');
    const s = {
      id: data.id || uid(),
      lastName,
      firstName,
      fullName,
      phone: data.phone || '',
      dob: data.dob || '',
      sex: data.sex || '—',
      active: data.active !== false,
      frozen: !!data.frozen,
      extendDays: Number(data.extendDays || 0),
      avatarMode: data.avatarMode || 'initials',
      progressSlots: data.progressSlots || {},
      seriesTrainings: Number(data.seriesTrainings || 0),
      streak: Number(data.streak || 0),
      packageHistory: clone(data.packageHistory || []),
      mainPackageId: data.mainPackageId || null,
      monthlyMembership: data.monthlyMembership || monthKey(),
      hadTrial: !!data.hadTrial
    };
    if(!s.packageHistory.length){
      const p = pkg('pkg_'+uid(), 1, 'Блок 8', 'block', 8, currentMonthStart(), currentMonthEnd(), 3000, 0, 0, true, true);
      s.packageHistory.push(p); s.mainPackageId = p.id;
    }
    if(!s.mainPackageId){
      const candidate = s.packageHistory.find(p => p.current) || s.packageHistory[0];
      s.mainPackageId = candidate ? candidate.id : null;
    }
    refreshStudentDerived(s);
    return s;
  }

  function createSeedState(){
    const s1 = createStudent({
      id:'u1', fullName:'Иванов Иван', phone:'+7 989 123-45-67', dob:'2010-04-19', sex:'М',
      seriesTrainings:12, streak:5,
      packageHistory:[
        pkg('p11',1,'Блок 12','block',12,'2025-05-01','2025-05-29',4000,4000,0,false,false),
        pkg('p12',2,'Блок 12','block',12,'2025-06-03','2025-07-01',4000,4000,0,false,false),
        pkg('p13',3,'Блок 8','block',8,'2025-08-01','2025-08-29',3000,3000,0,false,false),
        pkg('p14',4,'Блок 8','block',8,'2025-09-02','2025-09-30',3000,3000,0,true,true)
      ],
      mainPackageId:'p14',
      progressSlots:{
        1:{packageId:'p14', start:'18:30', arrival:'18:24'},
        4:{packageId:'p14', start:'18:30', arrival:'18:29'}
      }
    });
    const s2 = createStudent({
      id:'u2', fullName:'Фролова Анна', phone:'+7 989 222-33-44', dob:'2011-09-08', sex:'Ж',
      seriesTrainings:19, streak:9,
      packageHistory:[
        pkg('p21',7,'Блок 12','block',12,'2025-07-01','2025-07-29',4000,4000,0,false,false),
        pkg('p22',8,'Блок 12','block',12,'2025-08-01','2025-08-29',4000,4000,0,false,false),
        pkg('p23',9,'Блок 12','block',12,'2025-09-01','2025-09-29',4000,0,0,true,true,'2025-09-08',[{amount:2500,date:'2025-09-01',method:'Наличные'},{amount:1000,date:'2025-09-08',method:'Безналичные'}]),
        pkg('p24',10,'Бонус 2','bonus',2,'2025-09-10','2025-09-29',0,0,0,false,true)
      ],
      mainPackageId:'p23',
      progressSlots:{
        0:{packageId:'p23', start:'18:30', arrival:'18:27'},
        1:{packageId:'p23', start:'18:30', arrival:'18:28'},
        2:{packageId:'p23', start:'18:30', arrival:'18:30'},
        3:{packageId:'p23', start:'18:30', arrival:'18:26'},
        4:{packageId:'p23', start:'18:30', arrival:'18:29'},
        5:{packageId:'p23', start:'18:30', arrival:'18:31'},
        6:{packageId:'p24', start:'18:30', arrival:'18:28'},
        7:{packageId:'p23', start:'18:30', arrival:'18:24'},
        8:{packageId:'p23', start:'18:30', arrival:'18:27'}
      }
    });
    const s3 = createStudent({
      id:'u3', fullName:'Петров Пётр', phone:'+7 989 333-44-55', dob:'2013-01-12', sex:'М',
      hadTrial:true, seriesTrainings:1, streak:1,
      packageHistory:[pkg('p31',1,'Пробная','trial',1,'2025-09-03','2025-09-03',0,0,0,true,false)],
      mainPackageId:'p31',
      progressSlots:{2:{packageId:'p31', start:'18:30', arrival:'18:25'}}
    });
    const s4 = createStudent({
      id:'u4', fullName:'Ксенофонтов Андрей', phone:'+7 989 444-55-66', dob:'2012-11-30', sex:'М',
      frozen:true, seriesTrainings:8, streak:0,
      packageHistory:[pkg('p41',12,'Блок 4','block',4,'2025-09-04','2025-10-02',2000,1000,0,true,true)],
      mainPackageId:'p41',
      progressSlots:{0:{packageId:'p41', start:'18:30', arrival:'18:30'},3:{packageId:'p41', start:'18:30', arrival:'18:31'}}
    });
    return { students: [s1,s2,s3,s4] };
  }

  function monthState(){ const key = monthKey(); if(!app.store.has(key)) app.store.set(key, createSeedState()); return app.store.get(key); }
  function students(){ return monthState().students; }
  function activeStudents(){ return students().filter(s => s.active); }
  function getStudent(id){ return students().find(s => s.id === id) || null; }
  function ensureSelected(){
    const cur=getStudent(app.selectedStudentId);
    if(cur && cur.active) return cur;
    const first=activeStudents()[0] || null;
    app.selectedStudentId=first?first.id:null;
    return first;
  }
  function currentStudent(){ return ensureSelected(); }

  function getPackageById(student, id){ return (student.packageHistory || []).find(p => p.id===id) || null; }
  function slotsOfPackage(student, packageId){
    return Object.keys(student.progressSlots || {}).map(Number).sort((a,b)=>a-b).filter(i => student.progressSlots[i] && student.progressSlots[i].packageId===packageId);
  }
  function pkgType(pkg){ return pkg ? pkg.type : 'block'; }
  function openPackages(student){
    return (student.packageHistory || []).filter(p => p.open);
  }
  function hasOpenMainBlock(student){
    return openPackages(student).some(p => p.type==='block' && remainingForPackage(student,p) > 0);
  }
  function remainingForPackage(student, pkg){
    if(!pkg) return 0;
    const used = slotsOfPackage(student, pkg.id).length;
    return Math.max(0, Number(pkg.total || 0) - used);
  }
  function hadTrial(student){
    return !!student.hadTrial || (student.packageHistory || []).some(p => p.type==='trial');
  }
  function currentMainPackage(student){
    return getPackageById(student, student.mainPackageId) || openPackages(student).find(p => p.current) || openPackages(student)[0] || (student.packageHistory || [])[0] || null;
  }
  function selectedProgressPackage(student){
    const selectedId = app.selectedPackageByStudent[student.id];
    let pkg = getPackageById(student, selectedId);
    if(pkg && pkg.open && remainingForPackage(student, pkg) > 0) return pkg;
    pkg = openPackages(student).find(p => remainingForPackage(student, p) > 0) || null;
    app.selectedPackageByStudent[student.id] = pkg ? pkg.id : null;
    return pkg;
  }
  function blockOrdinal(student, idx, pkg){
    const arr = slotsOfPackage(student, pkg.id).filter(i => i <= idx);
    return arr.length;
  }
  function singleOrdinal(student, idx){
    const ids = Object.keys(student.progressSlots || {}).map(Number).sort((a,b)=>a-b);
    return ids.filter(i => i<=idx && pkgType(getPackageById(student, student.progressSlots[i].packageId)) === 'single').length;
  }
  function bonusOrdinal(student, idx){
    const ids = Object.keys(student.progressSlots || {}).map(Number).sort((a,b)=>a-b);
    return ids.filter(i => i<=idx && pkgType(getPackageById(student, student.progressSlots[i].packageId)) === 'bonus').length;
  }

  function progressTextForPackage(student, pkg){
    if(!pkg) return '—';
    const used = slotsOfPackage(student, pkg.id).length;
    if(pkg.type==='trial') return used ? 'P' : '0';
    if(pkg.type==='single') return `${used}/${pkg.total}`;
    if(pkg.type==='bonus') return `${used}/${pkg.total}`;
    return `${used}/${pkg.total}`;
  }

  function computeDebt(pkg){
    return Math.max(0, Number(pkg.price||0) - Number(pkg.discount||0) - Number(pkg.paid||0));
  }
  function packagePercent(pkg){
    const total = Number(pkg?.total || 0);
    const used = Number(pkg?.used || 0);
    return total ? Math.round((used/total)*100) : 0;
  }

  function refreshStudentDerived(student){
    (student.packageHistory || []).forEach(pkg => {
      pkg.used = slotsOfPackage(student, pkg.id).length;
      pkg.debt = computeDebt(pkg);
      pkg.progress = progressTextForPackage(student, pkg);
      if(pkg.used >= Number(pkg.total || 0)) pkg.open = false;
    });
    const main = currentMainPackage(student);
    if(main) student.mainPackageId = main.id;
    student.price = Number(main?.price || 0);
    student.paid = Number(main?.paid || 0);
    student.discount = Number(main?.discount || 0);
    student.debt = Math.max(0, student.price - student.discount - student.paid);
    student.packageNumber = Number(main?.number || 0);
    student.packageLabel = main?.label || '—';
    student.packageTotal = Number(main?.total || 0);
    student.startDate = main?.startDate || '';
    student.activeUntil = main?.activeUntil || '';
    student.paidDate = main?.paidDate || main?.startDate || '';
    student.progress = main ? progressTextForPackage(student, main) : '—';
    if(student.seriesTrainings <= 0) student.seriesTrainings = Object.keys(student.progressSlots || {}).length;
  }

  function statusChip(student, compact=false){
    refreshStudentDerived(student);
    if(student.frozen) return {text: compact ? '❄' : 'Заморожен', cls:'frozen'};
    if(student.debt>0) return {text:'Долг', cls:'debt'};
    return {text:'Активен', cls:'ok'};
  }

  function datesMWF(y,m,count=12){
    const d=new Date(y,m,1);
    while(d.getDay()!==1){ d.setDate(d.getDate()+1); }
    const out=[];
    while(out.length<count){
      if([1,3,5].includes(d.getDay())) out.push(new Date(d));
      d.setDate(d.getDate()+1);
    }
    return out;
  }
  function getSlot(student, idx){ return student.progressSlots[idx] ? clone(student.progressSlots[idx]) : null; }
  function setSlot(student, idx, slot){
    if(!student.progressSlots) student.progressSlots={};
    if(!slot) delete student.progressSlots[idx];
    else student.progressSlots[idx]=slot;
    refreshStudentDerived(student);
  }

  function slotVisual(student, idx){
    const slot = getSlot(student, idx);
    if(!slot) return {cls:'empty', main:'+', sub:''};
    const pkg = getPackageById(student, slot.packageId);
    if(!pkg) return {cls:'empty', main:'?', sub:''};
    if(pkg.type==='block') return {cls:'block', main:`${blockOrdinal(student, idx, pkg)}/${pkg.total}`, sub:`Пакет № ${pkg.number} • ${pkg.label}`};
    if(pkg.type==='trial') return {cls:'trial', main:'П', sub:`Пакет № ${pkg.number} • Пробная`};
    if(pkg.type==='single') return {cls:'single', main:`${singleOrdinal(student, idx)}`, sub:`Пакет № ${pkg.number} • Разовая`};
    if(pkg.type==='bonus') return {cls:'bonus', main:`БОН ${bonusOrdinal(student, idx)}`, sub:`Пакет № ${pkg.number} • ${pkg.label}`};
    return {cls:'empty', main:'+', sub:''};
  }

  function renderHeaderActions(){
    let html = '';
    if(app.view === 'list' && perms.canManageGroupMembers){
      html = `<button class="btn green small" id="headerAddAction">Добавить ученика в группу</button>`;
    } else if(app.view === 'packages' && currentStudent() && perms.canAddPackage){
      html = `<button class="btn green small" id="headerAddAction">Добавить пакет</button>`;
    }
    els.headerActions.innerHTML = html;
    const btn = els.headerActions.querySelector('#headerAddAction');
    if(btn){
      btn.onclick = () => {
        if(app.view === 'list') openAddToGroupSheet();
        else if(app.view === 'packages'){
          const student = currentStudent();
          if(student) openAddPackageSheet(student);
        }
      };
    }
  }

  function render(){
    const act = activeStudents().length;
    els.headerSub.innerHTML = `${esc(fullContext())}<span class="subline">Ритм группы • ${app.groupRhythm.map(esc).join(' • ')}</span>`;
    els.groupStatsBadge.textContent = `${act} / ${app.groupTotal} / ${app.groupLimit}`;
    renderHeaderActions();
    els.globalLockBtn.textContent = app.editUnlocked ? '🔓' : '🔒';
    els.globalLockBtn.classList.toggle('unlocked', app.editUnlocked);
    els.globalLockBtn.style.display = perms.canMarkTraining ? '' : 'none';
    renderList(); renderStudent(); renderProgress(); renderPackages();
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view===app.view));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${app.view}`).classList.add('active');
  }

  function renderList(){
    const rows = activeStudents().filter(s => !app.query || s.fullName.toLowerCase().includes(app.query.toLowerCase()));
    const entityField = app.trainingType === 'Индивидуальная'
      ? `<select id="f-trainer">${app.trainersCatalog.map(t => `<option ${app.trainer===t?'selected':''}>${t}</option>`).join('')}</select>`
      : `<select id="f-group">${app.groupsCatalog.map(g => `<option ${app.group===g?'selected':''}>${g}</option>`).join('')}</select>`;
    els.list.innerHTML = `
      </div>
      <div class="card">
        <div class="context-grid">
          <select id="f-discipline"><option ${app.discipline==='Кикбоксинг'?'selected':''}>Кикбоксинг</option><option ${app.discipline==='Бокс'?'selected':''}>Бокс</option></select>
          <select id="f-type"><option ${app.trainingType==='Групповая'?'selected':''}>Групповая</option><option ${app.trainingType==='Индивидуальная'?'selected':''}>Индивидуальная</option></select>
          ${entityField}
          <select id="f-month">${MONTHS.map((m,i)=>`<option value="${i}" ${app.month===i?'selected':''}>${m}</option>`).join('')}</select>
          <select id="f-year">${[2024,2025,2026,2027].map(y=>`<option value="${y}" ${app.year===y?'selected':''}>${y}</option>`).join('')}</select>
          <input id="f-search" placeholder="Фамилия Имя" value="${esc(app.query)}" />
        </div>
      </div>
      <div class="list-wrap">${rows.map(listRowHtml).join('')}</div>
    `;
    bindList();
  }

  function listRowHtml(student){
    refreshStudentDerived(student);
    const st = statusChip(student, true);
    const selected = student.id === app.selectedStudentId;
    const frozenMark = student.frozen ? `<div class="chip frozen icon-chip" title="Заморожен">❄</div>` : '';
    const stateLabel = student.frozen ? '' : st.text;
    return `
      <article class="row ${selected ? 'selected' : ''}" data-open-student="${student.id}">
        <div class="avatar">${esc(initials(student.fullName))}</div>
        <div class="row-main">
          <div class="fio">${esc(student.fullName)}</div>
          <div class="row-meta">
            <span><b>Пакет № ${student.packageNumber}</b></span>
            <span class="dot">•</span>
            <span>${esc(student.packageLabel)}</span>
            ${stateLabel ? `<span class="dot">•</span><span>${stateLabel}</span>` : ''}
          </div>
          <div class="row-kpis">
            <div>Оплачено: ${student.paid}</div>
            <div>Долг: ${student.debt}</div>
            <div>Прогресс: ${esc(student.progress)}</div>
          </div>
        </div>
        <div class="row-side">
          ${perms.canManageGroupMembers ? `<button class=\"btn tiny danger icon-only\" title=\"Убрать из группы\" aria-label=\"Убрать из группы\" data-remove-from-group=\"${student.id}\">→</button>` : ''}
          ${frozenMark}
        </div>
      </article>
    `;
  }

  function renderStudent(){
    const student = currentStudent();
    if(!student){ els.student.innerHTML = `<div class="card">Сначала выберите ученика</div>`; return; }
    refreshStudentDerived(student);
    const st = statusChip(student);
    const payBtnLabel = student.debt > 0 && student.paid > 0 ? 'Внести доплату' : 'Внести оплату';
    els.student.innerHTML = `
      <div class="card hero">
        <div class="hero-top">
          <button class="hero-avatar" id="avatarBtn">${esc(initials(student.fullName))}</button>
          <div>
            <h2>${esc(student.fullName)}</h2>
            <div class="mini-note">Пакет № ${student.packageNumber} • ${esc(student.packageLabel)}</div>
            <div class="mini-note">Срок действия пакета • ${formatDate(student.startDate)} — ${formatDate(student.activeUntil)}</div>
          </div>
          <button class="lock-btn ${app.editUnlocked ? 'unlocked' : ''}" id="studentLockBtn">${app.editUnlocked ? '🔓' : '🔒'}</button>
        </div>
        <div class="compact-bar">
          <div class="chip ${st.cls}">${st.text}</div>
        </div>
        <div class="facts">
          <div class="fact"><div class="label">Дата начала пакета</div><div class="value">${formatDate(student.startDate)}</div></div>
          <div class="fact"><div class="label">Активен по</div><div class="value">${formatDate(student.activeUntil)}</div></div>
          <div class="fact cost"><div class="label">Стоимость</div><div class="value">${money(student.price)}</div></div>
          <div class="fact"><div class="label">Скидка</div><div class="value">${money(student.discount)}</div></div>
          <div class="fact ${student.paid>0 ? 'ok' : ''}"><div class="label">${paidLabel(student.paid, student.paidDate)}</div><div class="value">${money(student.paid)}</div></div>
          <div class="fact ${student.debt>0 ? 'debt' : 'ok'}"><div class="label">Долг</div><div class="value">${money(student.debt)}</div></div>
          <div class="fact"><div class="label">Прогресс</div><div class="value">${esc(student.progress)}</div></div>
          <div class="fact"><div class="label">Подрядность</div><div class="value">${student.streak}</div></div>
          <div class="fact"><div class="label">Серия</div><div class="value">${student.seriesTrainings}</div></div>
          <div class="fact"><div class="label">Продление</div><div class="value">+${student.extendDays || 0}</div></div>
        </div>
      </div>
      <div class="card">
        <div class="actions">
          ${perms.canFreezePackage ? `<button class="btn small blue" id="btnFreeze">${student.frozen ? 'Снять заморозку' : 'Заморозить'}</button>` : ''}
          ${perms.canExtendPackage ? `<button class="btn small green" id="btnExtend">Продлить пакет +7</button>` : ''}
          ${perms.canEnterPayment ? `<button class="btn small warn" id="btnPayStudent">${payBtnLabel}</button>` : ''}
          ${perms.canManageGroupMembers ? `<button class="btn small danger" id="btnRemoveFromStudent">Убрать из группы</button>` : ''}
        </div>
      </div>
    `;
    bindStudent();
  }

  function renderProgress(){
    const student = currentStudent();
    if(!student){ els.progress.innerHTML = `<div class="card">Сначала выберите ученика</div>`; return; }
    refreshStudentDerived(student);
    const days = datesMWF(app.year, app.month, app.trainingDateLimit);
    const activePkgs = openPackages(student).filter(p => remainingForPackage(student, p) > 0);
    const selected = selectedProgressPackage(student);
    const used = selected ? slotsOfPackage(student, selected.id).length : 0;
    const total = Number(selected?.total || 0);
    const percent = total ? Math.round((used/total)*100) : 0;
    els.progress.innerHTML = `
      <div class="card">
        <div class="progress-head">
          <div class="compact-bar">
            <div class="chip">${esc(student.fullName)}</div>
            <div class="chip">${selected ? `Пакет № ${selected.number}` : `Пакет № ${student.packageNumber}`}</div>
          </div>
          <button class="lock-btn ${app.editUnlocked ? 'unlocked' : ''}" id="progressLockBtn">${app.editUnlocked ? '🔓' : '🔒'}</button>
        </div>
        <div class="package-selector">
          ${activePkgs.map(p => `<button class="pkg-pill ${selected && selected.id===p.id ? 'active' : ''}" data-select-pkg="${p.id}">Пакет № ${p.number} • ${esc(p.label)} • ${remainingForPackage(student,p)}</button>`).join('')}
          ${!activePkgs.length ? `<div class="chip">Нет активных пакетов</div>` : ''}
        </div>
        <div class="progress-meter">
          <div class="progress-meter-head">
            <div class="progress-meter-title">Посещаемость пакета</div>
            <div class="chip">${percent}%</div>
          </div>
          <div class="meter-track"><div class="meter-fill" style="width:${percent}%"></div></div>
          ${selected ? progressMarkers(student, selected) : ''}
        </div>
        <div class="compact-bar"><div class="chip">Ритм группы • ${app.groupRhythm.join(' • ')}</div></div>
        <div class="month-strip" id="progressStrip"><div class="days">${days.map((d,i)=>dayCard(student,d,i)).join('')}</div></div>
      </div>
    `;
    bindProgress();
  }

  function dayCard(student, date, idx){
    const v = slotVisual(student, idx);
    const slot = getSlot(student, idx);
    const missed = !slot && isPastTrainingDate(date);
    const cls = slot ? v.cls : (missed ? 'missed' : 'empty');
    const lateMark = slot && isLate(slot.arrival, slot.start);
    const main = slot ? v.main : (missed ? '●' : '+');
    const sub = slot ? v.sub : (missed ? 'Пропуск' : '');
    return `
      <article class="day-card">
        <div>
          <div class="day-date ${lateMark ? 'lateMark' : ''}">${String(date.getDate()).padStart(2,'0')}.${String(date.getMonth()+1).padStart(2,'0')}</div>
          <div class="day-dow">${WEEK[date.getDay()]}</div>
        </div>
        <button class="slot ${cls}" data-slot-idx="${idx}">
          <div class="mainMark">${main}</div>
          ${sub ? `<div class="slotSub">${sub}</div>` : ''}
        </button>
        <div class="time-meta">
          <div>Старт: ${slot?.start || '18:30'}</div>
          <div class="${slot && isLate(slot.arrival, slot.start) ? 'late' : ''}">Приход: ${slot?.arrival || '—'}${slot && isLate(slot.arrival, slot.start) ? ' 🔥' : ''}</div>
        </div>
      </article>
    `;
  }

  function renderPackages(){
    const student = currentStudent();
    if(!student){ els.packages.innerHTML = `<div class="card">Сначала выберите ученика</div>`; return; }
    refreshStudentDerived(student);
    const history = (student.packageHistory || []).slice().sort((a,b)=>a.number-b.number);
    els.packages.innerHTML = `
      </div>
      <div class="package-list">
        ${history.map(pkgCardHtml).join('')}
      </div>
    `;
    bindPackages();
  }

  function pkgCardHtml(pkg){
    const student = currentStudent();
    const debt = computeDebt(pkg);
    return `
      <article class="package-card" data-open-pkg="${pkg.id}">
        <div class="package-top">
          <div>
            <div class="pkg-title">Пакет № ${pkg.number} • ${esc(pkg.label)}</div>
            <div class="mini-note">${esc(pkg.discipline || app.discipline)} • ${formatDate(pkg.startDate)} — ${formatDate(pkg.activeUntil)}</div>
          </div>
          ${pkg.open ? '<div class="chip ok">Активный</div>' : '<div class="chip">Закрыт</div>'}
        </div>
        <div class="progress-meter">
          <div class="progress-meter-head">
            <div class="progress-meter-title">Прогресс пакета</div>
            <div class="chip">${packagePercent(pkg)}%</div>
          </div>
          <div class="meter-track"><div class="meter-fill" style="width:${packagePercent(pkg)}%"></div></div>
          ${student ? progressMarkers(student, pkg) : ''}
        </div>
        <div class="pkg-meta">
          <div class="chip">Прогресс ${esc(pkg.progress || '0')}</div>
          <div class="chip">Стоимость ${money(pkg.price)}</div>
          <div class="chip ${debt>0 ? 'debt' : 'ok'}">Долг ${money(debt)}</div>
          <div class="chip">Оплачено ${money(pkg.paid)}${Number(pkg.paid||0)>0 && pkg.paidDate ? ' • ' + formatDate(pkg.paidDate) : ''}</div>
          <div class="chip">Скидка ${money(pkg.discount)}</div>
        </div>
      </article>
    `;
  }

  function bindList(){
    const bindIds = ['discipline','type','month','year'];
    bindIds.forEach(k => els.list.querySelector(`#f-${k}`).onchange = applyFilters);
    const entity = app.trainingType === 'Индивидуальная' ? 'trainer' : 'group';
    els.list.querySelector(`#f-${entity}`).onchange = applyFilters;
    els.list.querySelector('#f-search').addEventListener('input', applyFilters);
    els.list.querySelectorAll('[data-open-student]').forEach(row => row.onclick = (e) => {
      if(e.target.closest('button')) return;
      app.selectedStudentId = e.currentTarget.dataset.openStudent;
      app.view = 'student';
      scrollTop();
      render();
    });
    els.list.querySelectorAll('[data-remove-from-group]').forEach(btn => btn.onclick = (e) => {
      e.stopPropagation();
      if(!requireUnlocked()) return;
      const student = getStudent(e.currentTarget.dataset.removeFromGroup);
      if(!student) return;
      confirmAction('Убрать ученика из группы?', () => {
        student.active = false;
        addToGroupPool(student);
        if(app.selectedStudentId === student.id) app.selectedStudentId = activeStudents()[0]?.id || null;
        closeSheet(); render(); showToast('Ученик убран из группы');
      });
    });
  }

  function bindStudent(){
    const student=currentStudent(); if(!student) return;
    els.student.querySelector('#studentLockBtn').onclick = toggleLock;
    els.student.querySelector('#avatarBtn').onclick = openAvatarSheet;
    els.student.querySelector('#btnFreeze').onclick = () => {
      if(!requireUnlocked()) return;
      student.frozen = !student.frozen;
      render(); showToast(student.frozen ? 'Пакет заморожен' : 'Заморозка снята');
    };
    els.student.querySelector('#btnExtend').onclick = () => {
      if(!requireUnlocked()) return;
      student.extendDays = Number(student.extendDays||0) + 7;
      const main = currentMainPackage(student);
      if(main){
        main.activeUntil = addDays(main.activeUntil, 7);
        student.activeUntil = main.activeUntil;
      }
      render(); showToast('Продление пакета: +7 дней');
    };
    els.student.querySelector('#btnPayStudent').onclick = () => {
      if(!requireUnlocked()) return;
      openPaymentSheet(student);
    };
    els.student.querySelector('#btnRemoveFromStudent').onclick = () => {
      if(!requireUnlocked()) return;
      confirmAction('Убрать ученика из группы?', () => {
        student.active = false;
        addToGroupPool(student);
        closeSheet();
        app.view = 'list';
        app.selectedStudentId = activeStudents()[0]?.id || null;
        scrollTop();
        render();
        showToast('Ученик убран из группы');
      });
    };
  }

  function bindProgress(){
    const student=currentStudent(); if(!student) return;
    els.progress.querySelector('#progressLockBtn').onclick = toggleLock;
    els.progress.querySelectorAll('[data-select-pkg]').forEach(btn => btn.onclick = () => {
      app.selectedPackageByStudent[student.id] = btn.dataset.selectPkg;
      render();
    });
    const strip = els.progress.querySelector('#progressStrip');
    if(strip){
      strip.scrollLeft = app.progressScrollByStudent[student.id] || 0;
      strip.addEventListener('scroll', () => { app.progressScrollByStudent[student.id] = strip.scrollLeft; });
    }
    els.progress.querySelectorAll('[data-slot-idx]').forEach(btn => {
      const idx = Number(btn.dataset.slotIdx);
      let sx=0, sy=0, moved=false, pointerId=null, lastTap=0;
      btn.addEventListener('pointerdown', (e) => {
        pointerId = e.pointerId;
        sx = e.clientX; sy = e.clientY; moved = false;
      });
      btn.addEventListener('pointermove', (e) => {
        if(pointerId !== e.pointerId) return;
        if(Math.abs(e.clientX - sx) > 14 || Math.abs(e.clientY - sy) > 14) moved = true;
      });
      const finish = (e) => {
        if(pointerId !== e.pointerId) return;
        pointerId = null;
        if(moved) return;
        const now = Date.now();
        if(now - lastTap < 320){
          lastTap = 0;
          app.progressScrollByStudent[student.id] = strip ? strip.scrollLeft : (app.progressScrollByStudent[student.id] || 0);
          handleProgressToggle(student, idx);
        } else {
          lastTap = now;
          setTimeout(() => { if(lastTap === now) lastTap = 0; }, 340);
        }
      };
      btn.addEventListener('pointerup', finish);
      btn.addEventListener('pointercancel', () => { pointerId = null; moved = false; });
      btn.addEventListener('pointerleave', () => { if(pointerId!==null){ moved = true; } });
      btn.addEventListener('contextmenu', (e) => { e.preventDefault(); });
    });
  }

  function handleProgressToggle(student, idx){
    const date = datesMWF(app.year, app.month, app.trainingDateLimit)[idx];
    const slot = getSlot(student, idx);
    const dtIso = dateIso(date);
    if(dtIso > app.demoTodayIso){
      showToast('Дата ещё не наступила');
      return;
    }
    if(!requireUnlocked()) return;
    if(slot){
      setSlot(student, idx, null);
      render();
      showToast(isPastTrainingDate(date) ? 'Тренировка снята • снова пропуск' : 'Тренировка снята');
      return;
    }
    const pkg = selectedProgressPackage(student);
    if(!pkg){ showToast('Сначала выберите активный пакет'); return; }
    if(remainingForPackage(student, pkg) <= 0){ showToast('Пакет исчерпан'); return; }
    setSlot(student, idx, {packageId: pkg.id, start:'18:30', arrival:''});
    render();
    showToast('Тренировка отмечена');
  }

  function bindPackages(){
    const student=currentStudent(); if(!student) return;
    els.packages.querySelectorAll('[data-open-pkg]').forEach(card => card.onclick = () => openPackageDetails(student, card.dataset.openPkg));
  }

  function applyFilters(){
    app.discipline = els.list.querySelector('#f-discipline').value;
    app.trainingType = els.list.querySelector('#f-type').value;
    if(app.trainingType === 'Индивидуальная'){
      app.trainer = els.list.querySelector('#f-trainer').value;
    } else {
      app.group = els.list.querySelector('#f-group').value;
    }
    app.month = Number(els.list.querySelector('#f-month').value);
    app.year = Number(els.list.querySelector('#f-year').value);
    app.query = els.list.querySelector('#f-search').value.trim();
    monthState(); ensureSelected(); render();
  }

  function toggleLock(){
    app.editUnlocked = !app.editUnlocked;
    render();
  }

  function addToGroupPool(student){
    const exists = app.groupPool.some(x => x.fullName===student.fullName && x.phone===student.phone && x.dob===student.dob);
    if(!exists){
      app.groupPool.unshift({id:'gp_'+uid(), fullName:student.fullName, phone:student.phone, dob:student.dob, sex:student.sex});
    }
  }

  function openAddToGroupSheet(mode='create'){
    setSheet(`
      <div class="sheet-head">
        <div><div class="sheet-title">Добавить ученика в группу</div></div>
        <button class="close" data-close-sheet>×</button>
      </div>
      <div class="segment">
        <button class="btn small ${mode==='create'?'active':''}" data-add-mode="create">Новый</button>
        <button class="btn small ${mode==='pool'?'active':''}" data-add-mode="pool">Из списка</button>
        <button class="btn small ${mode==='group'?'active':''}" data-add-mode="group">Из группы</button>
        <button class="btn small ${mode==='extra'?'active':''}" data-add-mode="extra">В другую группу</button>
      </div>
      <div id="addModeBody"></div>
    `);
    els.sheet.querySelectorAll('[data-add-mode]').forEach(btn => btn.onclick = () => openAddToGroupSheet(btn.dataset.addMode));
    renderAddMode(mode);
  }

  function renderAddMode(mode){
    const body = els.sheet.querySelector('#addModeBody'); if(!body) return;
    if(mode==='create'){
      body.innerHTML = `
        <div class="sheet-group">
          <div class="context-grid">
            <label class="field"><span>Фамилия</span><input id="new-lastname" placeholder="Иванов" /></label>
            <label class="field"><span>Имя</span><input id="new-firstname" placeholder="Иван" /></label>
          </div>
          <div class="context-grid">
            <label class="field"><span>Телефон</span><input id="new-phone" placeholder="+7 ..." /></label>
            <label class="field"><span>Дата рождения</span><input id="new-dob" type="date" /></label>
            <label class="field"><span>Пол</span><input type="hidden" id="new-sex" value="М" /><div class="seg" id="new-sex-seg"><button type="button" class="seg-btn active" data-sex="М">М</button><button type="button" class="seg-btn" data-sex="Ж">Ж</button></div></label>
          </div>
          <button class="btn green" id="save-new-student">Добавить в группу</button>
        </div>`;
      const sexSeg = body.querySelector('#new-sex-seg');
      if(sexSeg){
        sexSeg.querySelectorAll('[data-sex]').forEach(btn => btn.onclick = () => {
          body.querySelector('#new-sex').value = btn.dataset.sex;
          sexSeg.querySelectorAll('[data-sex]').forEach(x => x.classList.toggle('active', x===btn));
        });
      }
      body.querySelector('#save-new-student').onclick = () => {
        if(!requireUnlocked()) return;
        const lastName = body.querySelector('#new-lastname').value.trim();
        const firstName = body.querySelector('#new-firstname').value.trim();
        const phone = body.querySelector('#new-phone').value.trim();
        const dob = body.querySelector('#new-dob').value.trim();
        const sex = body.querySelector('#new-sex').value;
        if(!lastName || !firstName){ showToast('Введите фамилию и имя'); return; }
        const fullName = `${lastName} ${firstName}`.trim();
        const p = pkg('pkg_'+uid(), 1, 'Блок 8', 'block', 8, currentMonthStart(), currentMonthEnd(), 3000, 0, 0, true, true);
        const student = createStudent({lastName, firstName, fullName, phone, dob, sex, packageHistory:[p], mainPackageId:p.id});
        students().push(student);
        app.selectedStudentId = student.id;
        closeSheet(); render(); showToast('Ученик добавлен');
      };
      return;
    }

    if(mode==='pool'){
      const filtered = app.studentPool
        .filter(p => app.poolLetter==='Все' || firstLetter(p.fullName)===app.poolLetter)
        .filter(p => !app.poolQuery || p.fullName.toLowerCase().includes(app.poolQuery.toLowerCase()) || String(p.phone).includes(app.poolQuery));
      body.innerHTML = `
        <div class="sheet-group">
          <input id="pool-search" placeholder="Поиск по ФИО или телефону" value="${esc(app.poolQuery)}" />
          <div class="alpha">${LETTERS.map(l => `<button class="btn tiny ${app.poolLetter===l?'blue':''}" data-letter="${l}">${l}</button>`).join('')}</div>
          <div class="sheet-group">${filtered.map(p => choiceHtmlPool(p)).join('')}</div>
        </div>`;
      body.querySelector('#pool-search').addEventListener('input', (e) => { app.poolQuery=e.target.value.trim(); renderAddMode('pool'); });
      body.querySelectorAll('[data-letter]').forEach(btn => btn.onclick = () => { app.poolLetter=btn.dataset.letter; renderAddMode('pool'); });
      body.querySelectorAll('[data-add-pool]').forEach(btn => btn.onclick = () => {
        if(!requireUnlocked()) return;
        const src=app.studentPool.find(x=>x.id===btn.dataset.addPool); if(!src) return;
        const p = pkg('pkg_'+uid(), 1, 'Блок 8', 'block', 8, currentMonthStart(), currentMonthEnd(), 3000, 0, 0, true, true);
        const student = createStudent({lastName:(src.fullName||'').split(/\s+/)[0]||'', firstName:(src.fullName||'').split(/\s+/).slice(1).join(' '), fullName:src.fullName, phone:src.phone, dob:src.dob, sex:src.sex, packageHistory:[p], mainPackageId:p.id});
        students().push(student); app.selectedStudentId = student.id;
        closeSheet(); render(); showToast('Ученик добавлен');
      });
      return;
    }

    if(mode==='group'){
      body.innerHTML = `<div class="sheet-group">${app.groupPool.map(p => choiceHtmlGroup(p)).join('')}</div>`;
      body.querySelectorAll('[data-add-group]').forEach(btn => btn.onclick = () => {
        if(!requireUnlocked()) return;
        const src=app.groupPool.find(x=>x.id===btn.dataset.addGroup); if(!src) return;
        const p = pkg('pkg_'+uid(), 1, 'Блок 8', 'block', 8, currentMonthStart(), currentMonthEnd(), 3000, 0, 0, true, true);
        const student = createStudent({lastName:(src.fullName||'').split(/\s+/)[0]||'', firstName:(src.fullName||'').split(/\s+/).slice(1).join(' '), fullName:src.fullName, phone:src.phone, dob:src.dob, sex:src.sex, packageHistory:[p], mainPackageId:p.id});
        students().push(student); app.selectedStudentId = student.id;
        closeSheet(); render(); showToast('Ученик добавлен из группы');
      });
      return;
    }

    const chosenStudent = currentStudent() || activeStudents()[0] || null;
    body.innerHTML = `
      <div class="sheet-group">
        ${chosenStudent ? `<div class="choice"><div><div class="name">${esc(chosenStudent.fullName)}</div><div class="meta">Добавление в другую группу</div></div></div>` : `<div class="choice"><div><div class="name">Сначала выберите ученика</div><div class="meta">Откройте ученика из состава, потом вернитесь сюда</div></div></div>`}
        ${app.groupsCatalog.filter(g => g!==app.group).map(g => `
          <div class="choice">
            <div>
              <div class="name">${esc(g)}</div>
              <div class="meta">Добавить в группу</div>
            </div>
            <button class="btn small" data-move-group="${esc(g)}">Выбрать</button>
          </div>
        `).join('')}
      </div>`;
    body.querySelectorAll('[data-move-group]').forEach(btn => btn.onclick = () => {
      const chosenStudent = currentStudent() || activeStudents()[0] || null;
      if(!chosenStudent){ showToast('Сначала выберите ученика'); return; }
      confirmAction(`Добавить «${chosenStudent.fullName}» в группу «${btn.dataset.moveGroup}»?`, () => {
        closeSheet();
        setSheet(`
          <div class="sheet-head">
            <div><div class="sheet-title">Готово</div><div class="sheet-sub">${esc(chosenStudent.fullName)} добавлен в ${esc(btn.dataset.moveGroup)}</div></div>
            <button class="close" data-close-sheet>×</button>
          </div>
          <div class="sheet-group">
            <button class="btn" id="stayHere">Остаться здесь</button>
            <button class="btn blue" id="goThere">Перейти в группу</button>
          </div>
        `);
        els.sheet.querySelector('#stayHere').onclick = closeSheet;
        els.sheet.querySelector('#goThere').onclick = () => {
          app.group = btn.dataset.moveGroup;
          closeSheet();
          render();
          showToast('Группа переключена');
        };
      });
    });
  }

  function choiceHtmlPool(person){
    return `<div class="choice">
      <div>
        <div class="name">${esc(person.fullName)}</div>
        <div class="meta">${esc(person.phone || '—')} • ${formatDate(person.dob)} • ${esc(person.sex || '—')}</div>
      </div>
      <button class="btn small" data-add-pool="${person.id}">Добавить</button>
    </div>`;
  }
  function choiceHtmlGroup(person){
    return `<div class="choice">
      <div>
        <div class="name">${esc(person.fullName)}</div>
        <div class="meta">${esc(person.phone || '—')} • ${formatDate(person.dob)} • ${esc(person.sex || '—')}</div>
      </div>
      <button class="btn small" data-add-group="${person.id}">Добавить</button>
    </div>`;
  }

  function openAvatarSheet(){
    setSheet(`
      <div class="sheet-head"><div><div class="sheet-title">Аватарка</div></div><button class="close" data-close-sheet>×</button></div>
      <div class="sheet-group">
        <button class="btn" id="avatarCamera">Сфотографировать</button>
        <button class="btn" id="avatarGallery">Из галереи</button>
      </div>`);
    els.sheet.querySelector('#avatarCamera').onclick = () => { closeSheet(); showToast('Камера — proto'); };
    els.sheet.querySelector('#avatarGallery').onclick = () => { closeSheet(); showToast('Галерея — proto'); };
  }

  function openPaymentSheet(student){
    const main = currentMainPackage(student);
    const debt = Math.max(0, Number(main?.price||0) - Number(main?.discount||0) - Number(main?.paid||0));
    const title = debt > 0 && Number(main?.paid||0) > 0 ? 'Внести доплату' : 'Внести оплату';
    setSheet(`
      <div class="sheet-head">
        <div><div class="sheet-title">${title}</div><div class="sheet-sub">${esc(student.fullName)} • долг ${debt}</div></div>
        <button class="close" data-close-sheet>×</button>
      </div>
      <div class="sheet-group">
        ${debt>0 ? `<button class="btn warn" id="pay-full-debt">Закрыть долг полностью</button>` : ''}
        <label class="field"><span>Сумма</span><input id="manual-pay" inputmode="numeric" placeholder="Введите сумму" /></label>
        <label class="field"><span>Форма оплаты</span><input type="hidden" id="pay-method" value="Наличные" /><div class="seg" id="pay-method-seg"><button type="button" class="seg-btn active" data-method="Наличные">Наличные</button><button type="button" class="seg-btn" data-method="Безналичные">Безналичные</button></div></label>
        <button class="btn blue" id="pay-manual">Сохранить</button>
      </div>`);
    const methodSeg = els.sheet.querySelector('#pay-method-seg');
    if(methodSeg){
      methodSeg.querySelectorAll('[data-method]').forEach(btn => btn.onclick = () => {
        els.sheet.querySelector('#pay-method').value = btn.dataset.method;
        methodSeg.querySelectorAll('[data-method]').forEach(x => x.classList.toggle('active', x===btn));
      });
    }
    if(debt>0) els.sheet.querySelector('#pay-full-debt').onclick = () => applyPayment(student, debt, els.sheet.querySelector('#pay-method').value);
    els.sheet.querySelector('#pay-manual').onclick = () => applyPayment(student, Number(els.sheet.querySelector('#manual-pay').value||0), els.sheet.querySelector('#pay-method').value);
  }

  function applyPayment(student, amount, method='Наличные'){
    amount = Number(amount||0); if(amount<=0){ showToast('Сумма должна быть больше 0'); return; }
    const main = currentMainPackage(student); if(!main){ showToast('Нет активного пакета'); return; }
    if(!main.payments) main.payments = [];
    main.payments.push({amount, date: app.demoTodayIso, method});
    main.paid = Number(main.paid||0) + amount;
    main.paidDate = app.demoTodayIso;
    refreshStudentDerived(student);
    closeSheet(); render(); showToast(`Оплата: ${amount}`);
  }

  function openAddPackageSheet(student){
    const canTrial = !hadTrial(student);
    setSheet(`
      <div class="sheet-head">
        <div><div class="sheet-title">Добавить пакет</div></div>
        <button class="close" data-close-sheet>×</button>
      </div>
      <div class="sheet-group">
        <div class="context-grid">
          <button class="btn" data-package-add="block4">Блок 4</button>
          <button class="btn" data-package-add="block8">Блок 8</button>
          <button class="btn" data-package-add="block12">Блок 12</button>
          <button class="btn ${canTrial ? '' : 'ghost'}" data-package-add="trial" ${canTrial ? '' : 'disabled'}>Пробная</button>
          <button class="btn" data-package-add="single1">Разовая</button>
          <button class="btn" data-package-add="bonus1">Бонус 1</button>
          <button class="btn" data-package-add="bonus2">Бонус 2</button>
          <button class="btn" data-package-add="bonus4">Бонус 4</button>
        </div>
      </div>
    `);
    els.sheet.querySelectorAll('[data-package-add]').forEach(btn => btn.onclick = () => {
      if(!requireUnlocked()) return;
      addPackageToStudent(student, btn.dataset.packageAdd);
    });
  }

  function nextPackageNumber(student){
    return ((student.packageHistory || []).reduce((m,p) => Math.max(m, Number(p.number||0)), 0)) + 1;
  }

  function addPackageToStudent(student, kind){
    const hasOpenBlock = openPackages(student).some(p => p.type==='block' && remainingForPackage(student,p) > 0);
    if(kind.startsWith('block') && hasOpenBlock){ showToast('Сначала закройте текущий блок'); return; }
    if(kind==='trial' && hadTrial(student)){ showToast('Пробная уже была'); return; }
    if(kind==='single1' && hasOpenBlock){ showToast('Разовая доступна после закрытия блока'); return; }

    let p = null;
    const num = nextPackageNumber(student);
    if(kind==='block4') p = pkg('pkg_'+uid(), num, 'Блок 4', 'block', 4, currentMonthStart(), currentMonthEnd(), 2000, 0, 0, true, true);
    if(kind==='block8') p = pkg('pkg_'+uid(), num, 'Блок 8', 'block', 8, currentMonthStart(), currentMonthEnd(), 3000, 0, 0, true, true);
    if(kind==='block12') p = pkg('pkg_'+uid(), num, 'Блок 12', 'block', 12, currentMonthStart(), currentMonthEnd(), 4000, 0, 0, true, true);
    if(kind==='trial'){ p = pkg('pkg_'+uid(), num, 'Пробная', 'trial', 1, currentMonthStart(), currentMonthStart(), 0, 0, 0, false, true); student.hadTrial = true; }
    if(kind==='single1') p = pkg('pkg_'+uid(), num, 'Разовая', 'single', 1, currentMonthStart(), currentMonthEnd(), 600, 0, 0, false, true);
    if(kind==='bonus1') p = pkg('pkg_'+uid(), num, 'Бонус 1', 'bonus', 1, currentMonthStart(), currentMonthEnd(), 0, 0, 0, false, true);
    if(kind==='bonus2') p = pkg('pkg_'+uid(), num, 'Бонус 2', 'bonus', 2, currentMonthStart(), currentMonthEnd(), 0, 0, 0, false, true);
    if(kind==='bonus4') p = pkg('pkg_'+uid(), num, 'Бонус 4', 'bonus', 4, currentMonthStart(), currentMonthEnd(), 0, 0, 0, false, true);
    if(!p) return;

    student.packageHistory.push(p);
    if(p.type==='block' || p.type==='trial') student.mainPackageId = p.id;
    app.selectedPackageByStudent[student.id] = p.id;
    refreshStudentDerived(student);
    closeSheet();
    render();
    showToast('Пакет добавлен');
  }

  function openSlotSheet(student, idx){ return; }

  function openPackageDetails(student, packageId){
    const pkg = getPackageById(student, packageId);
    if(!pkg) return;
    const slots = slotsOfPackage(student, pkg.id).map(i => ({idx:i, slot:getSlot(student, i)}));
    const debt = computeDebt(pkg);
    setSheet(`
      <div class="sheet-head">
        <div>
          <div class="sheet-title">Пакет № ${pkg.number} • ${esc(pkg.label)}</div>
          <div class="sheet-sub">${esc(pkg.discipline || app.discipline)} • ${formatDate(pkg.startDate)} — ${formatDate(pkg.activeUntil)}</div>
        </div>
        <button class="close" data-close-sheet>×</button>
      </div>
      <div class="progress-meter">
        <div class="progress-meter-head">
          <div class="progress-meter-title">Прогресс пакета</div>
          <div class="chip">${packagePercent(pkg)}%</div>
        </div>
  
      </div>
      <div class="sheet-group">
        <div class="choice"><div><div class="name">Стоимость</div></div><div>${money(pkg.price)}</div></div>
        <div class="choice"><div><div class="name">Оплачено</div>${Number(pkg.paid||0)>0 && pkg.paidDate ? `<div class="meta">${formatDate(pkg.paidDate)}</div>` : ``}</div><div>${money(pkg.paid)}</div></div>
        <div class="choice"><div><div class="name">Скидка</div></div><div>${money(pkg.discount)}</div></div>
        <div class="choice"><div><div class="name">Долг</div></div><div>${money(debt)}</div></div>
        <div class="choice"><div><div class="name">Продление</div></div><div>+${student.extendDays || 0}</div></div>
        <div class="choice"><div><div class="name">Заморозка</div></div><div>${student.frozen ? 'Да' : 'Нет'}</div></div>
      </div>
      <div class="sheet-group">
        ${(pkg.payments && pkg.payments.length) ? pkg.payments.map((pay, i) => `
          <div class="choice">
            <div>
              <div class="name">${paymentTitle(pkg.payments, i)} ${money(pay.amount)}</div>
              <div class="meta">${formatDate(pay.date)} • ${esc(pay.method || '—')}</div>
            </div>
            <div>${money(pay.amount)}</div>
          </div>
        `).join('') : ''}
      </div>
      <div class="sheet-group">
        ${slots.length ? slots.map(({idx,slot}) => `
          <div class="choice">
            <div>
              <div class="name">${String(datesMWF(app.year, app.month, app.trainingDateLimit)[idx].getDate()).padStart(2,'0')}.${String(datesMWF(app.year, app.month, app.trainingDateLimit)[idx].getMonth()+1).padStart(2,'0')}</div>
              <div class="meta">Старт ${esc(slot?.start || '18:30')} • <span class="${slot && isLate(slot.arrival, slot.start) ? 'late' : ''}">Приход ${esc(slot?.arrival || '—')}${slot && isLate(slot.arrival, slot.start) ? ' 🔥' : ''}</span></div>
            </div>
            <div>${esc(slotVisual(student, idx).main)}</div>
          </div>
        `).join('') : `<div class="choice"><div><div class="name">Нет тренировок</div></div></div>`}
      </div>
    `);
  }

  function confirmAction(message, onConfirm){
    setSheet(`
      <div class="sheet-head"><div><div class="sheet-title">Подтверждение</div><div class="sheet-sub">${esc(message)}</div></div><button class="close" data-close-sheet>×</button></div>
      <div class="sheet-group"><button class="btn danger" id="confirmYes">Да</button><button class="btn ghost" id="confirmNo">Отмена</button></div>`);
    els.sheet.querySelector('#confirmYes').onclick = onConfirm;
    els.sheet.querySelector('#confirmNo').onclick = closeSheet;
  }

  function setSheet(html){
    els.sheet.innerHTML = html;
    els.sheetBackdrop.classList.add('show');
    els.sheet.querySelectorAll('[data-close-sheet]').forEach(btn => btn.onclick = closeSheet);
  }
  function closeSheet(){
    els.sheetBackdrop.classList.remove('show');
    els.sheet.innerHTML = '';
  }
  els.sheetBackdrop.addEventListener('click', (e) => { if(e.target === els.sheetBackdrop) closeSheet(); });

  function showToast(text){
    els.toast.textContent = text;
    els.toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => els.toast.classList.remove('show'), 1800);
  }

  function setView(target){
    if((target==='student'||target==='progress'||target==='packages') && !currentStudent()){
      showToast('Сначала выберите ученика');
      return;
    }
    app.view = target;
    scrollTop();
    render();
  }

  document.querySelectorAll('.nav-btn').forEach(btn => btn.onclick = () => setView(btn.dataset.view));
  els.globalLockBtn.onclick = () => { if(!perms.canMarkTraining){ showToast('Только просмотр'); return; } toggleLock(); };

  monthState(); render();

}
