import { Collection } from 'discord.js'
import type { Snowflake } from 'discord.js'
import Keyv from 'keyv'
import { unset, set } from 'lodash-es'
import { TypedEmitter } from 'tiny-typed-emitter'
import type { IDatabaseEvents, IGuildSettings } from '../../types/default.js'
import type { Griza } from '../Griza.js'

export class Database extends TypedEmitter<IDatabaseEvents> {
	private readonly _keyv: Keyv<IGuildSettings>

	private readonly _cache: Collection<Snowflake, IGuildSettings>

	private readonly _defaults: IGuildSettings

	public constructor(
		public client: Griza,
		private readonly _url: string
	) {
		super()
		this._keyv = new Keyv<IGuildSettings>(this._url)
		this._cache = new Collection<Snowflake, IGuildSettings>()
		this._defaults = {
			locale: 'en-US',
			stationURL: null,
			commandChannelId: null,
			voiceChannelId: null
		}

		this.client.once('ready', async () => this._update())
	}

	public async set(key: Snowflake, value: IGuildSettings, ttl?: number) {
		await this._keyv.set(key, value, ttl)
		this._cache.set(key, value)

		if (ttl && ttl >= 0) setTimeout(() => this._cache.delete(key), ttl)
	}

	public async setDefaults(key: Snowflake) {
		await this.set(key, this._defaults)
	}

	public delete(key: Snowflake) {
		void this._keyv.delete(key)
		this._cache.delete(key)
	}

	public get(key: Snowflake) {
		return this._cache.get(key) as IGuildSettings
	}

	public has(key: Snowflake) {
		return this._cache.has(key)
	}

	public getAll() {
		return this._cache.clone()
	}

	public async fetch(key: Snowflake): Promise<IGuildSettings>
	public async fetch(): Promise<Collection<Snowflake, IGuildSettings>>
	public async fetch(key?: Snowflake) {
		if (key) {
			return this._keyv.get(key)
		}

		const data = new Collection<Snowflake, IGuildSettings>()
		for await (const [guildId, guildSettings] of this._keyv.iterator()) {
			data.set(guildId, guildSettings)
		}

		return data
	}

	private async _update() {
		this.emit('updateStarted')

		const allGuildSettings = await this.fetch()

		// Remove dead guilds from the database
		for (const guildId of allGuildSettings.keys()) {
			const guild = this.client.guilds.cache.get(guildId)
			if (!guild) {
				await this._keyv.delete(guildId)
			}
		}

		// Repair the database relying on default parameters
		for (const guild of this.client.guilds.cache.values()) {
			const guildSettings = allGuildSettings.get(guild.id)
			const repairedSettings = this._repair(guildSettings)
			if (!guildSettings) {
				await this.set(guild.id, repairedSettings)
				continue
			}

			if (this._areKeysIdentical(guildSettings, repairedSettings)) {
				this._cache.set(guild.id, guildSettings)
			} else {
				await this.set(guild.id, repairedSettings)
			}
		}

		this.emit('updateFinished')
	}

	private _repair(settings?: IGuildSettings) {
		if (!settings) return this._defaults

		const defaultKeys = Object.keys(this._defaults)
		const customKeys = Object.keys(settings)

		const missingKeys = defaultKeys.filter(key => !customKeys.includes(key))
		const additionalKeys = customKeys.filter(key => !defaultKeys.includes(key))

		const repairedObj = { ...settings }

		for (const key of missingKeys) {
			set(repairedObj, key, this._defaults[key as keyof IGuildSettings])
		}

		for (const key of additionalKeys) {
			unset(repairedObj, key)
		}

		return repairedObj as IGuildSettings
	}

	private _areKeysIdentical(obj1: object, obj2: object) {
		const keys1 = Object.keys(obj1)
		const keys2 = Object.keys(obj2)

		if (keys1.length !== keys2.length) return false
		return keys1.every(key => keys2.includes(key))
	}
}
