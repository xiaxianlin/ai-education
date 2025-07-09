export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{9,}$/;

export async function validPassword(password: string) {
  if (!password) {
    throw '请输入密码';
  }
  if (password.length <= 8) {
    throw '密码长度必须大于8位';
  }
  if (!/[a-z]/.test(password)) {
    throw '必须包含小写字母';
  }
  if (!/[A-Z]/.test(password)) {
    throw '必须包含大写字母';
  }
  if (!/\d/.test(password)) {
    throw '必须包含数字';
  }
  if (!/[\W_]/.test(password)) {
    throw '必须包含特殊字符';
  }
}
