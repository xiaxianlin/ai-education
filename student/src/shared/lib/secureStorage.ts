/**
 * 安全存储工具类
 * 使用 sessionStorage 替代 localStorage，降低 XSS 攻击风险
 * 注意：理想情况下应该使用 HttpOnly Cookie，这需要后端配合
 */
export class SecureStorage {
  private static readonly TOKEN_KEY = '_t';

  /**
   * 设置 Token
   * 使用 sessionStorage 而不是 localStorage，关闭标签页后自动清除
   */
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to set token:', error);
    }
  }

  /**
   * 获取 Token
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  /**
   * 移除 Token
   */
  static removeToken(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  /**
   * 检查是否有 Token
   */
  static hasToken(): boolean {
    return this.getToken() !== null;
  }
}

