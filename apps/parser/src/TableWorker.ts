import { GettingTableModifyDateError } from "./exceptions/GettingTableModifyDateError";
import { DownloadingPageError } from "./exceptions/DownloadingPageError";
import { getTableModifyDate } from "./utils/getTableModifyDate";
import { getTableNameFromPath } from "./utils/getTableNameFromPath";
import logger from "./logger";
import repository from "./repository";
import { TablesWatcher, TablesWatcherEvents } from "./TablesWatcher";
import { downloadTable } from "./utils/downloadTable";
import { getParserByFaculty } from "./utils/getParserByFaculty";
import { TableParser } from "./parsers/TableParser";
import RabbitmqServer from "./rabbitmq";
import { Faculty, Week } from "./models/models";
import { pages } from "./constraints/pages";

export class TableWorker {
  private readonly cron_str = "0 */2 * * *";

  private readonly watcher: TablesWatcher;

  private parser: TableParser;

  private readonly rabbitmq = new RabbitmqServer(
    process.env.RABBITMQ_CONN_STRING
  );

  constructor() {
    this.rabbitmq = new RabbitmqServer(process.env.RABBITMQ_CONN_STRING);
    this.rabbitmq.start();

    this.watcher = new TablesWatcher(pages, this.cron_str);
    this.watcher.on(
      TablesWatcherEvents.WEEK_TABLE_CHANGED,
      this.onWeekTableChanged.bind(this)
    );
  }

  public start(): void {
    this.watcher.forceStart();
    this.watcher.start();
  }

  private async onWeekTableChanged(
    link: string,
    faculty: Faculty,
    tableWeek: Week,
    tableName: string
  ) {
    try {
      const localDate = await this.getLocalTableModifyDate(link, faculty);
      const path = await downloadTable(link, faculty);
      const newTableDate = await getTableModifyDate(path);

      this.parser = getParserByFaculty(faculty.id, path);

      await repository.deletePairs(faculty.id).then(() => {
        logger.info(
          `Parsing of table ${faculty.id}/${getTableNameFromPath(
            path
          )} has been started.`
        );

        this.parser.parseTable().then(() => {
          logger.info(
            `Parsing of table ${faculty.id}/${getTableNameFromPath(
              path
            )} has been finished.`
          );
        });
      });

      if (localDate === null) {
        await this.sendMessage("tables_queue", "new_table", {
          faculty,
          link,
          tableWeek,
        });
      } else if (localDate !== newTableDate) {
        await this.sendMessage("tables_queue", "table_modified", {
          faculty,
          link,
          tableWeek,
        });
      }
    } catch (e) {
      if (e instanceof DownloadingPageError) {
        logger.info(e);
      }
      throw e;
    }
  }
  private async getLocalTableModifyDate(link: string, faculty: Faculty) {
    const localCopyTable = getTableNameFromPath(link);
    const localCopyPath = `${process.env.STORAGE_PATH}${faculty.id}/${localCopyTable}`;
    return await getTableModifyDate(localCopyPath);
  }

  private async sendMessage(queue: string, pattern: string, data: any) {
    await this.rabbitmq.publishInQueue(queue, pattern, data);
  }
}
