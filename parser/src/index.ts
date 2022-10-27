import "dotenv/config";
import pool from "./db/connection";
import cron from "node-cron";
import { PoolClient } from "pg";
import { logger } from "./logger";
import { TableWorker } from "./TableWorker";
import { startRabbit } from "./rabbitmq";
import amqp from "amqplib/callback_api";
const queue = "tasks";

logger.info(`Server has been started 🚀`);
start();

//cron.schedule("1 * * * *", start);

//Works every Sunday 23:50
//cron.schedule("50 23 * * 7", () => logger.info("Db cleaning task."));

async function start() {
  try {
    const client: PoolClient = await pool.connect();
    await client.query("SELECT * FROM groups");
  } catch (err) {
    console.log(err);
    logger.error("Error, while connecting to PostgreSQL database.", { err });
    return;
  }
  //startRabbit();
  amqp.connect("amqp://localhost", (err, conn) => {
    if (err) throw err;

    conn.createChannel((err, ch1) => {
      if (err) throw err;

      ch1.assertQueue(queue);

      setInterval(() => {
        ch1.sendToQueue(queue, Buffer.from("something to do"));
        console.log("Sended");
      }, 1000);
    });
  });
  //const worker = new TableWorker();
  //worker.start();
}
