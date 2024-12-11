import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "@/types/Command";

export default {
  data: new SlashCommandBuilder()
    .setName("prueba")
    .setDescription("Comando de prueba"),
  cooldown: 5,
  developer: true,
  permissions: {
    bot: [PermissionFlagsBits.Administrator],
  },

  execute: async (interaction) => {
    await interaction.reply("¡Este es un comando de prueba! 🙀");
  },
} as SlashCommand;
