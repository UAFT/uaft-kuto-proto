// js/state.js — UAFT KUTO State Management
// Единый источник состояния приложения

window.AppState = (function () {
  // ─── Роли и capabilities ───
  const ROLE_CAPS = {
    director: {
      canViewFinancials: true,
      canMarkTraining: true,
      canAddPackage: true,
      canAddStudentToGroup: true,
      canRemoveStudentFromGroup: true,
      canFreezePackage: true,
      canExtendPackage: true,
      canOpenStudentProfile: true,
      canOpenJournal: true,
      canEditGroup: true,
      canMakePayment: true,
      canViewAllGroups: true,
    },
    admin: {
      canViewFinancials: true,
      canMarkTraining: true,
      canAddPackage: true,
      canAddStudentToGroup: true,
      canRemoveStudentFromGroup: true,
      canFreezePackage: true,
      canExtendPackage: true,
      canOpenStudentProfile: true,
      canOpenJournal: true,
      canEditGroup: false,
      canMakePayment: true,
      canViewAllGroups: true,
    },
    trainer: {
      canViewFinancials: false,
      canMarkTraining: true,
      canAddPackage: false,
      canAddStudentToGroup: false,
      canRemoveStudentFromGroup: false,
      canFreezePackage: false,
      canExtendPackage: false,
      canOpenStudentProfile: true,
      canOpenJournal: true,
      canEditGroup: false,
      canMakePayment: false,
      canViewAllGroups: false,
    },
    student: {
      canViewFinancials: false,
      canMarkTraining: false,
      canAddPackage: false,
      canAddStudentToGroup: false,
      canRemoveStudentFromGroup: false,
      canFreezePackage: false,
      canExtendPackage: false,
      canOpenStudentProfile: false,
      canOpenJournal: false,
      canEditGroup: false,
      canMakePayment: false,
      canViewAllGroups: false,
    },
  };

  // ─── Состояние ───
  let _state = {
    role: "director", // будет перезаписан из backend
    tgId: null,
    caps: { ...ROLE_CAPS.director },

    // Контекст KUTO
    discipline: null,
    trainingType: "group", // group | individual
    group: null,
    trainer: null,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    searchQuery: "",

    // Данные
    disciplines: [],
    groups: [],
    trainers: [],
    students: [],
    selectedStudent: null,
    selectedPackage: null,

    // UI
    editLocked: true,
  };

  function get(key) {
    return key ? _state[key] : { ..._state };
  }

  function set(key, value) {
    if (typeof key === "object") {
      Object.assign(_state, key);
    } else {
      _state[key] = value;
    }
    // Если меняем роль — пересчитываем capabilities
    if (key === "role" || (typeof key === "object" && key.role)) {
      const r = _state.role;
      _state.caps = { ...(ROLE_CAPS[r] || ROLE_CAPS.student) };
    }
  }

  function can(capability) {
    return !!_state.caps[capability];
  }

  function setRole(role) {
    set("role", role);
  }

  return { get, set, can, setRole, ROLE_CAPS };
})();
