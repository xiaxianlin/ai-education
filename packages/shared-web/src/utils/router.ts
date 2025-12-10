import { createBrowserHistory, History } from "history";

export const history: History = createBrowserHistory();

/**
 * 路由导航函数
 * @param path 目标路径
 * @param replace 是否替换当前历史记录（默认 false，使用 push）
 */
export function go(path: string, replace = false): void {
  if (replace) {
    history.replace(path);
  } else {
    history.push(path);
  }
}
