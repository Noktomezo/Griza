import type { ButtonInteraction, Interaction } from 'discord.js'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import type { Griza } from '../../core/Griza.js'
import type { ICommand, TLocaleCode } from '../../types/default.js'

export const createCommand = (client: Griza) => {
	return {
		name: 'language',
		description: 'LANGUAGE_COMMAND_DESCRIPTION',
		category: 'admin',
		async run({ client, translate, interaction, settings }) {
			await interaction.deferReply()
			const currentLocale = client.locales.resolve(settings.locale)

			const buttons = client.locales.allowed.map(localeCode => {
				const locale = client.locales.resolve(localeCode)
				const localeFlag = locale.get('LANGUAGE_FLAG')!
				const localeName = locale.get('LANGUAGE_LABEL')!
				const isDisabled = locale === currentLocale

				return new ButtonBuilder()
					.setEmoji(localeFlag)
					.setLabel(localeName)
					.setStyle(isDisabled ? ButtonStyle.Secondary : ButtonStyle.Primary)
					.setDisabled(isDisabled)
					.setCustomId(localeCode)
			})

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)
			const chooseMessage = translate('LANGUAGE_COMMAND_CHOOSE')
			const response = await interaction.followUp({
				embeds: [{ color: 0xfade2b, description: chooseMessage }],
				components: [row]
			})

			try {
				const filter = (i: Interaction) => i.isButton() && i.user.id === interaction.user.id
				const confirmation = await response.awaitMessageComponent({ filter, time: 30_000 })

				const newLocaleCode = confirmation.customId as TLocaleCode
				const newLocale = client.locales.resolve(newLocaleCode)
				const newLocaleName = newLocale.get('LANGUAGE_LABEL') ?? 'LANGUAGE_LABEL'
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

				const successMessage = message.replace('{LANGUAGE}', newLocaleName)
				await interaction.editReply({ embeds: [{ color: 0x39ff84, description: successMessage }], components: [] })
			} catch {
				const errorMessage = translate('LANGUAGE_COMMAND_CHOOSE_TIMEOUT')
				await interaction.editReply({ embeds: [{ color: 0xff1f4f, description: errorMessage }], components: [] })
			}
		}
	} as ICommand
}
