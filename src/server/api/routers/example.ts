import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "y/server/api/trpc";

import {
  type TextChannel
} from "discord.js";
import { discordClient } from "y/server/discord";
import process from "process";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  sendDiscordMessage: publicProcedure.input(z.object({ text: z.string() })).mutation(async ({ input }) => {
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

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
