window.UAFT = window.UAFT || {};

(function(ns){
  const ROLE_CAPABILITIES = {
    student: {
      canViewKuto: true,
      canViewStudentDetails: true,
      canViewPackages: true,
      canViewFinancials: true,
      canEditTraining: false,
      canManagePayments: false,
      canManagePackages: false,
      canManageGroupMembers: false,
      canFreezeExtend: false
    },
    trainer: {
      canViewKuto: true,
      canViewStudentDetails: true,
      canViewPackages: true,
      canViewFinancials: false,
      canEditTraining: true,
      canManagePayments: false,
      canManagePackages: false,
      canManageGroupMembers: false,
      canFreezeExtend: false
    },
    admin: {
      canViewKuto: true,
      canViewStudentDetails: true,
      canViewPackages: true,
      canViewFinancials: false,
      canEditTraining: true,
      canManagePayments: false,
      canManagePackages: true,
      canManageGroupMembers: true,
      canFreezeExtend: true
    },
    director: {
      canViewKuto: true,
      canViewStudentDetails: true,
      canViewPackages: true,
      canViewFinancials: true,
      canEditTraining: true,
      canManagePayments: true,
      canManagePackages: true,
      canManageGroupMembers: true,
      canFreezeExtend: true
    }
  };

  function getRoleCapabilities(role){
    return Object.assign({}, ROLE_CAPABILITIES.student, ROLE_CAPABILITIES[role] || {});
  }

  const state = {
    boot: null,
    route: 'kuto',
    currentUser: null,
    role: 'director',
    permissions: getRoleCapabilities('director'),
    ui: {
      kutoSubView: 'list', // list | student | progress | packages
      selectedStudentId: null,
      selectedPackageIdByStudent: {},
      editUnlocked: false,
      groupSearch: '',
      poolQuery: '',
      poolLetter: 'Все',
      packageScrollByStudent: {},
      progressScrollByStudent: {}
    },
    modal: null
  };

  ns.state = state;
  ns.getRoleCapabilities = getRoleCapabilities;
})(window.UAFT);
