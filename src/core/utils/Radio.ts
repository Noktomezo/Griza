import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { TrackLike } from 'discord-player'
import { Player } from 'discord-player'
import type { VoiceChannel } from 'discord.js'
import { Collection } from 'discord.js'
import { Parser } from 'icecast-parser'
import type {
	IStationData,
	TChoiceStation,
	TGuildIdResolvable,
	TLocaleCode,
	TStationCollection,
	TStationResolvable,
	TStationSettings
} from '../../types/default.js'
import { isStationData, isURL } from '../../types/guards.js'
import type { Griza } from '../Griza.js'
import { importJSON, isFolderValid, isValidJSON, resolveGuildId, resolveURL } from './Utils.js'

export class Radio extends Player {
	private readonly _stations: Collection<string, IStationData>

	private readonly _localized: Collection<TLocaleCode, TStationCollection>

	public constructor(
		public override client: Griza,
		public stationFolderPath: string
	) {
		super(client)

		this._stations = new Collection<string, IStationData>()
		this._localized = new Collection<TLocaleCode, TStationCollection>()

		this._fetch()
		this.client.locales.once('fetchFinished', () => this._translateAllStations())
		this.client.database.once('updateFinished', async () => this._launch())
	}

	public get stations() {
		return [...this._stations.values()]
	}

	public async set(guildIdResolvable: TGuildIdResolvable, settings: TStationSettings) {
		const guildId = resolveGuildId(guildIdResolvable)
		const guild = this.client.guilds.cache.get(guildId)
		if (!guild) throw new Error('Invalid guild')

		const guildSettings = this.client.database.get(guild.id)!
		const voiceChannel = guild.channels.cache.find((c): c is VoiceChannel => c.id === settings.voiceChannelId)
		const station = this.resolveStation<true>(settings.stationURL)
		if (!voiceChannel || !station) throw new Error('Invalid station or voice channel')

		this.client.database.set(guild.id, { ...guildSettings, ...settings })

		const resolvedURL = await resolveURL(settings.stationURL)
		if (!resolvedURL) throw new Error('Invalid station url')

		await this.safePlay(voiceChannel, settings.stationURL, true)
	}

	public reset(guildIdResolvable: TGuildIdResolvable) {
		const guildId = resolveGuildId(guildIdResolvable)
		const guild = this.client.guilds.cache.get(guildId)
		if (!guild) return

		const queue = this.queues.get(guild)
		if (queue?.currentTrack) queue.delete()

		this.client.database.setDefaults(guild.id)
	}

	public async safePlay(voiceChannel: VoiceChannel, track: TrackLike, skip: boolean = false) {
		const guildId = resolveGuildId(voiceChannel)
		const guild = this.client.guilds.cache.get(guildId)
		if (!guild) return

		const queue = this.queues.get(guild)
		if (skip && queue) queue.node.skip()

		try {
			return await this.play(voiceChannel, track, {
				nodeOptions: {
					disableHistory: true,
					leaveOnEnd: false,
					leaveOnStop: false,
					leaveOnEmpty: false,
					selfDeaf: true
				}
			})
		} catch (error) {
			this.client.logger.error(error)
			return null
		}
	}

	public async change(guildIdResolvable: TGuildIdResolvable, stationResolvable: TStationResolvable) {
		const guildId = resolveGuildId(guildIdResolvable)
		const guild = this.client.guilds.cache.get(guildId)
		if (!guild) return

		const guildSettings = this.client.database.get(guild.id)!
		const station = this.resolveStation<true>(stationResolvable)
		const voiceChannel = guild.channels.cache.find((c): c is VoiceChannel => c.id === guildSettings?.voiceChannelId)
		if (!voiceChannel) return

		const resolvedURL = await resolveURL(station.url)
		if (!resolvedURL) return

		await this.safePlay(voiceChannel, resolvedURL, true)
		if (guildSettings.stationURL !== station.url)
			this.client.database.set(guild.id, { ...guildSettings, stationURL: station.url })
	}

	public async getCurrentTrackTitle(guildIdResolvable: TGuildIdResolvable) {
		const guildId = resolveGuildId(guildIdResolvable)
		const guild = this.client.guilds.cache.get(guildId)
		if (!guild) return

		const guildSettings = this.client.database.get(guild.id)
		if (!guildSettings?.stationURL) return

		const resolvedURL = await resolveURL(guildSettings.stationURL)
		if (!resolvedURL) return null

		const parser = new Parser({
			autoUpdate: true,
			keepListen: false,
			url: resolvedURL
		})

		return new Promise<string | null>(resolve => {
			parser.once('metadata', m => resolve(m.get('StreamTitle') ?? null))
			parser.once('error', () => resolve(null))
			parser.once('empty', () => resolve(null))
		})
	}

	public resolveStation<Choice extends boolean = false>(
		stationResolvable: TStationResolvable
	): TChoiceStation<Choice> {
		if (isStationData(stationResolvable)) return stationResolvable as TChoiceStation<Choice>
		if (isURL(stationResolvable))
			return this._stations.find(s => s.url === stationResolvable) as TChoiceStation<Choice>
		return (
			(this._stations.find(s => s.name === stationResolvable) as TChoiceStation<Choice>) ??
			(this._stations.get(stationResolvable) as TChoiceStation<Choice>)
		)
	}

	private async _launch() {
		await this.extractors.loadDefault()

		const allGuildSettings = this.client.database.getAll()
		if (!allGuildSettings.size) return

		for (const guild of this.client.guilds.cache.values()) {
			const guildSettings = allGuildSettings.get(guild.id)!
			const { stationURL, voiceChannelId } = guildSettings
			if (!stationURL || !voiceChannelId) continue

			const voiceChannel = guild.channels.cache.find((c): c is VoiceChannel => c.id === voiceChannelId)
			if (!voiceChannel) continue

			const resolvedURL = await resolveURL(stationURL)
			if (resolvedURL) void this.safePlay(voiceChannel, resolvedURL, true)
		}
	}

	private _fetch() {
		if (!isFolderValid(this.stationFolderPath)) return

		for (const stationFile of readdirSync(this.stationFolderPath)) {
			const stationFilePath = join(this.stationFolderPath, stationFile)
			if (!isValidJSON(stationFilePath)) continue

			const station = importJSON<IStationData>(stationFilePath)
			this._stations.set(stationFile.split('.')[0], station)
		}
	}

	private _translateAllStations() {
		for (const localeCode of this.client.locales.allowed) {
			const locale = this.client.locales.resolve(localeCode)
			const localizedStationCollection = new Collection<string, IStationData>()
			for (const [stationName, station] of this._stations.entries()) {
				localizedStationCollection.set(stationName, {
					...station,
					description: locale.get(station.description) ?? station.description
				})
			}

			this._localized.set(localeCode, localizedStationCollection)
		}
	}
}
