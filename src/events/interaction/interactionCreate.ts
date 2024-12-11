import { Events, Interaction, Collection } from "discord.js";
import { ExtendedClient } from "../../structures/Client";
import { SubcommandGroup, SlashCommand } from "../../types/Command";
import { config } from "../../config";

const cooldowns = new Collection<string, Collection<string, number>>();

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: ExtendedClient) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      // Primero verificamos si es un comando de desarrollador
      if (
        command.developer &&
        !config.developer.includes(interaction.user.id)
      ) {
        return interaction.reply({
          content: "Este comando solo está disponible para desarrolladores.",
          ephemeral: true,
        });
      }

      // Verificar permisos del bot
      if (command.permissions?.bot) {
        const botPermissions = interaction.guild?.members.me?.permissions;
        const missingPermissions = command.permissions.bot.filter(
          (permission) => !botPermissions?.has(permission)
        );

        if (missingPermissions.length > 0) {
          return interaction.reply({
            content: `No tengo los siguientes permisos requeridos: ${missingPermissions.join(
              ", "
            )}`,
            ephemeral: true,
          });
        }
      }

      // Verificar permisos del usuario
      if (command.permissions?.user) {
        const missingPermissions = command.permissions.user.filter(
          (permission) => !interaction.memberPermissions?.has(permission)
        );

        if (missingPermissions.length > 0) {
          return interaction.reply({
            content: `No tienes los siguientes permisos requeridos: ${missingPermissions.join(
              ", "
            )}`,
            ephemeral: true,
          });
        }
      }

      // Verificar cooldown después de todas las verificaciones de permisos
      const now = Date.now();
      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const timestamps = cooldowns.get(command.data.name);
      let cooldownAmount = (command.cooldown || 3) * 1000;

      if (isSubcommandGroup(command)) {
        const subcommandName = interaction.options.getSubcommand();
        const subcommand = command.subcommands[subcommandName];

        if (!subcommand) {
          return interaction.reply({
            content: "Subcomando no encontrado.",
            ephemeral: true,
          });
        }

        // Verificar permisos de desarrollador para subcomandos
        if (
          subcommand.developer &&
          !config.developer.includes(interaction.user.id)
        ) {
          return interaction.reply({
            content:
              "Este subcomando solo está disponible para desarrolladores.",
            ephemeral: true,
          });
        }

        // Verificar permisos del bot para subcomandos
        if (subcommand.permissions?.bot) {
          const botPermissions = interaction.guild?.members.me?.permissions;
          const missingPermissions = subcommand.permissions.bot.filter(
            (permission) => !botPermissions?.has(permission)
          );

          if (missingPermissions.length > 0) {
            return interaction.reply({
              content: `No tengo los siguientes permisos requeridos: ${missingPermissions.join(
                ", "
              )}`,
              ephemeral: true,
            });
          }
        }

        // Verificar permisos del usuario para subcomandos
        if (subcommand.permissions?.user) {
          const missingPermissions = subcommand.permissions.user.filter(
            (permission) => !interaction.memberPermissions?.has(permission)
          );

          if (missingPermissions.length > 0) {
            return interaction.reply({
              content: `No tienes los siguientes permisos requeridos: ${missingPermissions.join(
                ", "
              )}`,
              ephemeral: true,
            });
          }
        }

        cooldownAmount = (subcommand.cooldown || command.cooldown || 3) * 1000;
      }

      // Verificación final del cooldown
      const userCooldown = timestamps?.get(interaction.user.id);
      if (userCooldown) {
        const expirationTime = userCooldown + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply({
            content: `Por favor espera ${timeLeft.toFixed(
              1
            )} segundos antes de usar este comando nuevamente.`,
            ephemeral: true,
          });
        }
      }

      timestamps?.set(interaction.user.id, now);
      setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

      // Ejecutar el comando
      if (isSubcommandGroup(command)) {
        const subcommandName = interaction.options.getSubcommand();
        await command.subcommands[subcommandName].execute(interaction);
      } else {
        await command.execute(interaction);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "¡Hubo un error al ejecutar este comando!",
        ephemeral: true,
      });
    }
  },
};

function isSubcommandGroup(command: SlashCommand): command is SubcommandGroup {
  return "isGroup" in command && (command as any).isGroup === true;
}
