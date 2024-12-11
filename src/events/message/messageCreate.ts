import { Events, Message, Collection } from "discord.js";
import { ExtendedClient } from "@/structures/Client";
import { config } from "../../config";
import chalk from "chalk";

export default {
  name: Events.MessageCreate,
  async execute(message: Message, client: ExtendedClient) {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command =
      client.prefixCommands.get(commandName) ||
      client.prefixCommands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );

    if (!command) return;

    try {
      // Verificar si el comando es solo para desarrolladores
      if (command.developer && !config.developer.includes(message.author.id)) {
        return message.reply(
          "Este comando solo está disponible para desarrolladores."
        );
      }

      // Verificar permisos
      if (command.permissions) {
        if (command.permissions.bot) {
          const missingPerms = message.guild.members.me?.permissions.missing(
            command.permissions.bot
          );
          if (missingPerms?.length) {
            return message.reply(
              `Necesito los siguientes permisos: ${missingPerms.join(", ")}`
            );
          }
        }

        if (command.permissions.user) {
          const missingPerms = message.member?.permissions.missing(
            command.permissions.user
          );
          if (missingPerms?.length) {
            return message.reply(
              `Necesitas los siguientes permisos: ${missingPerms.join(", ")}`
            );
          }
        }
      }

      // Manejar cooldowns
      if (command.cooldown) {
        const { cooldowns } = client;
        if (!cooldowns.has(command.name)) {
          cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = command.cooldown * 1000;

        if (timestamps?.has(message.author.id)) {
          const expirationTime =
            timestamps.get(message.author.id)! + cooldownAmount;
          if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            const sendMessage = await message.reply(
              `Por favor espera ${timeLeft.toFixed(
                1
              )} segundos antes de usar el comando nuevamente.`
            );
            if (!sendMessage) return;
            setTimeout(async () => {
              try {
                await sendMessage.delete();
              } catch (error) {
                console.log(
                  chalk.red(`[ERROR] `) +
                    chalk.white(`No se pudo eliminar el mensaje de cooldown`)
                );
              }
            }, 5000);
            return;
          }
        }

        timestamps?.set(message.author.id, now);
        setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);
      }

      await command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply("¡Hubo un error al ejecutar este comando!");
    }
  },
};
