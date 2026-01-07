import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { Button, Drawer, Flex, Popconfirm } from 'antd';
import { useState } from 'react';
import { QuestionAnswer } from '../components/QuestionAnswer';
import { QuestionBasicInfo } from '../components/QuestionBasicInfo';
import { QuestionBlanks } from '../components/QuestionBlanks';
import { QuestionOptions } from '../components/QuestionOptions';
import { QuestionStatistics } from '../components/QuestionStatistics';
import { QuestionStem } from '../components/QuestionStem';
import { QuestionSubQuestions } from '../components/QuestionSubQuestions';
import { useQuestionDetailModel } from '../models/page';

export default function MainView() {
  const {
    question,
    loading,
    navigate,
    generatingResources,
    deleting,
    handleGenerateResources,
    handleDelete,
  } = useQuestionDetailModel();
  const [showDataDrawer, setShowDataDrawer] = useState(false);

  if (loading) {
    return <PageContainer loading={loading} />;
  }

  if (!question) {
    return null;
  }

  // 判断是否为复合题
  const isComposite = (question.stem?.sub_questions?.length || 0) > 0;

  return (
    <PageContainer title="题目详情" header={{ onBack: () => navigate(-1) }}>
      <Flex vertical gap={16} style={{ width: '100%' }}>
        <QuestionBasicInfo question={question} />

        <QuestionStatistics question={question} />

        <QuestionStem question={question} />

        <QuestionOptions question={question} />

        <QuestionBlanks blanks={question.blanks} />

        <QuestionAnswer answer={question.answer} explanation={question.explanation} />

        {isComposite && <QuestionSubQuestions subQuestions={question.stem?.sub_questions} />}
      </Flex>
      <FooterToolbar className="page-footer">
        <Flex justify="center" gap={16}>
          <Button size="large" onClick={() => setShowDataDrawer(true)}>
            查看数据
          </Button>
          <Button
            size="large"
            type="primary"
            loading={generatingResources}
            onClick={() => handleGenerateResources()}
          >
            生成资源
          </Button>
          <Button size="large" type="primary" onClick={() => navigate(`/question/form/${question.id}`)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这道题目吗？"
            description="删除后无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete()}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button size="large" danger loading={deleting}>
              删除
            </Button>
          </Popconfirm>
        </Flex>
      </FooterToolbar>

      <Drawer
        title="题目数据"
        placement="right"
        size="large"
        open={showDataDrawer}
        onClose={() => setShowDataDrawer(false)}
        destroyOnHidden
      >
        {question && (
          <pre
            style={{
              padding: '16px',
              backgroundColor: '#fafafa',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              lineHeight: '1.5',
              margin: 0,
            }}
          >
            {JSON.stringify(question, null, 2)}
          </pre>
        )}
      </Drawer>
    </PageContainer>
  );
}
