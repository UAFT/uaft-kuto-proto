UAFT KUTO modular v1

Что внутри:
- index.html — единая точка входа mini-app
- js/app.js — bootstrap
- js/router.js — навигация
- js/api.js — demo API bootstrap (потом заменяется на живой backend)
- js/state.js — app state + role/capabilities
- js/screens/kuto.js — текущий экран KUTO
- js/screens/student-profile.js — placeholder
- js/screens/student-packages.js — placeholder
- js/screens/event-journal.js — placeholder
- styles/main.css
- styles/kuto.css
- styles/student-profile.css

Как проверить роли:
- ?role=student
- ?role=trainer
- ?role=admin
- ?role=director

Примеры:
- /?role=student
- /?role=trainer

Важно:
Текущая role-aware логика реализована на frontend как демонстрация.
Backend-проверки прав должны остаться источником истины.
