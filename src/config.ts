import dotenv from "dotenv";
dotenv.config();

export interface Config {
  token: string;
  clientId: string;
  prefix: string;
  developer: string[];
  embedColor: string;
}

if (!process.env.TOKEN)
  throw new Error("El token no está definido en el archivo .env");
if (!process.env.CLIENT_ID)
  throw new Error("El ID del cliente no está definido en el archivo .env");

export const config: Config = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  prefix: process.env.PREFIX || "!",
  developer: [""], // Agrega tu ID de discord aquí
  embedColor: "#7289DA",
};
