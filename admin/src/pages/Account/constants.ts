export enum AccountType {
  /** 初始管理员 */
  Init = 0,
  /** 超级管理员 */
  Admin = 1,
  /** 普通管理员 */
  Manager = 2,
  /** 数据管理员 */
  Data = 3,
}

export const ACCOUNT_TYPE_MAP: Record<AccountType, string> = {
  [AccountType.Init]: '初始管理员',
  [AccountType.Admin]: '超级管理员',
  [AccountType.Manager]: '普通管理员',
  [AccountType.Data]: '数据管理员',
};
