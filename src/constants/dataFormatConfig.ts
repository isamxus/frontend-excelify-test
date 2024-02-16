export const enum DataFormatTypeEnum {
  BILLION = "billion", // 转换成亿元
  TEN_THOUSAND = "ten-thousand", // 转换成万元
  NUMBER = "number", // 普通数值
  PERCENT = "percent", // 转换成百分比
}

export const dataFormatTypeList = [
  DataFormatTypeEnum.BILLION,
  DataFormatTypeEnum.NUMBER,
  DataFormatTypeEnum.PERCENT,
  DataFormatTypeEnum.TEN_THOUSAND,
] as Array<string>;
