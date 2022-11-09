import "dotenv/config";
import EventSource from "eventsource";
import cron from "node-cron";
import TelegramBot, { Message, KeyboardButton } from "node-telegram-bot-api";
import { ChatIsAlreadySubscribedError } from "./exceptions/ChatIsAlreadySubcribed";
import { convertDateToSimpleFormat } from "./functions/convertDateToSimpleFormat";
import { getGroupByName } from "./functions/getGroupByName";
import { getNextWeekPairs } from "./functions/getNextWeekPairs";
import { getWeekDayByNumber } from "./functions/getWeekDayByNumber";
import { getWeekPairs } from "./functions/getWeekPairs";
import repository from "./repository";
import { pool } from "./repository/pool";

async function sendPairs(bot: TelegramBot, chatId: number, pairs: any[]) {
  const pairsMap = new Map<string, any[]>();
  for (const pair of pairs) {
    if (pairsMap.has(getWeekDayByNumber(pair.day))) {
      const newArr = pairsMap.get(getWeekDayByNumber(pair.day));
      newArr.push(pair);
      pairsMap.set(getWeekDayByNumber(pair.day), newArr);
    } else {
      pairsMap.set(getWeekDayByNumber(pair.day), [pair]);
    }
  }
  for (const [day, pairs] of pairsMap) {
    let message = `${day} ${convertDateToSimpleFormat(
      new Date(pairs[0].date)
    )}:\r\n`;
    for (const pair of pairs) {
      message += `${pair.number} пара\r\n🎯 ${pair.name}\r\n🧑‍🏫 ${pair.instructor}\r\n`;
    }
    await bot.sendMessage(chatId, message);
  }
}

const newTable = new EventSource("http://localhost:3000/api/v1/pairs/created");
const tableModified = new EventSource(
  "http://localhost:3000/api/v1/pairs/modified"
);

newTable.addEventListener("created", async (data: any) => {
  const fac_subscribers = await repository.getFacultySubscribers(
    data.faculty_id
  );
  if (!fac_subscribers) return;

  const mes = `Появилось расписание на следующую неделю, Можете восполь`;

  for (const sub of fac_subscribers) {
    bot.sendMessage(sub.chat_id, mes);
  }
});

tableModified.addEventListener("modified", async (data: any) => {});

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

cron.schedule("* * * * *", async () => {
  try {
    console.log("123");
    const fac_subscribers = await repository.getFacultySubscribers(11);
    console.log(fac_subscribers);
    for (const sub of fac_subscribers) {
      bot.sendMessage(sub.chat_id, "rar;laqr;la");
    }
  } catch (e) {}
});

async function start() {
  const client = await pool.connect();
  console.log("Successfully connected to db");
  console.log("Bot has been started 🚀.");

  bot.onText(/\/начать/, (msg: Message) => {
    bot.sendMessage(
      msg.chat.id,
      "Добро пожаловать в неофицального ШГПУ бота с расписанием",
      {
        reply_markup: {
          keyboard: [
            [{ text: "Пары на неделю" }],
            [{ text: "Пары завтра" }, { text: "Пары на три дня" }],
            [{ text: "Пары на следующую неделю" }],
            [{ text: "Пары по преподавателю" }],
          ],
        },
      }
    );
  });

  bot.onText(/Пары на неделю/gi, async (msg: Message) => {
    const subscriber = await repository.getSubscriberByChatId(msg.chat.id);
    if (subscriber) {
    } else {
      bot.sendMessage(
        msg.chat.id,
        "Вы не подписаны не на одну из групп, пожалуйста, воспользуйтесь полной версией команды"
      );
    }
  });

  bot.onText(/Пары \S{1,} на неделю/gi, async (msg: Message) => {
    const groupName = msg.text.split(" ")[1];
    const pairs = await getWeekPairs(groupName);
    await sendPairs(bot, msg.chat.id, pairs);
  });

  bot.onText(/Пары \S{1,} на след неделю/gi, async (msg: Message) => {
    const groupName = msg.text.split(" ")[1];
    const pairs = await getNextWeekPairs(groupName);
    if (!pairs) {
      bot.sendMessage(msg.chat.id, "Нет информации о парах за период");
      return;
    }
    await sendPairs(bot, msg.chat.id, pairs);
  });

  bot.onText(
    /Подпиши на \S{1,}/,
    async (msg: Message, matches: RegExpExecArray) => {
      const groupName = msg.text.split(" ").pop();
      const group = await getGroupByName(groupName);
      if (!group) {
        bot.sendMessage(
          msg.chat.id,
          `Не удалось подписаться на группу ${groupName}.`
        );
        return;
      }
      try {
        const res = await repository.addNewSubscriber(
          msg.chat.id,
          groupName,
          group.faculty_id
        );
      } catch (err) {
        if (err instanceof ChatIsAlreadySubscribedError) {
          bot.sendMessage(
            msg.chat.id,
            `Не удалось подписаться на группу ${groupName}. Сначала отпишитесь от текущей.`
          );
        } else {
          bot.sendMessage(
            msg.chat.id,
            `Не удалось подписаться на группу ${groupName}. Неизвестная ошибка.`
          );
        }
        return;
      }
      bot.sendMessage(msg.chat.id, `Вы подписались на группу ${groupName}`);
    }
  );

  bot.onText(/Забудь меня/gi, async (msg: Message) => {
    try {
      const res = await repository.removeSubscriber(msg.chat.id);
      if (res > 0)
        bot.sendMessage(msg.chat.id, `Вы успешно отписалиcь от группы.`);
      else
        bot.sendMessage(
          msg.chat.id,
          `Вы ещё не подписаны на обновления какой-то группы.`
        );
    } catch (e) {
      console.log(e);
      bot.sendMessage(msg.chat.id, `Не удалось отписаться от группы.`);
    }
  });
}

start();
