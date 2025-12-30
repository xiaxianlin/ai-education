import { history } from '@ai-education/shared-web';
import { PageContainer } from '@ant-design/pro-components';
import { Col, Modal, Row } from 'antd';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionBar } from '../components/ActionBar';
import { GenerateControl } from '../components/GenerateControl';
import { GeneratingStatus } from '../components/GeneratingStatus';
import { PromptDisplay } from '../components/PromptDisplay';
import { PromptEditModal } from '../components/PromptEditModal';
import { QuestionList } from '../components/QuestionList';
import { QuestionTypeInfo } from '../components/QuestionTypeInfo';
import { useQuestionTypeGenerateModel } from '../models/page';

export default function MainView() {
  const navigate = useNavigate();
  const { loading, questionType, generating, generatedQuestions, hasUnsavedChanges } = useQuestionTypeGenerateModel();
  const pendingNavigationRef = useRef<{ location: string; action: string } | null>(null);

  // 使用 history.block() 拦截路由导航
  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const unblock = history.block((tx) => {
      // 如果当前路径和目标路径相同，允许导航
      if (tx.location.pathname === window.location.pathname) {
        return;
      }

      // 保存待处理的导航信息
      pendingNavigationRef.current = {
        location: tx.location.pathname + tx.location.search + tx.location.hash,
        action: tx.action,
      };

      // 显示确认对话框
      Modal.confirm({
        title: '确认离开',
        content: '您有未保存的题目，确定要离开此页面吗？',
        okText: '确定离开',
        cancelText: '取消',
        onOk: () => {
          // 用户确认离开，取消拦截并重试导航
          unblock();
          tx.retry();
          pendingNavigationRef.current = null;
        },
        onCancel: () => {
          // 用户取消，清除待处理的导航信息
          pendingNavigationRef.current = null;
        },
      });

      // 返回 false 阻止导航
      return false;
    });

    // 清理函数：当组件卸载或 hasUnsavedChanges 变为 false 时，取消拦截
    return () => {
      unblock();
      pendingNavigationRef.current = null;
    };
  }, [hasUnsavedChanges]);

  return (
    <PageContainer
      loading={loading}
      title={`生成题目 - ${questionType?.name || ''}`}
      header={{ onBack: () => navigate(-1) }}
    >
      <Row gutter={16}>
        {/* 左侧面板 */}
        <Col xs={24} lg={8}>
          <QuestionTypeInfo />
          <PromptDisplay />
        </Col>

        {/* 右侧面板 */}
        <Col xs={24} lg={16}>
          <GenerateControl />
          {generating && <GeneratingStatus />}
          {!generating && generatedQuestions.length > 0 && (
            <>
              <QuestionList />
              <ActionBar />
            </>
          )}
        </Col>
      </Row>

      <PromptEditModal />
    </PageContainer>
  );
}
