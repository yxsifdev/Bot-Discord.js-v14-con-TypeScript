import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import { SlashCommand, PrefixCommand } from "../types/Command";
import { loadEvents } from "../handlers/eventHandler";
import { loadCommands } from "../handlers/commandHandler";
import { config, Config } from "../config";

export class ExtendedClient extends Client {
  public slashCommands: Collection<string, SlashCommand>;
  public prefixCommands: Collection<string, PrefixCommand>;
  public cooldowns: Collection<string, Collection<string, number>>;
  public config: Config;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.User,
      ],
    });

    this.config = config;
    this.slashCommands = new Collection();
    this.prefixCommands = new Collection();
    this.cooldowns = new Collection();
  }

  public async init() {
    this.login(this.config.token);

    // Cargar handlers
    await loadEvents(this);
    await loadCommands(this);

    // Manejar errores
    process.on("unhandledRejection", (error: Error) => {
      console.error("Unhandled promise rejection:", error);
    });
  }
}
