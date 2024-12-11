import { SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "@/types/Command";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  cooldown: 5,
  developer: false,
  category: "general",

  execute: async (interaction) => {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    const ping = sent.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply({
      content: `Pong! 🏓\nLatency: ${ping}ms\nAPI Latency: ${Math.round(
        interaction.client.ws.ping
      )}ms`,
    });
  },
} as SlashCommand;
