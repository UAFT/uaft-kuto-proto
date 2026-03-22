export const appState = {
  bootstrapped: false,
  currentScreen: 'kuto',
  auth: null,
  permissions: null,
};

export function permissionsForRole(role) {
  const table = {
    student: {
      canViewKuto: true,
      canManageGroupMembers: false,
      canAddPackage: false,
      canMarkTraining: false,
      canEditStudent: false,
      canViewFinancials: true,
      canFreezePackage: false,
      canExtendPackage: false,
      canEnterPayment: false,
    },
    trainer: {
      canViewKuto: true,
      canManageGroupMembers: false,
      canAddPackage: false,
      canMarkTraining: true,
      canEditStudent: false,
      canViewFinancials: false,
      canFreezePackage: false,
      canExtendPackage: false,
      canEnterPayment: false,
    },
    admin: {
      canViewKuto: true,
      canManageGroupMembers: true,
      canAddPackage: true,
      canMarkTraining: true,
      canEditStudent: true,
      canViewFinancials: false,
      canFreezePackage: true,
      canExtendPackage: true,
      canEnterPayment: false,
    },
    director: {
      canViewKuto: true,
      canManageGroupMembers: true,
      canAddPackage: true,
      canMarkTraining: true,
      canEditStudent: true,
      canViewFinancials: true,
      canFreezePackage: true,
      canExtendPackage: true,
      canEnterPayment: true,
    },
  };
  return table[role] || table.director;
}

export function setAuth(auth) {
  appState.auth = auth;
  appState.permissions = auth.permissions;
  appState.bootstrapped = true;
}

export function setScreen(screen) {
  appState.currentScreen = screen;
}
