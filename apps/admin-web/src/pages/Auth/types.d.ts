// 确保全局类型可用
declare global {
  /**
   * 登录模型
   */
  interface LoginRequest {
    username?: string;
    password?: string;
  }

  /**
   * 修改密码模型
   */
  interface ModifyPasswordRequest {
    origin?: string;
    password?: string;
  }

  /**
   * 创建管理员模型
   */
  interface CreateManagerRequest {
    username: string;
    type: ManagerType;
  }

  /**
   * 更新管理员请求
   */
  interface UpdateManagerRequest {
    status?: number;
    type?: ManagerType;
  }
}

export {};
