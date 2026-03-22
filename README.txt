UAFT KUTO Modular v18 — Journal Button Fix + Full Modular Build
================================================================

Структура:
  index.html              — единая точка входа
  js/app.js               — bootstrap + TG WebApp init
  js/router.js            — внутренняя навигация
  js/state.js             — состояние + capability model (role-aware)
  js/api.js               — API layer (mock, готов к backend)
  js/screens/kuto.js      — главный экран KUTO (состав/ученик/прогресс/пакеты)
  js/screens/student-profile.js  — карточка ученика (placeholder)
  js/screens/student-packages.js — пакеты ученика (placeholder)
  js/screens/event-journal.js    — журнал событий (placeholder)
  styles/main.css         — глобальные стили + sheet + toast
  styles/kuto.css         — стили KUTO экранов
  styles/student-profile.css — стили карточки + журнала

Навигация:
  KUTO (состав) → клик на ученика → Ученик / Прогресс / Пакеты (табы)
  KUTO → Журнал событий (кнопка в шапке, правая часть)
  Ученик → Карточка (кнопка "Карточка →")
  Все экраны → назад через ← кнопку

Роли:
  state.js содержит capability model для director/admin/trainer/student
  UI-элементы скрываются по AppState.can("capability")

Backend готовность:
  api.js — все методы async, mock-данные внутри
  Заменить на fetch к реальному endpoint

Размещение кнопки "Журнал событий":
  В правой половине шапки, ниже квоты 4/15/20 и замка
  Цвет: фиолетовый акцент
  Не между шапкой и зелёной кнопкой — внутри шапки
