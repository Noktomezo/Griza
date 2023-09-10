import process from 'node:process'
import type { LocaleString } from 'discord.js'
import { z } from 'zod'
import 'dotenv/config.js'
import { isLocaleCode, isTimeZoneString } from './types/guards.js'
import type { TimeZoneString } from './types/utils.js'

const processEnv = z.object({
	DISCORD_TOKEN: z.string(),
	MONGO_CONNECTION_URL: z.string(),
	DEFAULT_LOCALE: z.custom<LocaleString>().refine(isLocaleCode, 'ENV_VAR_DEFAULT_LOCALE_IS_NOT_VALID'),
	TIMEZONE: z.custom<TimeZoneString>().refine(isTimeZoneString, 'ENV_VAR_TIMEZONE_IS_NOT_VALID')
})

export const env = processEnv.parse(process.env)
