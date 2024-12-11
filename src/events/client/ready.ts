import { Events } from "discord.js";
import { ExtendedClient } from "../../structures/Client";
import chalk from "chalk";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: ExtendedClient) {
    console.log(
      chalk.green(`[READY] `) +
        chalk.white(`Conectado como ${client.user?.tag}!`)
    );
  },
};
