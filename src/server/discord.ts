import { env } from "y/env.mjs";
import { Client, TextChannel } from "discord.js";
import process from "process";

const globalForDiscord = globalThis as unknown as { discordClient: Client };

export const getDiscordClient = async () => {
  const client = new Client({ intents: ["Guilds", "GuildMessages", "GuildMessageReactions"] })
  await client.login(process.env.DISCORD_TOKEN);
  return client;
};
