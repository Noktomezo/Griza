import { URL } from 'node:url'
import type { Snowflake, Guild } from 'discord.js'
import { Locale, SnowflakeUtil } from 'discord.js'
import type { TLocaleJSON, TLocaleMap, TLocaleCode, IStationData } from './default.js'
import type { TimeZoneString } from './utils.js'
import { TimeZone } from './utils.js'

export function isObject(obj: any): obj is object {
	return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}

export function isLocaleCode(str: any): str is TLocaleCode {
	return Object.values(Locale).includes(str)
}

export function isTimeZoneString(str: any): str is TimeZoneString {
	return Object.values(TimeZone).includes(str)
}

export function isSnowflake(id: any): id is Snowflake {
	try {
		return SnowflakeUtil.deconstruct(id).timestamp > SnowflakeUtil.epoch
	} catch {
		return false
	}
}

export function isNumber(value: any): value is number {
	return typeof value === 'number'
}

export function isLocaleJSON(value: any): value is TLocaleJSON {
	return isObject(value)
}

export function isLocaleMap(obj: any): obj is TLocaleMap {
	return obj instanceof Map
}

export function isGuildInstance(guild: any): guild is Guild {
	return Boolean(guild) && isSnowflake(guild.id) && isSnowflake(guild.ownerId) && typeof guild.name === 'string'
}

export function isStationData(data: any): data is IStationData {
	const stationProps = ['name', 'url', 'description', 'logo', 'emoji']
	return isObject(data) && stationProps.every(p => Object.hasOwn(data, p))
}

export function isURL(input: any): input is `file://${string}` | `http://${string}` | `https://${string}` {
	try {
		return typeof input === 'string' && !input.includes(' ') && /^https?:|file:/.test(new URL(input).protocol)
	} catch {
		return false
	}
}
