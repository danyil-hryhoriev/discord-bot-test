import { env } from "y/env.mjs";
import { Client, TextChannel } from "discord.js";
import process from "process";

const globalForDiscord = globalThis as unknown as { discordClient: Client };

export const discordClient = new Client({ intents: ["Guilds", "GuildMessages", "GuildMessageReactions"] });
void discordClient.login(process.env.DISCORD_TOKEN);

if (env.NODE_ENV !== "production") globalForDiscord.discordClient = discordClient;
