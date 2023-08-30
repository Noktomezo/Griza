import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Collection } from 'discord.js'
import type {
	ICommand,
	TLocaleCode,
	TCommandCollection,
	TGuildIdResolvable,
	TCreateCommandFunction
} from '../../types/default.js'
import type { Griza } from '../Griza.js'
import { isFileValid, isFolderValid, resolveGuildId } from '../utils/Utils.js'

export class CommandManager {
	private readonly _commands: Collection<string, ICommand>

	private readonly _localized: Collection<TLocaleCode, TCommandCollection>

	public constructor(
		public client: Griza,
		public commandFolderPath: string
	) {
		this._commands = new Collection<string, ICommand>()
		this._localized = new Collection<TLocaleCode, TCommandCollection>()

		this.client.locales.once('updateFinished', async () => {
			await this._fetch()
			await this._translateCommands()
			await this.updateGuildCommands()
		})
	}

	public get(commandName: string, localeCode: TLocaleCode = 'en-US') {
		return this._localized.get(localeCode)!.get(commandName) as ICommand
	}

	public getAll(localeCode: TLocaleCode = 'en-US') {
		return this._localized.get(localeCode)!.clone()
	}

	public getAllRaw() {
		return this._commands.clone()
	}

	private async _fetch() {
		if (!isFolderValid(this.commandFolderPath)) return

		for (const categoryFolder of readdirSync(this.commandFolderPath)) {
			const categoryFolderPath = join(this.commandFolderPath, categoryFolder)
			if (!isFolderValid(categoryFolderPath)) continue

			for (const commandFile of readdirSync(categoryFolderPath)) {
				const commandFilePath = join(categoryFolderPath, commandFile)
				if (!isFileValid(commandFilePath)) continue

				const commandFileURL = pathToFileURL(commandFilePath).toString()
				const { createCommand }: { createCommand: TCreateCommandFunction } = await import(commandFileURL)
				const command = createCommand(this.client)
				this._commands.set(command.name, createCommand(this.client))
			}
		}
	}

	public async updateGuildCommands(guildIdResolvable?: TGuildIdResolvable) {
		if (guildIdResolvable) {
			const guildId = resolveGuildId(guildIdResolvable)
			const guild = this.client.guilds.cache.get(guildId)
			if (!guild) return

			const guildSettings = this.client.database.get(guild.id)
			const translatedGuildCommands = this._localized.get(guildSettings.locale)
			if (!translatedGuildCommands?.size) return
			await guild.commands.set([...translatedGuildCommands.values()])
			return
		}

		const allGuildSettings = this.client.database.getAll()
		for (const guild of this.client.guilds.cache.values()) {
			const guildSettings = allGuildSettings.get(guild.id)
			const translatedGuildCommands = this._localized.get(guildSettings!.locale)
			if (!translatedGuildCommands?.size) continue
			await guild.commands.set([...translatedGuildCommands.values()])
		}
	}

	private async _translateCommands() {
		for (const localeCode of this.client.locales.allowed) {
			const locale = this.client.locales.resolve(localeCode)
			const localizedCommandCollection = new Collection<string, ICommand>()
			for (const [cmdName, cmd] of this._commands) {
				localizedCommandCollection.set(cmdName, {
					...cmd,
					description: locale.get(cmd.description) ?? cmd.description,
					options: cmd.options?.map(o => ({ ...o, description: locale.get(o.description) ?? o.description })) ?? []
				})
			}

			this._localized.set(localeCode, localizedCommandCollection)
		}
	}
}
