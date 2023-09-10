import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { Collection } from 'discord.js'
import type { Snowflake } from 'discord.js'
import { TypedEmitter } from 'tiny-typed-emitter'
import type {
	ILocaleManagerEvents,
	TLocaleJSON,
	TLocaleMap,
	TLocaleResolvable,
	TLocaleCode
} from '../../types/default.js'
import { isLocaleCode, isLocaleJSON, isLocaleMap } from '../../types/guards.js'
import type { Griza } from '../Griza.js'
import { importJSON, isFolderValid, isValidJSON, jsonToMap, resolveGuildId } from '../utils/Utils.js'

export class LocaleManager extends TypedEmitter<ILocaleManagerEvents> {
	private readonly _locales: Collection<TLocaleCode, TLocaleMap>

	private readonly _cache: Collection<Snowflake, TLocaleMap>

	private _default: TLocaleMap | null

	public constructor(
		public client: Griza,
		public folder: string,
		public defaultLocale: TLocaleCode = 'en-US'
	) {
		super()
		this._locales = new Collection<TLocaleCode, TLocaleMap>()
		this._cache = new Collection<Snowflake, TLocaleMap>()
		this._default = null

		this._fetch()
		this.client.database.once('updateFinished', () => this._update())
	}

	public get allowed() {
		return [...this._locales.keys()]
	}

	public resolve(resolvable?: TLocaleResolvable): TLocaleMap {
		if (!resolvable) return this.default
		if (isLocaleCode(resolvable)) return this._locales.get(resolvable) as TLocaleMap
		if (isLocaleJSON(resolvable)) return jsonToMap(resolvable)
		if (isLocaleMap(resolvable)) return resolvable

		const guildId = resolveGuildId(resolvable)
		return this._cache.get(guildId) ?? this.default
	}

	public resolveCode(resolvable?: TLocaleResolvable): TLocaleCode {
		const locale = this.resolve(resolvable)
		return this._locales.findKey(v => v === locale) ?? 'en-US'
	}

	public translate(localeLike: TLocaleResolvable, translatable: string, replaceable: Record<string, string> = {}) {
		const locale = this.resolve(localeLike)
		const translated = locale.get(translatable) ?? translatable
		if (replaceable) {
			let finalText = translated

			for (const key in replaceable) {
				if (Object.hasOwn(replaceable, key)) {
					const value = replaceable[key]
					const replacePattern = new RegExp(key, 'g')
					finalText = finalText.replace(replacePattern, value)
				}
			}

			return finalText
		}

		return translated
	}

	public _fetch() {
		if (!isFolderValid(this.folder)) return
		this.emit('fetchStarted')

		for (const localeFile of readdirSync(this.folder)) {
			const localeFilePath = join(this.folder, localeFile)
			const localeFileName = localeFile.split('.')[0]
			if (!isValidJSON(localeFilePath) || !isLocaleCode(localeFileName)) continue

			const locale = importJSON<TLocaleJSON>(localeFilePath)
			const localeMap = jsonToMap(locale)
			this._locales.set(localeFileName, localeMap)
		}

		this._default = this._locales.get(this.defaultLocale) as TLocaleMap
		this.emit('fetchFinished')
	}

	public _update() {
		this.emit('updateStarted')

		for (const [guildId, guildSettings] of this.client.database.getAll()) {
			const guildLocale = this.resolve(guildSettings.locale)
			this._cache.set(guildId, guildLocale)
		}

		this.emit('updateFinished')
	}

	public get default() {
		return this._default as TLocaleMap
	}
}
