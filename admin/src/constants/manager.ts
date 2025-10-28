export enum ManagerType {
  Init = 0,
  System,
  Audit,
  Data,
}

export const ManagerTypeText: Record<ManagerType, string> = {
  [ManagerType.Init]: '超级管理员',
  [ManagerType.System]: '系统管理员',
  [ManagerType.Audit]: '审核管理员',
  [ManagerType.Data]: '数据管理员',
};
