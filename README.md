# Bot Discord.js v14 con TypeScript

Un bot de Discord construido con TypeScript y Discord.js v14.

## Características

- Comandos de barra (Slash Commands) y comandos con prefijo
- Manejo de comandos con cooldowns y permisos
- Sistema modular de eventos
- Registro automático de comandos
- Validación de permisos
- Estructura extensible

## Instalación

1. Clona este repositorio

```bash
git clone https://github.com/yxsifdev/Bot-Discord.js-v14-con-TypeScript.git
```

2. Instala las dependencias:
```bash
npm install
```

1. Configura tu archivo `.env`:
```env
TOKEN="token_del_bot"
CLIENT_ID="id_del_bot"
PREFIX="n!"
```

1. Compila el proyecto:
```bash
npm run build
```

1. Inicia el bot:
```bash
npm start
```

Para desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
src/
├── commands/
│   ├── prefix/           # Comandos con prefijo
│   │   └── general/
│   └── slash/          # Comandos de barra
│       └── general/
├── events/              # Manejadores de eventos
│   ├── client/
│   ├── interaction/
│   └── message/
├── handlers/            # Manejadores de comandos y eventos
├── structures/          # Cliente extendido y otras estructuras
├── types/              # Definiciones de tipos TypeScript
├── config.ts           # Configuración del bot
└── index.ts            # Punto de entrada

```

## Creación de Comandos

### Comandos de Barra (Slash Commands)

Crea un nuevo archivo en `src/commands/slash/` con la siguiente estructura:

```typescript
import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '@/types/Command';

export default {
    data: new SlashCommandBuilder()
        .setName('nombre-comando')
        .setDescription('Descripción del comando'),
    cooldown: 5, // Cooldown opcional en segundos
    permissions: { // Permisos opcionales
        bot: ['SendMessages'],
        user: ['Administrator']
    },
    developer: true, // Opcional: hacer el comando exclusivo para desarrolladores
    execute: async (interaction) => {
        // Lógica del comando aquí
    }
} as SlashCommand;
```

### Comandos con Prefijo

Crea un nuevo archivo en `src/commands/prefix/` con la siguiente estructura:

```typescript
import type { PrefixCommand } from '../../../types/Command';

export default {
    name: 'nombre-comando',
    description: 'Descripción del comando',
    aliases: ['alias1', 'alias2'], // Aliases opcionales
    cooldown: 5, // Cooldown opcional en segundos
    permissions: { // Permisos opcionales
        bot: ['SendMessages'],
        user: ['Administrator']
    },
    developer: true, // Opcional: hacer el comando exclusivo para desarrolladores
    execute: async (message, args) => {
        // Lógica del comando aquí
    }
} as PrefixCommand;
```

## Creación de Eventos

Crea un nuevo archivo en `src/events/` con la siguiente estructura:

```typescript
import { Events } from 'discord.js';
import { ExtendedClient } from '../../structures/Client';

export default {
    name: Events.EventName,
    once: false, // true si el evento solo debe activarse una vez
    execute(/* parámetros del evento */, client: ExtendedClient) {
        // Lógica del evento aquí
    }
};
```
