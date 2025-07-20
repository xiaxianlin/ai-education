import React, { useState } from 'react';
import { Card, Button, List, Tag, Progress, Modal, Radio, Input, message } from 'antd';
import { BookOutlined, PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';

const { TextArea } = Input;

// 模拟数据
const mathChapters = [
  {
    id: 1,
    title: '第一章 数与代数',
    progress: 85,
    sections: [
      { id: 11, title: '1.1 整数加减法', completed: true, questionCount: 20 },
      { id: 12, title: '1.2 分数运算', completed: true, questionCount: 25 },
      { id: 13, title: '1.3 小数运算', completed: false, questionCount: 18 },
    ]
  },
  {
    id: 2,
    title: '第二章 图形与几何',
    progress: 45,
    sections: [
      { id: 21, title: '2.1 平面图形', completed: true, questionCount: 15 },
      { id: 22, title: '2.2 立体图形', completed: false, questionCount: 22 },
      { id: 23, title: '2.3 图形变换', completed: false, questionCount: 20 },
    ]
  },
  {
    id: 3,
    title: '第三章 统计与概率',
    progress: 20,
    sections: [
      { id: 31, title: '3.1 数据收集', completed: false, questionCount: 12 },
      { id: 32, title: '3.2 统计图表', completed: false, questionCount: 16 },
      { id: 33, title: '3.3 概率初步', completed: false, questionCount: 14 },
    ]
  }
];

const sampleQuestions = [
  {
    id: 1,
    type: 'choice',
    question: '计算：3/4 + 1/4 = ?',
    options: ['1', '4/8', '1/2', '2/4'],
    answer: 0,
    explanation: '同分母分数相加，分母不变，分子相加：3/4 + 1/4 = (3+1)/4 = 4/4 = 1'
  },
  {
    id: 2,
    type: 'fill',
    question: '一个正方形的边长是5厘米，它的面积是____平方厘米。',
    answer: '25',
    explanation: '正方形面积 = 边长 × 边长 = 5 × 5 = 25平方厘米'
  },
  {
    id: 3,
    type: 'choice',
    question: '下列哪个图形是轴对称图形？',
    options: ['三角形', '圆形', '梯形', '不规则四边形'],
    answer: 1,
    explanation: '圆形是轴对称图形，有无数条对称轴'
  }
];

export default function MathPage() {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [practiceVisible, setPracticeVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const startPractice = (section) => {
    setSelectedChapter(section);
    setPracticeVisible(true);
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResult(false);
  };

  const handleAnswer = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    sampleQuestions.forEach(q => {
      if (q.type === 'choice' && userAnswers[q.id] === q.answer) {
        correct++;
      } else if (q.type === 'fill' && userAnswers[q.id] === q.answer) {
        correct++;
      }
    });
    return Math.round((correct / sampleQuestions.length) * 100);
  };

  const resetPractice = () => {
    setPracticeVisible(false);
    setSelectedChapter(null);
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResult(false);
  };

  return (
    <PageContainer
      title="数学练习"
      subTitle="选择章节开始练习"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
        {mathChapters.map(chapter => (
          <Card 
            key={chapter.id}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOutlined />
                {chapter.title}
              </div>
            }
            extra={
              <Tag color={chapter.progress === 100 ? 'green' : chapter.progress > 50 ? 'orange' : 'blue'}>
                {chapter.progress}% 完成
              </Tag>
            }
          >
            <Progress 
              percent={chapter.progress} 
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              style={{ marginBottom: 16 }}
            />
            
            <List
              size="small"
              dataSource={chapter.sections}
              renderItem={section => (
                <List.Item
                  actions={[
                    <Button 
                      type="primary" 
                      size="small"
                      icon={<PlayCircleOutlined />}
                      onClick={() => startPractice(section)}
                    >
                      开始练习
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      section.completed ? 
                        <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                        <ClockCircleOutlined style={{ color: '#faad14' }} />
                    }
                    title={section.title}
                    description={`${section.questionCount} 道题目`}
                  />
                </List.Item>
              )}
            />
          </Card>
        ))}
      </div>

      {/* 练习模态框 */}
      <Modal
        title={`练习：${selectedChapter?.title}`}
        open={practiceVisible}
        onCancel={resetPractice}
        footer={null}
        width={800}
      >
        {!showResult ? (
          <div>
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <Tag color="blue">第 {currentQuestion + 1} 题 / 共 {sampleQuestions.length} 题</Tag>
            </div>
            
            {sampleQuestions[currentQuestion] && (
              <div>
                <h3>{sampleQuestions[currentQuestion].question}</h3>
                
                {sampleQuestions[currentQuestion].type === 'choice' ? (
                  <Radio.Group 
                    value={userAnswers[sampleQuestions[currentQuestion].id]}
                    onChange={e => handleAnswer(sampleQuestions[currentQuestion].id, e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {sampleQuestions[currentQuestion].options.map((option, index) => (
                      <Radio key={index} value={index} style={{ display: 'block', marginBottom: 8 }}>
                        {String.fromCharCode(65 + index)}. {option}
                      </Radio>
                    ))}
                  </Radio.Group>
                ) : (
                  <Input 
                    placeholder="请输入答案"
                    value={userAnswers[sampleQuestions[currentQuestion].id] || ''}
                    onChange={e => handleAnswer(sampleQuestions[currentQuestion].id, e.target.value)}
                    style={{ width: 200 }}
                  />
                )}
                
                <div style={{ marginTop: 24, textAlign: 'right' }}>
                  <Button 
                    type="primary" 
                    onClick={nextQuestion}
                    disabled={!userAnswers[sampleQuestions[currentQuestion].id] && userAnswers[sampleQuestions[currentQuestion].id] !== 0}
                  >
                    {currentQuestion < sampleQuestions.length - 1 ? '下一题' : '完成练习'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h2>练习完成！</h2>
            <div style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }}>
              {calculateScore()}分
            </div>
            <p>本次练习共 {sampleQuestions.length} 题，你的得分是 {calculateScore()} 分</p>
            
            <div style={{ marginTop: 24, textAlign: 'left' }}>
              <h4>题目解析：</h4>
              {sampleQuestions.map((q, index) => (
                <Card key={q.id} size="small" style={{ marginBottom: 8 }}>
                  <p><strong>第{index + 1}题：</strong>{q.question}</p>
                  <p><strong>你的答案：</strong>
                    {q.type === 'choice' 
                      ? (userAnswers[q.id] !== undefined ? q.options[userAnswers[q.id]] : '未答')
                      : (userAnswers[q.id] || '未答')
                    }
                  </p>
                  <p><strong>正确答案：</strong>
                    {q.type === 'choice' ? q.options[q.answer] : q.answer}
                  </p>
                  <p><strong>解析：</strong>{q.explanation}</p>
                </Card>
              ))}
            </div>
            
            <div style={{ marginTop: 24 }}>
              <Button type="primary" onClick={resetPractice}>
                继续练习
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}