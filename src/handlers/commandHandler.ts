import { ExtendedClient } from "../structures/Client";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "../config";
import chalk from "chalk";
import { SlashCommand, SubcommandGroup } from "@/types/Command";

async function loadSlashCommands(client: ExtendedClient, commandsPath: string) {
  const commands = [];
  const folders = readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = join(commandsPath, folder);

    // Si es un directorio, procesamos los archivos como subcomandos
    if (statSync(folderPath).isDirectory()) {
      const files = readdirSync(folderPath).filter(
        (file) => file.endsWith(".ts") || file.endsWith(".js")
      );

      // Crear el comando principal basado en el nombre de la carpeta
      const mainCommand = new SlashCommandBuilder()
        .setName(folder)
        .setDescription(`${folder} commands`);

      // Objeto para almacenar los subcomandos de esta categoría
      const subcommands: Record<string, SlashCommand> = {};

      // Procesar cada archivo como un subcomando
      for (const file of files) {
        const filePath = join(folderPath, file);
        const command = require(filePath).default;

        if ("data" in command && "execute" in command) {
          const subcommandName = file.replace(".ts", "").replace(".js", "");

          // Añadir como subcomando
          mainCommand.addSubcommand((subcommand) =>
            subcommand
              .setName(subcommandName)
              .setDescription(
                command.data.description || "No description provided"
              )
          );

          // Guardar el subcomando en el objeto
          subcommands[subcommandName] = command;

          console.log(
            chalk.blue(`[SLASH] `) +
              chalk.white(`SubComando cargado: /${folder} ${subcommandName}`)
          );
        }
      }

      // Guardar el comando principal y sus subcomandos
      commands.push(mainCommand.toJSON());
      const groupCommand: SubcommandGroup = {
        isGroup: true,
        subcommands,
        data: mainCommand,
        execute: async (interaction) => {
          // Los subcomandos se manejan en interactionCreate.ts
        },
      };
      client.slashCommands.set(folder, groupCommand);
    } else if (folder.endsWith(".ts") || folder.endsWith(".js")) {
      // Procesar comandos normales (fuera de carpetas)
      const command = require(join(commandsPath, folder)).default;

      if ("data" in command && "execute" in command) {
        client.slashCommands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(
          chalk.blue(`[SLASH] `) +
            chalk.white(`Comando cargado: /${command.data.name}`)
        );
      }
    }
  }

  return commands;
}

async function loadPrefixCommands(
  client: ExtendedClient,
  commandsPath: string
) {
  const folders = readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = join(commandsPath, folder);
    const commandFiles = readdirSync(folderPath).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js")
    );

    for (const file of commandFiles) {
      const filePath = join(folderPath, file);
      const command = require(filePath).default;

      if ("name" in command && "execute" in command) {
        client.prefixCommands.set(command.name, command);
        console.log(
          chalk.yellow(`[PREFIX] `) +
            chalk.white(`Comando cargado: ${config.prefix}${command.name}`)
        );
      }
    }
  }
}

export async function loadCommands(client: ExtendedClient) {
  const slashCommandsPath = join(__dirname, "..", "commands", "slash");
  const prefixCommandsPath = join(__dirname, "..", "commands", "prefix");

  // Load commands
  const slashCommands = await loadSlashCommands(client, slashCommandsPath);
  await loadPrefixCommands(client, prefixCommandsPath);

  // Register slash commands
  const rest = new REST().setToken(config.token);

  try {
    console.log(chalk.yellow("Iniciando actualización de comandos (/)"));

    await rest.put(Routes.applicationCommands(config.clientId), {
      body: slashCommands,
    });

    console.log(chalk.green("Comandos (/) actualizados correctamente."));
  } catch (error) {
    console.error(error);
  }
}
