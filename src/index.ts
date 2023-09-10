import process from 'node:process'
import { GatewayIntentBits, Partials } from 'discord.js'
import { Griza } from './core/Griza.js'
import { env } from './env.js'

const bot = new Griza({
	timeZone: env.TIMEZONE,
	mongoConnectionURL: env.MONGO_CONNECTION_URL,
	defaultLocale: env.DEFAULT_LOCALE,
	intents: Object.values(GatewayIntentBits).filter((i): i is GatewayIntentBits => typeof i === 'number'),
	partials: [Partials.Message, Partials.Channel]
})

await bot.init(env.DISCORD_TOKEN) 

const repair = async (error: unknown) => {
	bot.logger.error(error)
	await bot.destroy()
	await bot.init(env.DISCORD_TOKEN)
}

process.on('uncaughtException', async error => repair(error))
process.on('unhandledRejection', async error => repair(error))
