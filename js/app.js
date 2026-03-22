// js/app.js — UAFT KUTO Bootstrap

(async function () {
  // Telegram WebApp init
  if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    const tgId = Telegram.WebApp.initDataUnsafe?.user?.id || null;
    AppState.set("tgId", tgId);
  }

  // Загрузка роли (mock)
  const tgId = AppState.get("tgId");
  const roleData = await Api.getRole(tgId);
  AppState.setRole(roleData.role);

  // Загрузка справочников
  const disciplines = await Api.getDisciplines();
  const trainers = await Api.getTrainers();
  AppState.set({
    disciplines: disciplines,
    trainers: trainers,
    discipline: disciplines[0] || null,
  });

  // Загрузка групп для первой дисциплины
  if (disciplines[0]) {
    const groups = await Api.getGroups(disciplines[0].id);
    AppState.set({ groups: groups, group: groups[0] || null });
  }

  // Загрузка учеников
  const group = AppState.get("group");
  if (group) {
    const students = await Api.getStudents(group.id);
    AppState.set("students", students);
  }

  // Регистрация экранов
  Router.register("kuto", KutoScreen.render);
  Router.register("student-profile", StudentProfileScreen.render);
  Router.register("student-packages", StudentPackagesScreen.render);
  Router.register("event-journal", EventJournalScreen.render);

  // Старт
  Router.navigate("kuto");

  // Telegram BackButton
  if (window.Telegram && Telegram.WebApp.BackButton) {
    Telegram.WebApp.BackButton.onClick(function () {
      if (Router.canGoBack()) {
        Router.back();
      }
    });
  }
})();
