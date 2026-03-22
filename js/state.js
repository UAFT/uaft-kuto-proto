
export const ROLE_CAPABILITIES = {
  student: {
    canViewKuto: true,
    canMarkTraining: false,
    canAddPackage: false,
    canAddStudentToGroup: false,
    canManageGroupMembership: false,
    canTakePayments: false,
    canFreezePackage: false,
    canExtendPackage: false,
  },
  trainer: {
    canViewKuto: true,
    canMarkTraining: true,
    canAddPackage: false,
    canAddStudentToGroup: false,
    canManageGroupMembership: false,
    canTakePayments: false,
    canFreezePackage: false,
    canExtendPackage: false,
  },
  admin: {
    canViewKuto: true,
    canMarkTraining: true,
    canAddPackage: true,
    canAddStudentToGroup: true,
    canManageGroupMembership: true,
    canTakePayments: false,
    canFreezePackage: true,
    canExtendPackage: true,
  },
  director: {
    canViewKuto: true,
    canMarkTraining: true,
    canAddPackage: true,
    canAddStudentToGroup: true,
    canManageGroupMembership: true,
    canTakePayments: true,
    canFreezePackage: true,
    canExtendPackage: true,
  }
};

export const appState = {
  route: 'kuto',
  role: 'director',
  permissions: ROLE_CAPABILITIES.director,
  boot: null,
};

export function setBootstrap(boot) {
  appState.boot = boot;
  appState.role = boot.role;
  appState.permissions = boot.permissions;
}
