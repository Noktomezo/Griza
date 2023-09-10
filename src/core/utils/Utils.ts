import { existsSync, lstatSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname } from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import type { Snowflake } from 'discord.js'
import type { FollowResponse } from 'follow-redirects'
import follow from 'follow-redirects'
import { env } from '../../env.js'
import type { TGuildIdResolvable } from '../../types/default.js'
import { isGuildInstance, isObject, isSnowflake, isURL } from '../../types/guards.js'

export async function resolveURL(url: string): Promise<string | null> {
	if (!isURL(url)) return null
	return new Promise(resolve => {
		const agent = url.startsWith('https') ? follow.https : follow.http
		agent.get(url, (response: FollowResponse) => {
			resolve(response.responseUrl)
		})
	})
}

export function importJSON<T>(filePath: string): T {
	const fileContents = readFileSync(filePath, 'utf8')
	return JSON.parse(fileContents) as T
}

export function resolveGuildId(resolvable: TGuildIdResolvable): Snowflake {
	let guildId: Snowflake | undefined
	if (typeof resolvable === 'string') {
		guildId = resolvable
	} else if (isObject(resolvable)) {
		if ('guildId' in resolvable && resolvable.guildId) {
			guildId = resolvable.guildId
		} else if ('guild' in resolvable && isGuildInstance(resolvable.guild)) {
			guildId = resolvable.guild.id
		}
	}

	if (!isSnowflake(guildId)) throw new Error('INVALID_GUILD_RESOLVABLE')
	return guildId
}

export function isValidJSON(filePath: string) {
	try {
		const exists = Boolean(filePath) && existsSync(filePath) && extname(filePath) === '.json'
		const empty = statSync(filePath).size === 0
		if (!exists || empty) {
			return false
		}

		JSON.parse(readFileSync(filePath, 'utf8'))
		return true
	} catch {
		return false
	}
}

export function isFileValid(filePath: string) {
	return (
		Boolean(filePath) &&
		existsSync(filePath) &&
		['.ts', '.js', '.txt'].includes(extname(filePath)) &&
		statSync(filePath).size !== 0
	)
}

export function isFolder(folderPath: string) {
	return existsSync(folderPath) && lstatSync(folderPath).isDirectory()
}

export function isFolderValid(folderPath: string) {
	return isFolder(folderPath) && readdirSync(folderPath).length > 0
}

export function jsonToMap(json: Record<string, string>) {
	const map = new Map<string, string>()

	for (const key in json) {
		if (Object.hasOwn(json, key)) {
			const value = json[key]
			map.set(key, value)
		}
	}

	return map
}

export function isDevMode() {
	return process.env.NODE_ENV === 'development'
}

export function getCurrentTime() {
	return new Date().toLocaleString(env.DEFAULT_LOCALE, { timeZone: env.TIMEZONE })
}
