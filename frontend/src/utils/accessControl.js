export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  ACCOUNTANT: 'Accountant',
  EMPLOYEE: 'Employee',
}

export const ROLE_GROUPS = {
  allAuthenticated: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.EMPLOYEE],
  companyManagers: [ROLES.ADMIN, ROLES.MANAGER],
  admins: [ROLES.ADMIN],
  reportsAccess: [ROLES.ADMIN, ROLES.MANAGER],
  tasksAccess: [ROLES.ADMIN, ROLES.MANAGER],
  followupsAccess: [ROLES.ADMIN, ROLES.EMPLOYEE],
  trashAccess: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.EMPLOYEE],
}

export const NAV_ACCESS = {
  customers: ROLE_GROUPS.allAuthenticated,
  leads: ROLE_GROUPS.allAuthenticated,
  deals: ROLE_GROUPS.allAuthenticated,
  users: ROLE_GROUPS.admins,
  reports: ROLE_GROUPS.reportsAccess,
  tasks: ROLE_GROUPS.tasksAccess,
  followups: ROLE_GROUPS.followupsAccess,
  billing: ROLE_GROUPS.admins,
  trash: ROLE_GROUPS.trashAccess,
}

export function hasRequiredRole(userRole, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(userRole)
}
