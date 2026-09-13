import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '幸运转盘｜品牌福利季',
  description: '一个包含真实抽奖状态、次数任务、奖品领取与本地恢复的移动端转盘活动。',
};

export default function SpinLayout({ children }: { children: ReactNode }) {
  return children;
}
