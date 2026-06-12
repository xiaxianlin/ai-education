export const ManagerTypeText: Record<ManagerType, string> = {
  0: '系统管理员',
  1: '管理员',
  2: '老师',
};

export const SYSTEM_MANAGER_TYPE = 0 as ManagerType;
export const ADMIN_MANAGER_TYPE = 1 as ManagerType;
export const TEACHER_MANAGER_TYPE = 2 as ManagerType;

export const isAdminManager = (type?: ManagerType) => type === SYSTEM_MANAGER_TYPE || type === ADMIN_MANAGER_TYPE;

export const isTeacherManager = (type?: ManagerType) => type === TEACHER_MANAGER_TYPE;
