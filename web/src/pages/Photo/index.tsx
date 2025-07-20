import React, { useState, useRef } from 'react';
import { Card, Button, Upload, message, Spin, List, Typography, Tag, Modal } from 'antd';
import { CameraOutlined, UploadOutlined, SearchOutlined, BookOutlined, BulbOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;

// 模拟搜题结果数据
const mockSearchResults = [
  {
    id: 1,
    question: '计算：(3x + 2)(x - 1) = ?',
    subject: '数学',
    grade: '初二',
    difficulty: '中等',
    answer: '3x² - x - 2',
    steps: [
      '使用分配律展开',
      '(3x + 2)(x - 1) = 3x(x - 1) + 2(x - 1)',
      '= 3x² - 3x + 2x - 2',
      '= 3x² - x - 2'
    ],
    similarQuestions: [
      { id: 11, question: '计算：(2x + 1)(x - 3) = ?' },
      { id: 12, question: '计算：(4x - 1)(x + 2) = ?' },
      { id: 13, question: '计算：(x + 3)(2x - 1) = ?' }
    ]
  },
  {
    id: 2,
    question: 'What is the past tense of "go"?',
    subject: '英语',
    grade: '初一',
    difficulty: '简单',
    answer: 'went',
    explanation: '"go"是不规则动词，其过去式为"went"，过去分词为"gone"。',
    examples: [
      'I go to school every day. (一般现在时)',
      'I went to school yesterday. (一般过去时)',
      'I have gone to school. (现在完成时)'
    ],
    similarQuestions: [
      { id: 21, question: 'What is the past tense of "come"?' },
      { id: 22, question: 'What is the past tense of "see"?' },
      { id: 23, question: 'What is the past tense of "do"?' }
    ]
  }
];

export default function PhotoPage() {
  const [uploading, setUploading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    setUploading(true);
    
    // 模拟上传和识别过程
    setTimeout(() => {
      setUploading(false);
      // 随机返回一个搜题结果
      const randomResult = mockSearchResults[Math.floor(Math.random() * mockSearchResults.length)];
      setSearchResults([randomResult]);
      message.success('题目识别成功！');
    }, 2000);
    
    return false; // 阻止默认上传
  };

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const showDetail = (result) => {
    setSelectedResult(result);
    setDetailVisible(true);
  };

  const generateSimilarQuestions = (result) => {
    message.info('正在生成相似题目...');
    // 这里可以调用后端API生成相似题目
  };

  return (
    <PageContainer
      title="拍照搜题"
      subTitle="拍照或上传图片，快速获取题目解答"
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* 上传区域 */}
        <Card 
          title="上传题目图片"
          style={{ marginBottom: 24 }}
        >
          <div style={{ textAlign: 'center' }}>
            <Dragger
              accept="image/*"
              beforeUpload={handleUpload}
              showUploadList={false}
              style={{ marginBottom: 16 }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
              <p className="ant-upload-hint">支持 JPG、PNG、GIF 格式图片</p>
            </Dragger>
            
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Button 
                type="primary" 
                icon={<CameraOutlined />} 
                size="large"
                onClick={openCamera}
              >
                拍照上传
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,camera"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleCameraCapture}
              />
            </div>
          </div>
        </Card>

        {/* 加载状态 */}
        {uploading && (
          <Card style={{ textAlign: 'center', marginBottom: 24 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>正在识别题目，请稍候...</Text>
            </div>
          </Card>
        )}

        {/* 搜索结果 */}
        {searchResults.length > 0 && (
          <Card title="搜题结果" style={{ marginBottom: 24 }}>
            <List
              dataSource={searchResults}
              renderItem={result => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      icon={<SearchOutlined />}
                      onClick={() => showDetail(result)}
                    >
                      查看详解
                    </Button>,
                    <Button 
                      type="link" 
                      icon={<BulbOutlined />}
                      onClick={() => generateSimilarQuestions(result)}
                    >
                      生成相似题
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<BookOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                    title={
                      <div>
                        {result.question}
                        <div style={{ marginTop: 4 }}>
                          <Tag color="blue">{result.subject}</Tag>
                          <Tag color="green">{result.grade}</Tag>
                          <Tag color={result.difficulty === '简单' ? 'green' : result.difficulty === '中等' ? 'orange' : 'red'}>
                            {result.difficulty}
                          </Tag>
                        </div>
                      </div>
                    }
                    description={
                      <div>
                        <Text strong>答案：</Text>
                        <Text code>{result.answer}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* 使用说明 */}
        <Card title="使用说明">
          <List
            size="small"
            dataSource={[
              '1. 确保题目图片清晰，文字完整可见',
              '2. 支持数学、英语等多学科题目识别',
              '3. 可以拍照或从相册选择图片上传',
              '4. 系统会自动识别题目并提供详细解答',
              '5. 点击"生成相似题"可获得更多练习题目'
            ]}
            renderItem={item => <List.Item>{item}</List.Item>}
          />
        </Card>
      </div>

      {/* 详解模态框 */}
      <Modal
        title="题目详解"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="similar" icon={<BulbOutlined />} onClick={() => generateSimilarQuestions(selectedResult)}>
            生成相似题
          </Button>,
          <Button key="close" type="primary" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedResult && (
          <div>
            <Title level={4}>题目</Title>
            <Paragraph>{selectedResult.question}</Paragraph>
            
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">{selectedResult.subject}</Tag>
              <Tag color="green">{selectedResult.grade}</Tag>
              <Tag color={selectedResult.difficulty === '简单' ? 'green' : selectedResult.difficulty === '中等' ? 'orange' : 'red'}>
                {selectedResult.difficulty}
              </Tag>
            </div>

            <Title level={4}>答案</Title>
            <Paragraph>
              <Text code style={{ fontSize: 16 }}>{selectedResult.answer}</Text>
            </Paragraph>

            {selectedResult.steps && (
              <>
                <Title level={4}>解题步骤</Title>
                <List
                  size="small"
                  dataSource={selectedResult.steps}
                  renderItem={(step, index) => (
                    <List.Item>
                      <Text>步骤 {index + 1}：{step}</Text>
                    </List.Item>
                  )}
                />
              </>
            )}

            {selectedResult.explanation && (
              <>
                <Title level={4}>解析</Title>
                <Paragraph>{selectedResult.explanation}</Paragraph>
              </>
            )}

            {selectedResult.examples && (
              <>
                <Title level={4}>例句</Title>
                <List
                  size="small"
                  dataSource={selectedResult.examples}
                  renderItem={example => (
                    <List.Item>
                      <Text>{example}</Text>
                    </List.Item>
                  )}
                />
              </>
            )}

            {selectedResult.similarQuestions && (
              <>
                <Title level={4}>相似题目</Title>
                <List
                  size="small"
                  dataSource={selectedResult.similarQuestions}
                  renderItem={similar => (
                    <List.Item>
                      <Button type="link" style={{ padding: 0, height: 'auto' }}>
                        {similar.question}
                      </Button>
                    </List.Item>
                  )}
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}