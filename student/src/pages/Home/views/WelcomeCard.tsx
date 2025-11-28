/**
 * 欢迎卡片组件
 * 简单、活泼、大气、可爱的设计
 */
import { memo } from 'react';

interface WelcomeCardProps { }

export const WelcomeCard = memo(function WelcomeCard({ }: WelcomeCardProps) {
  const greetingEmojis = ['👋', '😊', '🎈', '🌈', '🎨'];
  const randomGreeting = greetingEmojis[Math.floor(Math.random() * greetingEmojis.length)];

  return (
    <div className="bg-card rounded-3xl p-8 sm:p-10 shadow-xl border-2 border-primary/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* 左侧欢迎信息 - 一行展示 */}
        <div className="flex items-center gap-5">
          <div className="text-7xl animate-bounce" style={{ animationDuration: '2s' }}>
            {randomGreeting}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              你好呀！
            </h1>
            <span className="text-lg sm:text-xl text-muted-foreground font-medium">
              今天也要加油学习哦~ 💪
            </span>
          </div>
        </div>

      </div>
    </div>
  );
});

