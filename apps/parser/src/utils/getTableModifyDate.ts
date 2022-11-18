import { GettingTableModifyDateError } from "./../exceptions/GettingTableModifyDateError";
import XLSX, { WorkBook } from "xlsx";
import * as fs from "fs";
import { UnknownPathError } from "../exceptions/UnknownPathError";

export const getTableModifyDate = async (path: string): Promise<Date> => {
  try {
    if (fs.existsSync(path)) {
      const workbook: WorkBook = XLSX.readFile(path);
      return workbook.Props.ModifiedDate;
    } else {
      throw new UnknownPathError(path);
    }
  } catch (error) {
    throw new GettingTableModifyDateError();
  }
};
