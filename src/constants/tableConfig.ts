import buildNormalTable from "@/strategy/buildNormalTable";

export const enum TableTypeEnum {
  NORMAL = "normal",
}

// 维护Excel生成策略的Map
export const tableTypeMap = new Map<string, Function>([
  [TableTypeEnum.NORMAL, buildNormalTable],
]);
