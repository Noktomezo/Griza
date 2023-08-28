import type { Griza } from '../../core/Griza.js'
import type { ICommand } from '../../types/default.js'

export const createCommand = (client: Griza) => {
	return {
		name: 'reset',
		description: 'RESET_COMMAND_DESCRIPTION',
		category: 'admin',
		async run({ client, translate, interaction, settings }) {
			await interaction.deferReply()

			if (!settings.stationURL || !settings.voiceChannelId) {
				await interaction.followUp({
					embeds: [
						{
							color: 0xfade2b,
							description: translate('RESET_COMMAND_WARNING_NOT_SET_YET')
						}
					]
				})

				return
			}

			client.radio.reset(interaction)
			await interaction.followUp({
				embeds: [
					{
						color: 0x39ff84,
						description: translate('RESET_COMMAND_SUCCESS')
					}
				]
			})
		}
	} as ICommand
}
