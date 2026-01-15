/**
 * 全局类型声明
 * 引用 shared-web 的统一类型，使类型全局可用
 */
import '@ai-education/shared-web/types';

declare module 'react-json-view' {
  import { Component } from 'react';

  export interface ReactJsonViewProps {
    src: any;
    name?: string | false;
    theme?: string;
    collapsed?: boolean | number;
    collapseStringsAfterLength?: number;
    onEdit?: (edit: any) => void;
    onAdd?: (add: any) => void;
    onDelete?: (delete_: any) => void;
    onSelect?: (select: any) => void;
    enableClipboard?: boolean;
    displayDataTypes?: boolean;
    displayObjectSize?: boolean;
    indentWidth?: number;
    iconStyle?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }

  export default class ReactJson extends Component<ReactJsonViewProps> {}
}

// 确保全局类型可用
declare global {
  /**
   * 初始状态
   */
  interface InitialState {
    manager?: Manager;
    configs?: Configs;
  }
  /**
   * 配置信息
   */
  interface Configs {
    subjects: string[];
    semesters: string[];
    providers: string[];
    question_types: Record<string, Record<number, Record<string, string[]>>>;
  }
}

export {};
