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

			const response = await interaction.followUp({
				embeds: [
					{
						color: 0xfade2b,
						description: translate('LANGUAGE_COMMAND_CHOOSE')
					}
				],
				components: [row]
			})

			try {
				const filter = (i: Interaction) => i.isButton() && i.user.id === interaction.user.id
				const confirmation = await response.awaitMessageComponent({ filter, time: 30_000 })
				const locale = client.locales.resolve(confirmation.customId)
				const localeName = locale.get('LANGUAGE_LABEL')!
				const translated = locale.get('LANGUAGE_COMMAND_CHANGE_SUCCESS')!
				client.database.set(interaction.guild!.id, { ...settings, locale: confirmation.customId as TLocaleCode })
				await interaction.editReply({
					embeds: [
						{
							color: 0x39ff84,
							description: translated.replace('{LANGUAGE}', localeName)
						}
					],
					components: []
				})

				await client.commands.updateGuildCommands(interaction)
			} catch {
				await interaction.editReply({
					embeds: [
						{
							color: 0xff1f4f,
							description: translate('LANGUAGE_COMMAND_CHOOSE_TIMEOUT')
						}
					],
					components: []
				})
			}
		}
	} as ICommand
}
