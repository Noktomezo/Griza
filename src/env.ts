import process from 'node:process'
import type { LocaleString } from 'discord.js'
import { z } from 'zod'
import 'dotenv/config.js'
import { isLocaleCode, isTimeZoneString } from './types/guards.js'
import type { TimeZoneString } from './types/utils.js'

const processEnv = z.object({
	DISCORD_TOKEN: z.string(),
	MONGO_CONNECTION_URL: z.string(),
	DEFAULT_LOCALE: z.custom<LocaleString>(),
	TIMEZONE: z.custom<TimeZoneString>()
})

export const env = processEnv.parse(process.env)

if (!isTimeZoneString(env.TIMEZONE)) throw new Error('ENV_VAR_TIMEZONE_IS_NOT_VALID')
if (!isLocaleCode(env.DEFAULT_LOCALE)) throw new Error('ENV_VAR_DEFAULT_LOCALE_IS_NOT_VALID')
