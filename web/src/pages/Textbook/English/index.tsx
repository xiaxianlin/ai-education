import React, { useState } from 'react';
import { Card, Button, List, Tag, Progress, Modal, Radio, Input, message, Tabs } from 'antd';
import { BookOutlined, PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, SoundOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';

const { TextArea } = Input;
const { TabPane } = Tabs;

// 模拟数据
const englishUnits = [
  {
    id: 1,
    title: 'Unit 1 - My School',
    progress: 75,
    vocabulary: ['school', 'classroom', 'teacher', 'student', 'book'],
    sentences: [
      'This is my school.',
      'I love my classroom.',
      'My teacher is very kind.'
    ],
    exercises: [
      {
        type: 'vocabulary',
        question: '选择正确的翻译：school',
        options: ['学校', '教室', '老师', '学生'],
        answer: 0
      },
      {
        type: 'grammar',
        question: '选择正确的句子：',
        options: ['This is my school.', 'This are my school.', 'This am my school.', 'This be my school.'],
        answer: 0
      }
    ]
  },
  {
    id: 2,
    title: 'Unit 2 - My Family',
    progress: 60,
    vocabulary: ['family', 'mother', 'father', 'sister', 'brother'],
    sentences: [
      'I have a big family.',
      'My mother is a doctor.',
      'My father likes reading.'
    ],
    exercises: [
      {
        type: 'vocabulary',
        question: '选择正确的翻译：family',
        options: ['朋友', '家庭', '学校', '老师'],
        answer: 1
      }
    ]
  },
  {
    id: 3,
    title: 'Unit 3 - Colors and Numbers',
    progress: 40,
    vocabulary: ['red', 'blue', 'green', 'one', 'two', 'three'],
    sentences: [
      'I like red apples.',
      'There are three cats.',
      'The sky is blue.'
    ],
    exercises: [
      {
        type: 'vocabulary',
        question: '选择正确的翻译：blue',
        options: ['红色', '绿色', '蓝色', '黄色'],
        answer: 2
      }
    ]
  }
];

export default function EnglishPage() {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [practiceVisible, setPracticeVisible] = useState(false);
  const [practiceType, setPracticeType] = useState('vocabulary');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const startPractice = (unit, type = 'vocabulary') => {
    setSelectedUnit(unit);
    setPracticeType(type);
    setPracticeVisible(true);
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResult(false);
  };

  const playAudio = (text) => {
    // 模拟播放音频
    message.info(`播放音频: ${text}`);
    // 实际项目中可以使用 Web Speech API 或音频文件
  };

  const handleAnswer = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    const questions = selectedUnit?.exercises || [];
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    const questions = selectedUnit?.exercises || [];
    let correct = 0;
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        correct++;
      }
    });
    return questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  };

  const resetPractice = () => {
    setPracticeVisible(false);
    setSelectedUnit(null);
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResult(false);
  };

  return (
    <PageContainer
      title="英语练习"
      subTitle="选择单元开始学习"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
        {englishUnits.map(unit => (
          <Card 
            key={unit.id}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOutlined />
                {unit.title}
              </div>
            }
            extra={
              <Tag color={unit.progress === 100 ? 'green' : unit.progress > 50 ? 'orange' : 'blue'}>
                {unit.progress}% 完成
              </Tag>
            }
          >
            <Progress 
              percent={unit.progress} 
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              style={{ marginBottom: 16 }}
            />
            
            <Tabs defaultActiveKey="vocabulary" size="small">
              <TabPane tab="单词学习" key="vocabulary">
                <div style={{ marginBottom: 12 }}>
                  <strong>重点单词：</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {unit.vocabulary.map(word => (
                    <Tag 
                      key={word} 
                      color="blue" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => playAudio(word)}
                    >
                      <SoundOutlined /> {word}
                    </Tag>
                  ))}
                </div>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={() => startPractice(unit, 'vocabulary')}
                >
                  开始单词练习
                </Button>
              </TabPane>
              
              <TabPane tab="句型练习" key="sentences">
                <div style={{ marginBottom: 12 }}>
                  <strong>重点句型：</strong>
                </div>
                <List
                  size="small"
                  dataSource={unit.sentences}
                  renderItem={sentence => (
                    <List.Item
                      actions={[
                        <Button 
                          size="small" 
                          icon={<SoundOutlined />}
                          onClick={() => playAudio(sentence)}
                        >
                          播放
                        </Button>
                      ]}
                    >
                      {sentence}
                    </List.Item>
                  )}
                  style={{ marginBottom: 16 }}
                />
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={() => startPractice(unit, 'grammar')}
                >
                  开始语法练习
                </Button>
              </TabPane>
            </Tabs>
          </Card>
        ))}
      </div>

      {/* 练习模态框 */}
      <Modal
        title={`${selectedUnit?.title} - ${practiceType === 'vocabulary' ? '单词练习' : '语法练习'}`}
        open={practiceVisible}
        onCancel={resetPractice}
        footer={null}
        width={800}
      >
        {!showResult ? (
          <div>
            {selectedUnit?.exercises && selectedUnit.exercises.length > 0 ? (
              <>
                <div style={{ marginBottom: 16, textAlign: 'center' }}>
                  <Tag color="blue">第 {currentQuestion + 1} 题 / 共 {selectedUnit.exercises.length} 题</Tag>
                </div>
                
                <div>
                  <h3>{selectedUnit.exercises[currentQuestion]?.question}</h3>
                  
                  <Radio.Group 
                    value={userAnswers[currentQuestion]}
                    onChange={e => handleAnswer(currentQuestion, e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {selectedUnit.exercises[currentQuestion]?.options.map((option, index) => (
                      <Radio key={index} value={index} style={{ display: 'block', marginBottom: 8 }}>
                        {String.fromCharCode(65 + index)}. {option}
                      </Radio>
                    ))}
                  </Radio.Group>
                  
                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button 
                      type="primary" 
                      onClick={nextQuestion}
                      disabled={userAnswers[currentQuestion] === undefined}
                    >
                      {currentQuestion < selectedUnit.exercises.length - 1 ? '下一题' : '完成练习'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p>该单元的练习题目正在准备中...</p>
                <Button onClick={resetPractice}>返回</Button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h2>练习完成！</h2>
            <div style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }}>
              {calculateScore()}分
            </div>
            <p>本次练习共 {selectedUnit?.exercises?.length || 0} 题，你的得分是 {calculateScore()} 分</p>
            
            {selectedUnit?.exercises && selectedUnit.exercises.length > 0 && (
              <div style={{ marginTop: 24, textAlign: 'left' }}>
                <h4>题目解析：</h4>
                {selectedUnit.exercises.map((q, index) => (
                  <Card key={index} size="small" style={{ marginBottom: 8 }}>
                    <p><strong>第{index + 1}题：</strong>{q.question}</p>
                    <p><strong>你的答案：</strong>
                      {userAnswers[index] !== undefined ? q.options[userAnswers[index]] : '未答'}
                    </p>
                    <p><strong>正确答案：</strong>{q.options[q.answer]}</p>
                  </Card>
                ))}
              </div>
            )}
            
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