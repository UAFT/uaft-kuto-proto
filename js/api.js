window.UAFT = window.UAFT || {};

(function(ns){
  const params = new URLSearchParams(window.location.search);
  const roleFromQuery = (params.get('role') || 'director').toLowerCase();

  function iso(dateStr){ return dateStr; }

  function buildDemoData(){
    return {
      today: '2025-09-08',
      context: {
        discipline: 'Кикбоксинг',
        trainingType: 'Групповая',
        group: 'Группа A',
        trainer: 'Тренер Алексей',
        month: 8,
        year: 2025,
        activeCount: 4,
        totalInGroup: 15,
        groupLimit: 20,
        dateLimit: 12,
        disciplines: ['Кикбоксинг','Бокс','K1'],
        trainingTypes: ['Групповая','Индивидуальная'],
        groups: ['Группа A','Группа B','Группа C'],
        trainers: ['Тренер Алексей','Тренер Ирина','Тренер Руслан']
      },
      currentUser: {
        tgId: '669329243',
        displayName: roleFromQuery.toUpperCase(),
        role: roleFromQuery
      },
      students: [
        {
          id: 'u1',
          lastName: 'Иванов',
          firstName: 'Иван',
          sex: 'М',
          activeInGroup: true,
          activeStatusLabel: 'Активен',
          packageNumber: 4,
          packageFront: 'Блок 8',
          packageKind: 'block',
          packageTotal: 8,
          packageUsed: 3,
          packagePrice: 4000,
          paid: 2500,
          discount: 0,
          debt: 1500,
          packageStart: '2025-09-01',
          activeUntil: '2025-09-29',
          streak: 3,
          series: 7,
          extensionDays: 0,
          freezeDays: 0,
          avatarLetter: 'И',
          trainer: 'Тренер Алексей',
          group: 'Группа A',
          phone: '+7 989 111-22-33',
          dob: '2010-09-12',
          packages: [
            {id:'pkg-u1-4', number:4, front:'Блок 8', kind:'block', total:8, used:3, price:4000, paid:2500, discount:0, debt:1500, start:'2025-09-01', activeUntil:'2025-09-29', progressPercent:37, freeze:'—', extend:'+0'},
            {id:'pkg-u1-3', number:3, front:'Блок 12', kind:'block', total:12, used:12, price:4500, paid:4500, discount:0, debt:0, start:'2025-08-01', activeUntil:'2025-08-29', progressPercent:100, freeze:'—', extend:'+0'}
          ]
        },
        {
          id: 'u2',
          lastName: 'Фролова',
          firstName: 'Анна',
          sex: 'Ж',
          activeInGroup: true,
          activeStatusLabel: 'Активен',
          packageNumber: 9,
          packageFront: 'Блок 12',
          packageKind: 'block',
          packageTotal: 12,
          packageUsed: 7,
          packagePrice: 4500,
          paid: 4500,
          discount: 0,
          debt: 0,
          packageStart: '2025-09-01',
          activeUntil: '2025-09-29',
          streak: 4,
          series: 11,
          extensionDays: 0,
          freezeDays: 0,
          avatarLetter: 'Ф',
          trainer: 'Тренер Алексей',
          group: 'Группа A',
          phone: '+7 989 234-56-78',
          dob: '2011-11-05',
          packages: [
            {id:'pkg-u2-9', number:9, front:'Блок 12', kind:'block', total:12, used:7, price:4500, paid:4500, discount:0, debt:0, start:'2025-09-01', activeUntil:'2025-09-29', progressPercent:58, freeze:'—', extend:'+0'},
            {id:'pkg-u2-10', number:10, front:'Бонус 2', kind:'bonus', total:2, used:0, price:0, paid:0, discount:0, debt:0, start:'2025-09-05', activeUntil:'2025-09-29', progressPercent:0, freeze:'—', extend:'+0'}
          ]
        },
        {
          id: 'u3',
          lastName: 'Сидоров',
          firstName: 'Пётр',
          sex: 'М',
          activeInGroup: true,
          activeStatusLabel: 'Долг',
          packageNumber: 7,
          packageFront: 'Блок 4',
          packageKind: 'block',
          packageTotal: 4,
          packageUsed: 2,
          packagePrice: 2500,
          paid: 1000,
          discount: 0,
          debt: 1500,
          packageStart: '2025-09-01',
          activeUntil: '2025-09-29',
          streak: 1,
          series: 3,
          extensionDays: 0,
          freezeDays: 0,
          avatarLetter: 'С',
          trainer: 'Тренер Алексей',
          group: 'Группа A',
          phone: '+7 989 000-11-22',
          dob: '2012-03-19',
          packages: [
            {id:'pkg-u3-7', number:7, front:'Блок 4', kind:'block', total:4, used:2, price:2500, paid:1000, discount:0, debt:1500, start:'2025-09-01', activeUntil:'2025-09-29', progressPercent:50, freeze:'—', extend:'+0'}
          ]
        },
        {
          id: 'u4',
          lastName: 'Козлова',
          firstName: 'Мира',
          sex: 'Ж',
          activeInGroup: true,
          activeStatusLabel: 'Заморожен',
          packageNumber: 5,
          packageFront: 'Блок 8',
          packageKind: 'block',
          packageTotal: 8,
          packageUsed: 1,
          packagePrice: 4000,
          paid: 4000,
          discount: 0,
          debt: 0,
          packageStart: '2025-09-01',
          activeUntil: '2025-10-06',
          streak: 1,
          series: 2,
          extensionDays: 7,
          freezeDays: 7,
          avatarLetter: 'К',
          trainer: 'Тренер Алексей',
          group: 'Группа A',
          phone: '+7 989 000-77-88',
          dob: '2013-07-22',
          packages: [
            {id:'pkg-u4-5', number:5, front:'Блок 8', kind:'block', total:8, used:1, price:4000, paid:4000, discount:0, debt:0, start:'2025-09-01', activeUntil:'2025-10-06', progressPercent:12, freeze:'7 дн', extend:'+7'}
          ]
        },
        {
          id: 'u5',
          lastName: 'Романова',
          firstName: 'Вера',
          sex: 'Ж',
          activeInGroup: false,
          activeStatusLabel: 'Неактивен',
          packageNumber: 2,
          packageFront: 'Блок 8',
          packageKind: 'block',
          packageTotal: 8,
          packageUsed: 0,
          packagePrice: 4000,
          paid: 0,
          discount: 0,
          debt: 4000,
          packageStart: '2025-07-01',
          activeUntil: '2025-07-29',
          streak: 0,
          series: 0,
          extensionDays: 0,
          freezeDays: 0,
          avatarLetter: 'Р',
          trainer: 'Тренер Алексей',
          group: 'Группа A',
          phone: '+7 989 555-66-77',
          dob: '2011-04-16',
          packages: []
        }
      ],
      studentPool: [
        {id:'sp1', lastName:'Смирнов', firstName:'Егор', phone:'+7 989 000-11-21', dob:'2012-05-03', sex:'М'},
        {id:'sp2', lastName:'Зайцева', firstName:'Полина', phone:'+7 989 000-21-52', dob:'2011-12-19', sex:'Ж'},
        {id:'sp3', lastName:'Кузнецов', firstName:'Максим', phone:'+7 989 000-34-77', dob:'2014-01-27', sex:'М'},
        {id:'sp4', lastName:'Иванов', firstName:'Иван', phone:'+7 989 111-22-33', dob:'2010-09-12', sex:'М'}
      ],
      groupPool: [
        {id:'gp1', lastName:'Лазарев', firstName:'Никита', phone:'+7 989 777-10-10', dob:'2011-03-07', sex:'М'},
        {id:'gp2', lastName:'Тарасова', firstName:'Вера', phone:'+7 989 888-22-22', dob:'2012-08-21', sex:'Ж'}
      ],
      progress: {
        u1: {
          slots: [
            {date:'2025-09-01', label:'1/8', packageId:'pkg-u1-4', packageNumber:4, packageFront:'Блок 8', state:'marked', start:'18:30', checkin:'18:29'},
            {date:'2025-09-03', label:'2/8', packageId:'pkg-u1-4', packageNumber:4, packageFront:'Блок 8', state:'marked', start:'18:30', checkin:'18:32'},
            {date:'2025-09-05', label:'', state:'missed'},
            {date:'2025-09-08', label:'3/8', packageId:'pkg-u1-4', packageNumber:4, packageFront:'Блок 8', state:'marked', start:'18:30', checkin:'18:28'},
            {date:'2025-09-10', label:'', state:'empty'},
            {date:'2025-09-12', label:'', state:'empty'},
            {date:'2025-09-15', label:'', state:'empty'},
            {date:'2025-09-17', label:'', state:'empty'},
            {date:'2025-09-19', label:'', state:'empty'},
            {date:'2025-09-22', label:'', state:'empty'},
            {date:'2025-09-24', label:'', state:'empty'},
            {date:'2025-09-26', label:'', state:'empty'}
          ]
        },
        u2: {
          slots: [
            {date:'2025-09-01', label:'1/12', packageId:'pkg-u2-9', packageNumber:9, packageFront:'Блок 12', state:'marked', start:'18:30', checkin:'18:28'},
            {date:'2025-09-03', label:'2/12', packageId:'pkg-u2-9', packageNumber:9, packageFront:'Блок 12', state:'marked', start:'18:30', checkin:'18:30'},
            {date:'2025-09-05', label:'3/12', packageId:'pkg-u2-9', packageNumber:9, packageFront:'Блок 12', state:'marked', start:'18:30', checkin:'18:26'},
            {date:'2025-09-08', label:'4/12', packageId:'pkg-u2-9', packageNumber:9, packageFront:'Блок 12', state:'marked', start:'18:30', checkin:'18:27'},
            {date:'2025-09-10', label:'', state:'empty'},
            {date:'2025-09-12', label:'', state:'empty'},
            {date:'2025-09-15', label:'', state:'empty'},
            {date:'2025-09-17', label:'', state:'empty'},
            {date:'2025-09-19', label:'', state:'empty'},
            {date:'2025-09-22', label:'', state:'empty'},
            {date:'2025-09-24', label:'', state:'empty'},
            {date:'2025-09-26', label:'', state:'empty'}
          ]
        },
        u3: {
          slots: [
            {date:'2025-09-01', label:'1/4', packageId:'pkg-u3-7', packageNumber:7, packageFront:'Блок 4', state:'marked', start:'18:30', checkin:'18:35'},
            {date:'2025-09-03', label:'', state:'missed'},
            {date:'2025-09-05', label:'2/4', packageId:'pkg-u3-7', packageNumber:7, packageFront:'Блок 4', state:'marked', start:'18:30', checkin:'18:25'},
            {date:'2025-09-08', label:'', state:'empty'},
            {date:'2025-09-10', label:'', state:'empty'},
            {date:'2025-09-12', label:'', state:'empty'},
            {date:'2025-09-15', label:'', state:'empty'},
            {date:'2025-09-17', label:'', state:'empty'},
            {date:'2025-09-19', label:'', state:'empty'},
            {date:'2025-09-22', label:'', state:'empty'},
            {date:'2025-09-24', label:'', state:'empty'},
            {date:'2025-09-26', label:'', state:'empty'}
          ]
        },
        u4: {
          slots: [
            {date:'2025-09-01', label:'1/8', packageId:'pkg-u4-5', packageNumber:5, packageFront:'Блок 8', state:'marked', start:'18:30', checkin:'18:31'},
            {date:'2025-09-03', label:'', state:'missed'},
            {date:'2025-09-05', label:'', state:'missed'},
            {date:'2025-09-08', label:'', state:'empty'},
            {date:'2025-09-10', label:'', state:'empty'},
            {date:'2025-09-12', label:'', state:'empty'},
            {date:'2025-09-15', label:'', state:'empty'},
            {date:'2025-09-17', label:'', state:'empty'},
            {date:'2025-09-19', label:'', state:'empty'},
            {date:'2025-09-22', label:'', state:'empty'},
            {date:'2025-09-24', label:'', state:'empty'},
            {date:'2025-09-26', label:'', state:'empty'}
          ]
        }
      }
    };
  }

  async function bootstrap(){
    // Здесь потом будет реальный handshake с backend / Telegram initData.
    const boot = buildDemoData();
    return Promise.resolve(boot);
  }

  ns.api = {
    bootstrap
  };
})(window.UAFT);
