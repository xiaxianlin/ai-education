import { useMemo } from 'react';
import { Button, Card, Col, Empty, Row, Tag, Tooltip } from 'antd';
import { ModalForm, ProFormSelect } from '@ant-design/pro-components';
import { DeleteOutlined } from '@ant-design/icons';

import { useTextbookManagement } from '../hooks/useTextbookManagement';
import { GRADES } from '@/constants/course';

type TextbookSectionProps = {
  id: string;
};

export function TextbookSection({ id }: TextbookSectionProps) {
  const {
    textbooks,
    allTextbooks,
    loadingTextbooks,
    loadingAllTextbooks,
    profile,
    handleDeleteTextbook,
    visible,
    setVisible,
    form,
    adding,
    handleAddTextbook,
  } = useTextbookManagement(id);

  const options = useMemo(
    () =>
      allTextbooks.map((textbook) => {
        const gradeInfo = GRADES[textbook.grade];
        return {
          label: `${textbook.subject} - ${textbook.version} - ${
            gradeInfo?.grade || textbook.grade
          }年级 - ${textbook.semester}`,
          value: textbook.id,
        };
      }),
    [allTextbooks],
  );

  return (
    <>
      <Card
        title="关联教材"
        loading={loadingTextbooks}
        extra={
          <Button type="primary" onClick={() => setVisible(true)}>
            添加教材
          </Button>
        }
      >
        {textbooks.length > 0 ? (
          <Row gutter={[16, 16]}>
            {textbooks.map((textbook) => {
              const isCurrent = profile?.current_textbook_id === textbook.id;
              const gradeInfo = GRADES[textbook.grade];
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={textbook.id}>
                  <Card
                    hoverable
                    size="small"
                    style={{
                      height: '100%',
                      borderRadius: '8px',
                      border: isCurrent ? '2px solid #1890ff' : '1px solid #f0f0f0',
                      background: isCurrent ? '#e6f7ff' : '#ffffff',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                    }}
                    bodyStyle={{ padding: '12px 12px 10px' }}
                  >
                    <Tooltip title="移除教材">
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          zIndex: 1,
                          cursor: 'pointer',
                        }}
                      >
                        <DeleteOutlined
                          onClick={() => handleDeleteTextbook(textbook.id)}
                          style={{
                            fontSize: '16px',
                            color: '#ff4d4f',
                            opacity: 0.6,
                            transition: 'opacity 0.3s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                        />
                      </span>
                    </Tooltip>

                    <div
                      style={{
                        marginBottom: '8px',
                        paddingRight: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#262626',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                        title={textbook.version}
                      >
                        {textbook.version}
                      </div>
                      {isCurrent && (
                        <Tag
                          color="success"
                          style={{
                            fontSize: '11px',
                            padding: '0 6px',
                            margin: 0,
                            borderRadius: '4px',
                            lineHeight: '20px',
                          }}
                        >
                          当前
                        </Tag>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#8c8c8c',
                      }}
                    >
                      <Tag
                        color="blue"
                        style={{
                          fontSize: '12px',
                          padding: '0 6px',
                          margin: 0,
                          borderRadius: '4px',
                        }}
                      >
                        {textbook.subject}
                      </Tag>
                      <span>{gradeInfo?.grade}</span>
                      <span style={{ color: '#d9d9d9' }}>|</span>
                      <span>{textbook.semester}</span>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: '#bfbfbf', fontSize: '14px' }}>暂无关联教材</span>}
            style={{ padding: '40px 0' }}
          />
        )}
      </Card>

      <ModalForm<{ ids: number[] }>
        width={600}
        form={form}
        open={visible}
        title="批量添加教材"
        onFinish={handleAddTextbook}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            setVisible(false);
            form.resetFields();
          },
        }}
        layout="horizontal"
        size="large"
        labelAlign="left"
        labelCol={{ span: 4 }}
      >
        <div className="pt-3" />
        <ProFormSelect
          name="ids"
          label="教材"
          placeholder={loadingAllTextbooks ? '加载中...' : '请选择教材（可多选）'}
          fieldProps={{
            mode: 'multiple',
            showSearch: true,
            loading: loadingAllTextbooks,
            disabled: loadingAllTextbooks,
            maxTagCount: 'responsive',
          }}
          options={options}
          rules={[{ required: true, message: '请至少选择一个教材' }]}
        />
      </ModalForm>
    </>
  );
}

