import type { Griza } from '../../core/Griza.js'
import type { ICommand } from '../../types/default.js'

export const createCommand = (client: Griza) => {
	return {
		name: 'now-playing',
		description: 'NOW_PLAYING_COMMAND_DESCRIPTION',
		category: 'radio',
		async run({ client, translate, interaction, settings }) {
			const queue = client.radio.queues.get(interaction.guild!.id)
			const station = client.radio.resolveStation(settings.stationURL!)

			await interaction.deferReply()

			if (!station) {
				const warningMessage = translate('NOW_PLAYING_COMMAND_WARNING_INVALID_STATION')
				return interaction.followUp({ embeds: [{ color: 0xfade2b, description: warningMessage }] })
			}

			if (settings.stationURL === null) {
				const description = translate('NOW_PLAYING_COMMAND_WARNING_NOT_SET')
				return interaction.followUp({ embeds: [{ color: 0xfade2b, description }] })
			}

			if (!queue?.currentTrack) {
				const warningMessage = translate('NOW_PLAYING_COMMAND_WARNING_NOT_PLAYING')
				return interaction.followUp({ embeds: [{ color: 0xfade2b, description: warningMessage }] })
			}

			const trackTitle = await client.radio.getCurrentTrackTitle(interaction)
			if (!trackTitle) {
				const errorMessage = translate('NOW_PLAYING_COMMAND_ERROR')
				return interaction.followUp({ embeds: [{ color: 0xfade2b, description: errorMessage }] })
			}

			const description = translate('NOW_PLAYING_COMMAND_CURRENT_TRACK', {
				'{STATION_NAME}': station.name,
				'{TRACK}': trackTitle
			})

			return interaction.followUp({ embeds: [{ color: 0x39ff84, description, thumbnail: { url: station.logo } }] })
		}
	} as ICommand
}
