// js/api.js — UAFT KUTO API Layer
// Все вызовы к backend централизованы здесь
// Сейчас — mock-данные, при интеграции заменяются на fetch

window.Api = (function () {
  const BASE_URL = "/api"; // будет заменён на реальный endpoint

  // ─── Mock Data ───
  const MOCK = {
    disciplines: [
      { id: "kb", name: "Кикбоксинг" },
      { id: "box", name: "Бокс" },
      { id: "mma", name: "ММА" },
    ],
    groups: [
      { id: "ga", name: "Группа A", disciplineId: "kb", limit: 20, rhythm: "ПН • СР • ПТ", trainerId: "t1" },
      { id: "gb", name: "Группа Б", disciplineId: "kb", limit: 15, rhythm: "ВТ • ЧТ", trainerId: "t2" },
      { id: "gc", name: "Группа В", disciplineId: "box", limit: 12, rhythm: "ПН • СР • ПТ", trainerId: "t1" },
    ],
    trainers: [
      { id: "t1", name: "Иванов А.С." },
      { id: "t2", name: "Петров В.Н." },
    ],
    students: [
      {
        id: "s1", firstName: "Артём", lastName: "Сидоров", phone: "+7 900 111-22-33",
        birthDate: "2010-03-15", gender: "М", status: "active", avatarColor: "#4CAF50",
        packageNum: 3, block: 1, packageType: "Блоковый 12",
        paid: 12000, debt: 0, progress: 75, cost: 12000, discount: 0,
        activeSince: "2025-08-01", activeUntil: "2025-09-30",
        frozen: false, streak: 4, consistency: 92,
        trainings: [
          { date: "2025-09-01", done: true, late: false },
          { date: "2025-09-03", done: true, late: true },
          { date: "2025-09-05", done: true, late: false },
          { date: "2025-09-08", done: true, late: false },
          { date: "2025-09-10", done: true, late: true },
          { date: "2025-09-12", done: true, late: false },
          { date: "2025-09-15", done: true, late: false },
          { date: "2025-09-17", done: true, late: false },
          { date: "2025-09-19", done: true, late: false },
          { date: "2025-09-22", done: false, late: false },
          { date: "2025-09-24", done: false, late: false },
          { date: "2025-09-26", done: false, late: false },
        ],
        payments: [
          { amount: 12000, date: "2025-08-01", method: "beznalichnaya", type: "Оплата" },
        ],
      },
      {
        id: "s2", firstName: "Мария", lastName: "Козлова", phone: "+7 900 222-33-44",
        birthDate: "2011-07-22", gender: "Ж", status: "active", avatarColor: "#E91E63",
        packageNum: 2, block: 1, packageType: "Блоковый 12",
        paid: 8000, debt: 4000, progress: 50, cost: 12000, discount: 0,
        activeSince: "2025-08-15", activeUntil: "2025-10-15",
        frozen: false, streak: 2, consistency: 78,
        trainings: [
          { date: "2025-09-01", done: true, late: false },
          { date: "2025-09-03", done: true, late: false },
          { date: "2025-09-05", done: false, late: false },
          { date: "2025-09-08", done: true, late: true },
          { date: "2025-09-10", done: true, late: false },
          { date: "2025-09-12", done: true, late: false },
          { date: "2025-09-15", done: false, late: false },
          { date: "2025-09-17", done: false, late: false },
          { date: "2025-09-19", done: false, late: false },
          { date: "2025-09-22", done: false, late: false },
          { date: "2025-09-24", done: false, late: false },
          { date: "2025-09-26", done: false, late: false },
        ],
        payments: [
          { amount: 8000, date: "2025-08-15", method: "nalichnaya", type: "Частичная оплата" },
        ],
      },
      {
        id: "s3", firstName: "Дмитрий", lastName: "Волков", phone: "+7 900 333-44-55",
        birthDate: "2009-11-08", gender: "М", status: "active", avatarColor: "#2196F3",
        packageNum: 1, block: 2, packageType: "Блоковый 12",
        paid: 12000, debt: 0, progress: 33, cost: 12000, discount: 2000,
        activeSince: "2025-09-01", activeUntil: "2025-10-31",
        frozen: true, streak: 0, consistency: 65,
        trainings: [
          { date: "2025-09-01", done: true, late: false },
          { date: "2025-09-03", done: true, late: false },
          { date: "2025-09-05", done: true, late: false },
          { date: "2025-09-08", done: true, late: true },
          { date: "2025-09-10", done: false, late: false },
          { date: "2025-09-12", done: false, late: false },
          { date: "2025-09-15", done: false, late: false },
          { date: "2025-09-17", done: false, late: false },
          { date: "2025-09-19", done: false, late: false },
          { date: "2025-09-22", done: false, late: false },
          { date: "2025-09-24", done: false, late: false },
          { date: "2025-09-26", done: false, late: false },
        ],
        payments: [
          { amount: 10000, date: "2025-09-01", method: "beznalichnaya", type: "Оплата" },
          { amount: 2000, date: "2025-09-10", method: "nalichnaya", type: "Доплата" },
        ],
      },
      {
        id: "s4", firstName: "Елена", lastName: "Абрамова", phone: "+7 900 444-55-66",
        birthDate: "2012-01-30", gender: "Ж", status: "active", avatarColor: "#FF9800",
        packageNum: 1, block: 1, packageType: "Пробная",
        paid: 0, debt: 500, progress: 0, cost: 500, discount: 0,
        activeSince: "2025-09-20", activeUntil: "2025-09-27",
        frozen: false, streak: 0, consistency: 0,
        trainings: [
          { date: "2025-09-22", done: false, late: false },
        ],
        payments: [],
      },
    ],
  };

  // ─── API Methods ───

  async function getRole(tgId) {
    // Mock: всегда director
    return { role: "director", tgId: tgId };
  }

  async function getDisciplines() {
    return MOCK.disciplines;
  }

  async function getGroups(disciplineId) {
    if (!disciplineId) return MOCK.groups;
    return MOCK.groups.filter((g) => g.disciplineId === disciplineId);
  }

  async function getTrainers() {
    return MOCK.trainers;
  }

  async function getStudents(groupId) {
    // Mock: возвращаем всех для любой группы
    return MOCK.students.filter((s) => s.status === "active");
  }

  async function getStudent(studentId) {
    return MOCK.students.find((s) => s.id === studentId) || null;
  }

  async function markTraining(studentId, date, done) {
    const st = MOCK.students.find((s) => s.id === studentId);
    if (!st) return { ok: false, error: "not_found" };
    const tr = st.trainings.find((t) => t.date === date);
    if (!tr) return { ok: false, error: "no_slot" };
    // Проверка будущей даты
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(date) > today) return { ok: false, error: "future_date" };
    tr.done = done;
    // Пересчёт прогресса
    const total = st.trainings.length;
    const completed = st.trainings.filter((t) => t.done).length;
    st.progress = Math.round((completed / total) * 100);
    return { ok: true, progress: st.progress };
  }

  async function addPayment(studentId, amount, method) {
    return { ok: true };
  }

  async function freezePackage(studentId) {
    const st = MOCK.students.find((s) => s.id === studentId);
    if (st) st.frozen = !st.frozen;
    return { ok: true, frozen: st ? st.frozen : false };
  }

  async function extendPackage(studentId, days) {
    return { ok: true };
  }

  async function removeFromGroup(studentId, groupId) {
    const idx = MOCK.students.findIndex((s) => s.id === studentId);
    if (idx !== -1) MOCK.students[idx].status = "removed";
    return { ok: true };
  }

  return {
    getRole,
    getDisciplines,
    getGroups,
    getTrainers,
    getStudents,
    getStudent,
    markTraining,
    addPayment,
    freezePackage,
    extendPackage,
    removeFromGroup,
  };
})();
