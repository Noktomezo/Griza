import type { EventEmitter } from 'node:events'
import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { cwd } from 'node:process'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { ClusterClient, getInfo } from 'discord-hybrid-sharding'
import type { LocaleString } from 'discord.js'
import { Client } from 'discord.js'
import type { TypedEmitter } from 'tiny-typed-emitter'
import type { IGrizaOptions, TEventFunction } from '../types/default.js'
import type { TimeZoneString } from '../types/utils.js'
import { CommandManager } from './managers/CommandManager.js'
import { LocaleManager } from './managers/LocaleManager.js'
import { PresenceManager } from './managers/PresenceManager.js'
import { Database } from './utils/Database.js'
import { Logger } from './utils/Logger.js'
import { Radio } from './utils/Radio.js'
import { isDevMode, isFileValid, isFolderValid } from './utils/Utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export class Griza<Ready extends boolean = boolean> extends Client<Ready> {
	public locale: LocaleString

	public timeZone: TimeZoneString

	public logger: Logger

	public database: Database

	public locales: LocaleManager

	public commands: CommandManager

	public presences: PresenceManager

	public cluster: ClusterClient<this> | null

	public radio: Radio

	public constructor(options: IGrizaOptions) {
		super({
			...options,
			shards: isDevMode() ? 'auto' : getInfo().SHARD_LIST,
			shardCount: isDevMode() ? 1 : getInfo().TOTAL_SHARDS
		})
		this.locale = options.defaultLocale
		this.timeZone = options.timeZone
		this.cluster = isDevMode() ? null : new ClusterClient(this)
		this.logger = new Logger()
		this.database = new Database(this, options.mongoConnectionURL)
		this.locales = new LocaleManager(this, join(cwd(), 'locales'), 'en-US')
		this.commands = new CommandManager(this, join(__dirname, '..', 'commands'))
		this.presences = new PresenceManager(this, join(cwd(), 'presences.txt'))
		this.radio = new Radio(this, join(cwd(), 'stations'))
	}

	public async handleEvents(eventFolderPath: string, eventManager: EventEmitter | TypedEmitter) {
		if (!isFolderValid(eventFolderPath)) return

		for (const eventFile of readdirSync(eventFolderPath)) {
			const eventFilePath = join(eventFolderPath, eventFile)
			if (!isFileValid(eventFilePath)) continue

			const eventFileURL = pathToFileURL(eventFilePath).toString()
			const eventFileNameParts = eventFile.split('.')
			const eventName = eventFileNameParts[0]
			const isEventOnce = eventFileNameParts[1] === 'once'
			const { event }: { event: TEventFunction } = await import(eventFileURL)
			eventManager[isEventOnce ? 'once' : 'on'](eventName, (...args: unknown[]) => event(this, ...args))
		}
	}

	public async init(token: string) {
		const clientEventsPath = join(__dirname, '..', 'events', 'client')
		const databaseEventsPath = join(__dirname, '..', 'events', 'database')
		const localeEventsPath = join(__dirname, '..', 'events', 'locales')

		await this.handleEvents(clientEventsPath, this)
		await this.handleEvents(databaseEventsPath, this.database)
		await this.handleEvents(localeEventsPath, this.locales)
		await this.login(token)
	}
}
