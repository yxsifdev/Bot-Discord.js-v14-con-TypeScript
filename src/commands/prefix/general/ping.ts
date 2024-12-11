import type { PrefixCommand } from "../../../types/Command";

export default {
  name: "ping",
  description: "Latencia del bot",
  usage: "n!ping",
  aliases: ["p"],
  cooldown: 5,
  developer: false,

  category: "General",
  execute: async (message) => {
    const sent = await message.reply("Calculando...");
    const ping = sent.createdTimestamp - message.createdTimestamp;

    await sent.edit(
      `Pong! 🏓\nLatencia: ${ping}ms\nAPI Latencia: ${Math.round(
        message.client.ws.ping
      )}ms`
    );
  },
} as PrefixCommand;
