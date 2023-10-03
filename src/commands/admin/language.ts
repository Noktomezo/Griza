import { ApplicationCommandOptionType } from 'discord.js'
import type { Griza } from '../../core/Griza.js'
import type { ICommand, TLocaleCode, TLocaleMap } from '../../types/default.js'

const prettify = (locale: TLocaleMap) => `${locale.get('LANGUAGE_FLAG')} ${locale.get('LANGUAGE_LABEL')}`

export const createCommand = (client: Griza) => {
	const locales = client.locales.allowed.map(l => client.locales.resolve(l))

	return {
		name: 'language',
		description: 'LANGUAGE_COMMAND_DESCRIPTION',
		category: 'admin',
		options: [
			{
				name: 'language',
				description: 'LANGUAGE_COMMAND_OPTION_LANGUAGE_DESCRIPTION',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: locales.map(l => ({ name: prettify(l), value: client.locales.resolveCode(l) }))
			}
		],
		async run({ client, translate, interaction, settings }) {
			await interaction.deferReply()

			const newLocaleCode = interaction.options.getString('language', true) as TLocaleCode
			const currentLocale = client.locales.resolve(settings.locale)
			const newLocale = client.locales.resolve(newLocaleCode)

			if (currentLocale === newLocale) {
				const errorMessage = translate('LANGUAGE_COMMAND_ERROR_SAME_LOCALE')
				await interaction.editReply({ embeds: [{ color: 0xff1f4f, description: errorMessage }] })
				return
			}

			const message = newLocale.get('LANGUAGE_COMMAND_CHANGE_SUCCESS') ?? 'LANGUAGE_COMMAND_CHANGE_SUCCESS'
			const newGuildSettings = { ...settings, locale: newLocaleCode }
			await client.database.set(interaction.guild!.id, newGuildSettings)

			const newLocaleCommands = client.commands.getAll(newLocaleCode)
			for (const newLocaleCommand of newLocaleCommands.values()) {
				const oldLocaleCommand = interaction.guild!.commands.cache.find(c => c.name === newLocaleCommand.name)
				if (!oldLocaleCommand) continue
				void interaction.guild!.commands.edit(oldLocaleCommand, {
					description: newLocaleCommand.description,
					options: newLocaleCommand.options ?? []
				})
			}

			const successMessage = message.replace('{LANGUAGE}', newLocale.get('LANGUAGE_LABEL')!)
			await interaction.editReply({ embeds: [{ color: 0x39ff84, description: successMessage }], components: [] })
		}
	} as ICommand
}
