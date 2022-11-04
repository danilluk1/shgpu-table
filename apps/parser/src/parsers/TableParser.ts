import EventEmitter from "node:events";
import XLSX, { Sheet } from "xlsx";
import RabbitmqServer from "../rabbitmq";

export abstract class TableParser extends EventEmitter {
  protected readonly sheet: Sheet;
  protected readonly path: string;

  protected readonly mondayPairs: Map<number, number>;
  protected readonly tuesdayPairs: Map<number, number>;
  protected readonly wednesdayPairs: Map<number, number>;
  protected readonly thursdayPairs: Map<number, number>;
  protected readonly fridayPairs: Map<number, number>;
  protected readonly saturdayPairs: Map<number, number>;

  constructor(path: string) {
    super();

    this.path = path;
    const workbook = XLSX.readFile(this.path);
    this.sheet = workbook.Sheets[workbook.SheetNames[0]];
  }

  public async parseTable(): Promise<void> {
    throw new Error("Parse table don't implemented.");
  }

  protected getGroupColumn(groupName: string) {
    const range = XLSX.utils.decode_range(this.sheet["!ref"]);
    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = XLSX.utils.encode_cell({ c: c, r: r });
        if (!this.sheet[cell]) continue;
        if (
          this.sheet[cell].v.toLowerCase().replace(/\s/g, "") ===
          groupName.toLowerCase().replace(/\s/g, "")
        ) {
          return cell;
        }
      }
    }
  }

  protected async normalizeTable(groupName: string, groupId: number) {
    throw new Error("Normalize table not implemented.");
  }

  public async sendMessage(queue: string, pattern: string, data: any) {
    const server = new RabbitmqServer(process.env.RABBITMQ_CONN_STRING);
    server.start();
    await server.publishInQueue(queue, pattern, data);
  }
}
