import { ExtendedClient } from "../structures/Client";
import { readdirSync } from "fs";
import { join } from "path";
import chalk from "chalk";

export async function loadEvents(client: ExtendedClient) {
  const eventsPath = join(__dirname, "..", "events");
  const eventFolders = readdirSync(eventsPath);

  for (const folder of eventFolders) {
    const folderPath = join(eventsPath, folder);
    const eventFiles = readdirSync(folderPath).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js")
    );

    for (const file of eventFiles) {
      const filePath = join(folderPath, file);
      const event = require(filePath).default;

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      console.log(
        chalk.green(`[EVENT] `) + chalk.white(`Evento "${event.name}" cargado`)
      );
    }
  }
}
