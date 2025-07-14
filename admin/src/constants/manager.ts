export enum ManagerType {
  Admin = 1,
  Audit = 2,
  Data = 3,
}

export const ManagerTypeText: Record<ManagerType, string> = {
  [ManagerType.Admin]: '超级管理员',
  [ManagerType.Audit]: '审核管理员',
  [ManagerType.Data]: '数据管理员',
};

export enum ManagerStatus {
  Forbidden = -1,
  Inactive = 0,
  Active = 1,
}

export const ManagerStatusText: Record<ManagerStatus, string> = {
  [ManagerStatus.Forbidden]: '禁用',
  [ManagerStatus.Inactive]: '未激活',
  [ManagerStatus.Active]: '正常',
};
