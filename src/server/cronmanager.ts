import { CronJob } from "cron";
import process from "process";
import { TextChannel } from "discord.js";
import { discordClient } from "y/server/discord";

export class CronManager {
  private static instance: CronManager;
  private readonly cron: CronJob;
  private constructor() {
    console.log('CronManager constructor called')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    this.cron = new CronJob(
      '*/30 * * * * *',
      async function() {
        const channel =  discordClient.channels.cache.find(channel => channel.id === process.env.DISCORD_CHANNEL_ID && channel.isTextBased) as TextChannel;
        console.log('cron job called');
        if (!channel) {
          return;
        }
        await channel.send('```How are you doing today? \nPlease react with 👍 if you are doing well, or 👎 if you are not doing well.```').then(async message => {
          await message.react('👍');
          await message.react('👎');
          const filter = (reaction: any, user: any) => {
            return true;
          }
          message.createReactionCollector({filter, max: 3, time: 5000 }).on('collect', (reaction, collector) => {
            console.log('got a reaction');
          });
        });
      }, null, true);
  }

  public static getInstance(): CronManager {
    if (!CronManager.instance) {
      CronManager.instance = new CronManager();
    }
    return CronManager.instance;
  }
}
