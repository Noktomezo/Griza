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
				const warningMessage = translate('RESET_COMMAND_WARNING_NOT_SET_YET')
				return interaction.followUp({ embeds: [{ color: 0xfade2b, description: warningMessage }] })
			}

			try {
				await client.radio.reset(interaction)

				const successMessage = translate('RESET_COMMAND_SUCCESS')
				return await interaction.followUp({ embeds: [{ color: 0x39ff84, description: successMessage }] })
			} catch (error) {
				client.logger.error(error)

				const errorMessage = translate('RESET_COMMAND_ERROR')
				return await interaction.followUp({ embeds: [{ color: 0xff1f4f, description: errorMessage }] })
			}
		}
	} as ICommand
}
