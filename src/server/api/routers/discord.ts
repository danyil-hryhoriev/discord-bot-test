import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "y/server/api/trpc";

import {
  EmbedBuilder,
  type TextChannel
} from "discord.js";
import { getDiscordClient } from "y/server/discord";
import process from "process";
import { endOfWeek, format, startOfWeek } from "date-fns";

export const discordRouter = createTRPCRouter({
  cron: publicProcedure
    .mutation(async ({ input }) => {
      const discordClient = await getDiscordClient();
      const channel =  (await discordClient.channels.fetch(process.env.DISCORD_CHANNEL_ID as string)) as TextChannel;
      console.log('cron job called');
      if (!channel) {
        console.log('Channel not found');
        return;
      }

      const date = new Date();
      const sow = startOfWeek(date, { weekStartsOn: 1 });
      const eow = endOfWeek(date, { weekStartsOn: 1 });
      const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: 'Leave tracker', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
        .setDescription(`Hey there! A friendly reminder from the leave tracker bot for next week (${format(sow, 'E..EEE, MMM dd')} - ${format(eow, 'E..EEE, MMM dd')})`)
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .addFields(
          { name: 'Regular field title', value: 'Some value here' },
          { name: '\u200B', value: '\u200B' },
          { name: 'Inline field title', value: 'Some value here', inline: true },
          { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
        .setImage('https://i.imgur.com/AfFp7pu.png')
        .setTimestamp()
        .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
      await channel.send({embeds:[exampleEmbed]}).then(async message => {
        await message.react('👍');
        await message.react('👎');
        const filter = (reaction: any, user: any) => {
          return true;
        }
        message.createReactionCollector({filter, max: 3, time: 5000 }).on('collect', (reaction, collector) => {
          console.log('got a reaction');
        });
      });
      return;
    }),

  sendDiscordMessage: publicProcedure.input(z.object({ text: z.string() })).mutation(async ({ input }) => {
    const discordClient = await getDiscordClient();
    const channel = discordClient.channels.cache.find(channel => channel.id === process.env.DISCORD_CHANNEL_ID && channel.isTextBased) as TextChannel;
    if (!channel) throw new Error('Channel not found');
    await channel.send('`'+ input.text + '`').then(async message => {
      await message.react('✅');
      await message.react('❎');
      const filter = (reaction: any, user: any) => {
        return user.id !== message.author.id;
      }
      message.createReactionCollector({filter, max: 1, time: 500 }).on('collect', (reaction, collector) => {
        console.log('got a reaction');
      });

      await message.awaitReactions().then(
        collected => {
          console.log('You reacted with a thumbs up.');
        }
      );
      console.log(`Sent message: ${message.content}`);
    }).catch(console.error);
    return 'Message sent';
  }),
});
