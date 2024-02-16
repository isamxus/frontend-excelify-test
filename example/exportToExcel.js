import { exportExcel } from "../src";

function generateData(count) {
  const units = ["日常运营", "投资", "储蓄"];
  const apps = ["转账", "理财", "存款", "支付"];
  const banks = [
    "银行A",
    "银行B",
    "银行C",
    "银行D",
    "银行E",
    "银行F",
    "银行G",
    "银行H",
    "银行I",
    "银行J",
  ];
  const tips = ["是", "否"];

  return Array.from({ length: count }, (_, index) => ({
    unit: `单位${index + 1}`,
    account: `${Math.floor(100000 + Math.random() * 900000)}`,
    name: `账户${index + 1}`,
    bank: banks[index % banks.length],
    tip: tips[Math.floor(Math.random() * tips.length)],
    type: units[index % units.length],
    app: apps[index % apps.length],
    amount: Math.floor(Math.random() * (1000000000 - 100000000) + 100000000),
  }));
}
export function exportToExcel() {
  exportExcel("测试", [
    {
      name: "账户列表1",
      columns: [
        {
          title: "单位",
          field: "unit",
          children: [
            { title: "单位1", field: "unit" },
            { title: "账号2", field: "unit" },
          ],
        },
        { title: "账号", field: "account" },
        { title: "名称", field: "name" },
        { title: "银行", field: "bank" },
      ],
      data: generateData(10), // 随机生成十条数据
    },
  ]);
}

