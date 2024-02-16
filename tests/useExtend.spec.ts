// tests/hooks/useExtend.spec.ts
import { expect } from "chai";
import useExtend from "@/hooks/useExtend";
import { tableTypeMap } from "@/constants/tableConfig";

describe("useExtend Interfaces with real Maps - Table Interface", () => {
  let originalMaps: any = {};

  beforeEach(() => {
    originalMaps.tableTypeMap = new Map(tableTypeMap);
    tableTypeMap.clear();
  });

  afterEach(() => {
    tableTypeMap.clear();
    originalMaps.tableTypeMap.forEach((value, key) => {
      tableTypeMap.set(key, value);
    });
  });

  describe("table interface", () => {
    it("should add a new strategy using extend", () => {
      const { table } = useExtend;
      const testFn = () => {};
      table.extend("testType", testFn);

      expect(tableTypeMap.has("testType")).to.be.true;
      expect(tableTypeMap.get("testType")).to.equal(testFn);
    });
  });
});
