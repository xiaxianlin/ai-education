/**
 * 练习结果页面工具函数
 */

/**
 * 获取状态文本和样式
 */
export function getStatusInfo(status: PracticeStatus) {
  switch (status) {
    case 0:
      return { text: "未开始", variant: "outline" as const };
    case 1:
      return { text: "进行中", variant: "secondary" as const };
    case 2:
      return { text: "已完成", variant: "default" as const };
    default:
      return { text: "未知", variant: "outline" as const };
  }
}
