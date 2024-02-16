import { BorderStyle, Workbook, Worksheet } from "exceljs";

export type Arrayable<T> = T | T[];
export type ExportContextType = Arrayable<ExportOptions>;
export type CommonItemType = StyleOptions & FormatOptions; // 联合类型
// 公共样式接口
export interface StyleOptions {
  color?: string;
  width?: number;
  size?: number;
  align?: "center" | "left" | "right";
  bold?: boolean;
  showBorder?: boolean;
  borderType?: BorderStyle;
  borderColor?: string;
}
// 公共数据格式化属性接口
export interface FormatOptions {
  field?: string; // 对应数据项字段
  formatType?: string; // 格式化类型
  formatter?: (value: any) => any; // 格式化函数
}
// 列项配置
export interface ColumnItem extends CommonItemType {
  title?: string; // 标题
  children?: Array<ColumnItem>; // 多级表头
  headerAlign?: "center" | "left" | "right"; // 表头单元格对齐方式
}
// 单元格项配置
export interface CellItem extends CommonItemType {
  rowIndex?: number; // 行索引
  colIndex?: number; // 列索引
  isMerge?: boolean; // 是否合并
  rowEndIndex?: number; // 合并结束行索引
  colEndIndex?: number; // 合并结束列索引
}
// 配置项接口
export interface ExportOptions {
  excelJs?: Workbook; // excelJs上下文
  sheet?: Worksheet; // sheet页签上下文
  name?: string; // sheet页签名
  columns?: Array<ColumnItem>; // 列配置
  cells?: Arrayable<CellItem>; // 单元格配置
  data?: Array<any>; // 数据源
  tableType?: string; // 表格类型
}
