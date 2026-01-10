export const validators = {
  phone: (value: string) => {
    const reg = /^1[3-9]\d{9}$/;
    if (!value) return "请输入手机号";
    if (!reg.test(value)) return "请输入正确的手机号";
    return null;
  },
  password: (value: string) => {
    if (!value) return "请输入密码";
    if (value.length < 6) return "密码长度不能少于6位";
    return null;
  },
  sanitize: (value: string) => value.trim(),
};
