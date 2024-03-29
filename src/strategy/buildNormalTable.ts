import {
  DataFormatTypeEnum,
  dataFormatTypeList,
} from "@/constants/dataFormatConfig";
import {
  CellItem,
  ColumnItem,
  CommonItemType,
  ExportOptions,
  FormatOptions,
  StyleOptions,
} from "@/types/exportOption";
import { getIndexFormatStringByUnitType } from "@/utils/dataUtils";
import { Cell, Row } from "exceljs";

export default function buildNormalTable(context: ExportOptions) {
  /**
   * 获取公共样式
   */
  function getDefaultConfig(config?: CommonItemType) {
    return Object.assign(
      {
        align: "center",
        width: 20,
        size: 10,
        bold: true,
        showBorder: true,
        borderType: "thin",
        borderColor: "FF000000",
      },
      config
    );
  }
  /**
   * 获取表头单元格公共样式
   */
  function getDefaultHeaderConfig(column?: ColumnItem) {
    return Object.assign(
      {
        headerAlign: "center",
        ...getDefaultConfig(),
      },
      column
    );
  }
  /**
   * 获取表体单元格公共样式
   */
  function getDefaultCellConfig(cell?: CellItem) {
    return Object.assign(
      {
        headerRowHeight: 30,
        bodyRowHeight: 20,
        ...getDefaultConfig({
          bold: false,
          showBorder: false,
        }),
      },
      cell
    );
  }
  /**
   * 获取表头columns数组最大深度
   */
  function getDepth(node: ColumnItem, currentDepth = 0): number {
    if (!node.children || node.children.length === 0) {
      return currentDepth + 1;
    }
    return Math.max(
      ...node.children.map((child) => getDepth(child, currentDepth + 1))
    );
  }
  /**
   * 获取表头columns数组最大宽度
   */
  function getMaxWidth(node: ColumnItem): number {
    if (!node.children || node.children.length === 0) {
      return 1;
    }
    return node.children.reduce(
      (total, child) => total + getMaxWidth(child),
      0
    );
  }
  /**
   * 生成矩阵
   */
  function getMatrix(root: ColumnItem) {
    // 动态计算矩阵的大小
    const maxDepth = getDepth(root);
    const maxWidth = getMaxWidth(root);
    // 初始化矩阵
    const matrix: Array<Array<ColumnItem>> = Array.from(
      { length: maxDepth },
      () => Array(maxWidth).fill("X")
    );

    function processNode(node: ColumnItem, level: number, position: number) {
      if (level >= maxDepth || position >= maxWidth) return;
      matrix[level][position] = node;
      if (node.children && node.children.length) {
        let offset = position; // 从当前节点的位置开始放置子节点
        node.children.forEach((child) => {
          processNode(child, level + 1, offset);
          offset += getMaxWidth(child); // 更新偏移量为子树的最大宽度
        });
      }
    }

    processNode(root, 0, 0);
    return matrix;
  }
  /**
   * 设置单元格样式
   */
  function setCellStyles(cell: Cell, styles: StyleOptions) {
    const assignStyles = {
      font: {
        bold: styles.bold,
        size: styles.size,
        color: { argb: styles.color },
      },
      alignment: {
        vertical: "middle",
        horizontal: styles.align,
      },
    };
    if (styles.showBorder) {
      Object.assign(assignStyles, {
        border: {
          top: {
            style: styles.borderType,
            color: { argb: styles.borderColor },
          }, // 黑色边框
          left: {
            style: styles.borderType,
            color: { argb: styles.borderColor },
          },
          bottom: {
            style: styles.borderType,
            color: { argb: styles.borderColor },
          },
          right: {
            style: styles.borderType,
            color: { argb: styles.borderColor },
          },
        },
      });
    }
    Object.assign(cell, assignStyles);
  }
  /**
   * 格式化单元格值
   */
  function getCellValue(context: FormatOptions, value: any) {
    const { formatType, formatter } = context;
    if (formatter) {
      value = formatter(value);
    } else if (formatType && dataFormatTypeList.includes(formatType)) {
      value = getIndexFormatStringByUnitType(
        value as number,
        formatType as DataFormatTypeEnum
      );
    }
    return value;
  }
  /**
   * 生成表头
   */
  function buildTableHeader(context: ExportOptions) {
    const { sheet, columns = [] } = context;

    // 表头处理逻辑
    const matrix = getMatrix({ children: columns });
    matrix.shift();
    const headerRowsCount = matrix.length;
    const headerRows: Array<Row> = [];
    const defaultBodyConfig = getDefaultCellConfig();
    const leafNodeList: Array<ColumnItem> = [];

    for (let i = 0; i < headerRowsCount; i++) {
      const rowItem = sheet.addRow([]);
      rowItem.height = defaultBodyConfig.headerRowHeight;
      headerRows.push(rowItem);
    }

    // 收集叶子节点
    for (let col = 0; col < matrix[0].length; col++) {
      let row = matrix.length - 1;
      let cur = matrix[row][col];
      while (cur === ("X" as any) && row >= 0) {
        row--;
        cur = matrix[row][col];
      }
      leafNodeList.push(cur);
    }

    matrix.forEach((item, index) => {
      item.forEach((e: any, v) => {
        if (e === "X") return;
        const rowItem = headerRows[index];
        const colNumber = v + 1;
        const cell = rowItem.getCell(colNumber);
        const defaultHeaderConfig = getDefaultHeaderConfig(e);
        sheet.getColumn(colNumber).width = defaultHeaderConfig.width;
        cell.value = e.title;
        setCellStyles(cell, defaultHeaderConfig);
        cell.alignment.horizontal = defaultHeaderConfig.headerAlign;
      });
    });
    // 纵向合并
    for (let col = 0; col < matrix[0].length; col++) {
      for (let row = matrix.length - 1; row >= 0; row--) {
        if (matrix[row][col] === ("X" as any)) {
          let cur = row - 1;
          while (cur >= 0) {
            if (matrix[cur][col] !== ("X" as any)) {
              const mergeStartIndex = headerRows[cur].number;
              const mergeEndIndex = headerRows[row].number;
              const mergeColIndex = col + 1;
              sheet.mergeCells(
                mergeStartIndex,
                mergeColIndex,
                mergeEndIndex,
                mergeColIndex
              );
              for (let start = row; start > cur; start--) {
                matrix[start][col] = "covered" as any;
              }
              row = cur;
              break;
            }
            cur--;
          }
        }
      }
    }
    // 横向合并
    for (let row = 0; row < headerRowsCount; row++) {
      for (let col = matrix[0].length - 1; col >= 0; col--) {
        if (matrix[row][col] === ("X" as any)) {
          let cur = col - 1;
          while (cur >= 0) {
            if (matrix[row][cur] !== ("X" as any)) {
              const mergeStartIndex = cur + 1;
              const mergeEndIndex = col + 1;
              const mergeRowIndex = row + 1;
              sheet.mergeCells(
                mergeRowIndex,
                mergeStartIndex,
                mergeRowIndex,
                mergeEndIndex
              );
              col = cur;
              break;
            }
            cur--;
          }
        }
      }
    }
    return { leafNodeList };
  }
  /**
   * 生成表体
   */
  function buildTableBody(
    context: ExportOptions,
    leafNodeList: Array<ColumnItem>
  ) {
    let { sheet, data = [], cells = [] } = context;
    const rowItems: Array<Row> = [];
    // 处理常规数据
    data.forEach((item) => {
      const row = [];
      leafNodeList.forEach((col) => {
        row.push("--");
      });
      const tableItem = sheet.addRow(row);
      rowItems.push(tableItem);
      const defaultBodyConfig = getDefaultCellConfig();
      tableItem.height = defaultBodyConfig.bodyRowHeight;
      tableItem.eachCell((cell, number) => {
        const colItem = leafNodeList[number - 1];
        const { field } = colItem;
        const defaultHeaderConfig = getDefaultHeaderConfig(colItem);
        let value: any;
        if (field) value = item[field];
        value = getCellValue(colItem, value);
        cell.value = value;
        setCellStyles(cell, defaultBodyConfig);
        cell.alignment.horizontal =
          defaultHeaderConfig.align || defaultBodyConfig.align;
      });
    });
    // 处理特殊单元格
    cells = Array.isArray(cells) ? cells : [cells];
    cells.forEach((item) => {
      let {
        rowIndex = 0,
        colIndex = 0,
        field,
        isMerge,
        rowEndIndex = 0,
        colEndIndex = 0,
      } = item;
      if (rowItems.length && rowIndex > -1 && colIndex > -1) {
        const rowItem = rowItems[rowIndex];
        const rowNumber = rowItem.number;
        const cell = rowItem.getCell(colIndex + 1);
        const colItem = leafNodeList[colIndex];
        const defaultCellConfig = getDefaultCellConfig(item);
        let value: any;
        field = field || colItem.field;
        if (field) value = data[rowIndex][field];
        value = getCellValue(item, value);
        cell.value = value;
        setCellStyles(cell, defaultCellConfig);
        if (isMerge && rowEndIndex >= rowIndex && colEndIndex >= colIndex) {
          sheet.mergeCells(
            rowNumber + rowIndex,
            colIndex + 1,
            rowNumber + rowEndIndex,
            colEndIndex + 1
          );
        }
      }
    });
  }
  const { leafNodeList } = buildTableHeader(context);
  buildTableBody(context, leafNodeList);
}
