import axios from "axios";
import * as fs from "fs";
import { getTableNameFromLink } from "../../../../libs/shared/src/helpers/getTableNameFromLink";
import { checkTableNameLink } from "../../../../libs/shared/src/helpers/checkTableLink";
import { FacultyId } from "../parsers/constants";
import { DownloadTableError } from "../errors/downloadTableError";

export const downloadTable = async (
  link: string,
  facultyId: FacultyId
): Promise<string> => {
  if (!checkTableNameLink(link)) throw new Error(`invalid link ${link}`);

  const path = `${process.env.STORAGE_PATH}${facultyId}/${getTableNameFromLink(
    link
  )}`;

  return axios
    .get(link, { responseType: "arraybuffer" })
    .then(({ data }) => {
      if (!fs.existsSync(process.env.STORAGE_PATH + facultyId)) {
        fs.mkdirSync(process.env.STORAGE_PATH + facultyId, {
          recursive: true,
        });
      }
      fs.writeFileSync(path, data);

      return path;
    })
    .catch((err) => {
      throw new DownloadTableError(err);
    });
};
