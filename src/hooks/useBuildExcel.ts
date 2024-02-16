import { TableTypeEnum, tableTypeMap } from "@/constants/tableConfig";
import { ExportContextType, ExportOptions } from "@/types/exportOption";
import { Workbook } from "exceljs";

export default function useBuildExcel(
  tableName: string,
  context: ExportContextType
) {
  let workbook: Workbook;

  function handleItem(item: ExportOptions) {
    const { tableType = TableTypeEnum.NORMAL } = item;
    const useTableFn = tableTypeMap.get(tableType);
    if (useTableFn) useTableFn(item);
  }

  function handleContext() {
    if (!Array.isArray(context)) {
      context = [context];
    }

    context.forEach((item) => {
      const sheet = workbook.addWorksheet(item.name);
      item.sheet = sheet;
      item.excelJs = workbook;
      handleItem(item);
    });
  }

  function exportFile() {
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);

      // 创建一个临时的a标签来触发下载
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = tableName; // 文件名
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // 清理
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    });
  }

  function buildExcel() {
    import("exceljs").then((res) => {
      const ExcelJS = res;
      workbook = new ExcelJS.Workbook();
      handleContext();
      exportFile();
    });
  }
  return {
    buildExcel,
  };
}
