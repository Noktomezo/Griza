import { ApplicationCommandOptionType } from 'discord.js'
import type { Griza } from '../../core/Griza.js'
import type { ICommand } from '../../types/default.js'

export const createCommand = (client: Griza) => {
	return {
		name: 'change',
		description: 'CHANGE_COMMAND_DESCRIPTION',
		category: 'radio',
		options: [
			{
				name: 'station',
				type: ApplicationCommandOptionType.String,
				choices: client.radio.stations.map(s => ({ name: `${s.emoji} ${s.name}`, value: s.url })),
				required: true,
				description: 'CHANGE_COMMAND_OPTION_STATION_DESCRIPTION'
			}
		],
		async run({ client, translate, interaction, settings }) {
			const stationURL = interaction.options.getString('station', true)
			const queue = client.radio.queues.get(interaction.guildId!)
			const station = client.radio.resolveStation(stationURL)

			await interaction.deferReply()

			if (!station) {
				const warningMessage = translate('CHANGE_COMMAND_WARNING_INVALID_STATION')
				return interaction.editReply({ embeds: [{ color: 0xfade2b, description: warningMessage }] })
			}

			if (settings.stationURL === null && settings.voiceChannelId === null) {
				const warningMessage = translate('CHANGE_COMMAND_WARNING_NOT_SET')
				return interaction.editReply({ embeds: [{ color: 0xfade2b, description: warningMessage }] })
			}

			if (!queue?.channel?.members.has(interaction.user.id)) {
				const warningMessage = translate('CHANGE_COMMAND_WARNING_NOT_IN_CHANNEL')
				return interaction.editReply({ embeds: [{ color: 0xfade2b, description: warningMessage }] })
			}

			if (settings.stationURL === stationURL) {
				const warningMessage = translate('CHANGE_COMMAND_WARNING_SAME_STATION')
				return interaction.editReply({ embeds: [{ color: 0xfade2b, description: warningMessage }] })
			}

			try {
				await client.radio.change(interaction, station)

				const successMessage = translate('CHANGE_COMMAND_SUCCESS', { '{STATION}': station.name })
				return await interaction.editReply({ embeds: [{ color: 0x39ff84, description: successMessage }] })
			} catch (error: unknown) {
				client.logger.error(error)

				const errorMessage = translate('CHANGE_COMMAND_ERROR')
				return interaction.editReply({ embeds: [{ color: 0xff1f4f, description: errorMessage }] })
			}
		}
	} as ICommand
}
