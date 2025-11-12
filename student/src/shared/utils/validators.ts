/**
 * 输入验证工具函数
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validators = {
  /**
   * 验证手机号
   */
  phone: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, error: '请输入手机号' };
    }
    if (!/^1[3-9]\d{9}$/.test(value)) {
      return { valid: false, error: '手机号格式不正确' };
    }
    return { valid: true };
  },

  /**
   * 验证密码
   */
  password: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, error: '请输入密码' };
    }
    if (value.length < 6) {
      return { valid: false, error: '密码至少6位' };
    }
    if (value.length > 20) {
      return { valid: false, error: '密码最多20位' };
    }
    return { valid: true };
  },

  /**
   * 防止 XSS 攻击 - 转义 HTML 特殊字符
   * 注意：如果使用 React，通常不需要手动转义，React 会自动处理
   * 这里主要用于发送到服务器的数据
   */
  sanitize: (value: string): string => {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
};

