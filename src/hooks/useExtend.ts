import { tableTypeMap } from "@/constants/tableConfig";
import { ExportOptions } from "@/types/exportOption";

function useExtend(map: Map<string, Function>) {
  function extend(type: string, fn: (context: ExportOptions) => void) {
    map.set(type, fn);
  }
  return {
    extend,
  };
}

export default {
  table: useExtend(tableTypeMap),
};
