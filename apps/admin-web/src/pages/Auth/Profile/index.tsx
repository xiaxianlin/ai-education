import { ManagerTypeText } from '@/constants/manager';
import { apiClient } from '@/lib/api';
import { useInitialStateModel } from '@/models/initialState';
import { validPassword } from '@/utils/validation';
import { KeyOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Button, Card, Descriptions, Form, Input, message, Space, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { clearState, manager } = useInitialStateModel();

  const { runAsync: modifyPassword, loading: modifying } = useRequest(AuthApi.modifyPassword, {
    manual: true,
    ready: !!manager?.id,
    onSuccess: () => {
      message.success('密码修改成功，请重新登录');
      apiClient.removeToken();
      clearState();
      navigate('/login', { replace: true });
    },
  });

  const [form] = Form.useForm();

  return (
    <PageContainer ghost header={{ title: '个人中心' }}>
      <div className="flex flex-col gap-6 max-w-[800px]">
        {/* 个人信息卡片 */}
        <Card
          title={
            <Space>
              <UserOutlined />
              账号信息
            </Space>
          }
          bordered={false}
          className="shadow-sm"
        >
          <Descriptions column={1} labelStyle={{ width: 100 }}>
            <Descriptions.Item label="账号名称">
              <span className="font-medium text-lg text-[#1a1a1a]">{manager?.username}</span>
            </Descriptions.Item>
            <Descriptions.Item label="账号角色">
              <Tag color="orange" className="px-3 py-0.5 rounded-full border-0 font-medium">
                {manager?.type !== undefined ? ManagerTypeText[manager.type] : '-'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color="success" className="px-3 py-0.5 rounded-full border-0 font-medium">
                正常
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 修改密码卡片 */}
        <Card
          title={
            <Space>
              <SafetyCertificateOutlined />
              安全设置
            </Space>
          }
          bordered={false}
          className="shadow-sm"
        >
          <div className="mb-6 flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
            <KeyOutlined className="text-orange-500 text-lg mt-0.5" />
            <div>
              <div className="font-medium text-orange-900">修改密码</div>
              <div className="text-orange-700 text-sm mt-0.5">
                为了保障您的账户安全，建议定期修改登录密码。修改成功后，系统将自动登出，请使用新密码重新登录。
              </div>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            size="large"
            autoComplete="off"
            onFinish={async (values) => {
              await modifyPassword(values);
            }}
            className="max-w-[400px]"
          >
            <Form.Item
              label="旧密码"
              name="origin"
              rules={[
                { required: true, message: '请输入旧密码' },
                () => ({ validator: (_, value) => validPassword(value) }),
              ]}
            >
              <Input.Password prefix={<KeyOutlined className="text-gray-400" />} placeholder="请输入旧密码" />
            </Form.Item>

            <Form.Item
              label="新密码"
              name="password"
              rules={[
                { required: true, message: '请输入新密码' },
                () => ({ validator: (_, value) => validPassword(value) }),
              ]}
            >
              <Input.Password
                prefix={<SafetyCertificateOutlined className="text-gray-400" />}
                placeholder="请输入新密码"
              />
            </Form.Item>

            <Form.Item
              label="确认新密码"
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: '请再次输入新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<SafetyCertificateOutlined className="text-gray-400" />}
                placeholder="请再次输入新密码"
              />
            </Form.Item>

            <Form.Item className="mb-0 mt-8">
              <Button type="primary" htmlType="submit" loading={modifying} block>
                立即修改
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </PageContainer>
  );
}
