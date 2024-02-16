import { ExportContextType } from "@/types/exportOption";
import useBuildExcel from "@/hooks/useBuildExcel";
import extendOptions from "./hooks/useExtend";

export function exportExcel(tableName: string, options: ExportContextType) {
  const { buildExcel } = useBuildExcel(tableName, options);
  buildExcel();
}

export default {
  ...extendOptions,
  exportExcel,
};
