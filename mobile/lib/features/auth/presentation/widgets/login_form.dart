import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import '../../../../core/utils/validators.dart';

/// 登录表单组件
class LoginForm extends HookWidget {
  final Function(String phone, String password) onSubmit;
  final bool isLoading;

  const LoginForm({
    super.key,
    required this.onSubmit,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final phoneController = useTextEditingController();
    final passwordController = useTextEditingController();
    final phoneError = useState<String?>(null);
    final passwordError = useState<String?>(null);
    final formKey = useMemoized(() => GlobalKey<FormState>());

    void validatePhone(String value) {
      if (value.isEmpty) {
        phoneError.value = '请输入手机号';
      } else if (!Validators.isValidPhone(value)) {
        phoneError.value = '请输入正确的手机号';
      } else {
        phoneError.value = null;
      }
    }

    void validatePassword(String value) {
      if (value.isEmpty) {
        passwordError.value = '请输入密码';
      } else if (!Validators.isValidPassword(value)) {
        passwordError.value = '密码长度为6-20位';
      } else {
        passwordError.value = null;
      }
    }

    void handleSubmit() {
      final phone = phoneController.text.trim();
      final password = passwordController.text.trim();

      // 验证手机号
      validatePhone(phone);
      // 验证密码
      validatePassword(password);

      // 如果验证通过，提交表单
      if (phoneError.value == null && passwordError.value == null) {
        onSubmit(phone, password);
      }
    }

    return Form(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 手机号输入框
          TextFormField(
            controller: phoneController,
            keyboardType: TextInputType.phone,
            textInputAction: TextInputAction.next,
            enabled: !isLoading,
            decoration: InputDecoration(
              labelText: '手机号',
              hintText: '请输入手机号',
              prefixIcon: const Icon(Icons.phone_outlined),
              errorText: phoneError.value,
            ),
            onChanged: (value) {
              if (phoneError.value != null) {
                validatePhone(value);
              }
            },
            onFieldSubmitted: (_) {
              FocusScope.of(context).nextFocus();
            },
            validator: (value) {
              if (value == null || value.isEmpty) {
                return '请输入手机号';
              }
              if (!Validators.isValidPhone(value)) {
                return '请输入正确的手机号';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),

          // 密码输入框
          TextFormField(
            controller: passwordController,
            obscureText: true,
            textInputAction: TextInputAction.done,
            enabled: !isLoading,
            decoration: InputDecoration(
              labelText: '密码',
              hintText: '请输入密码',
              prefixIcon: const Icon(Icons.lock_outlined),
              errorText: passwordError.value,
            ),
            onChanged: (value) {
              if (passwordError.value != null) {
                validatePassword(value);
              }
            },
            onFieldSubmitted: (_) {
              handleSubmit();
            },
            validator: (value) {
              if (value == null || value.isEmpty) {
                return '请输入密码';
              }
              if (!Validators.isValidPassword(value)) {
                return '密码长度为6-20位';
              }
              return null;
            },
          ),
          const SizedBox(height: 24),

          // 登录按钮
          ElevatedButton(
            onPressed: isLoading ? null : handleSubmit,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text(
                    '登录',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

