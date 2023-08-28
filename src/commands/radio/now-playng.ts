import type { Griza } from '../../core/Griza.js'
import type { ICommand } from '../../types/default.js'

export const createCommand = (client: Griza) => {
	return {
		name: 'now-playing',
		description: 'NOW_PLAYING_COMMAND_DESCRIPTION',
		category: 'radio',
		async run({ client, translate, interaction, settings }) {
			await interaction.deferReply()

			const queue = client.radio.queues.get(interaction.guild!.id)

			if (settings.stationURL === null) {
				await interaction.followUp({
					embeds: [
						{
							color: 0xfade2b,
							description: translate('CHANGE_COMMAND_WARNING_NOT_SET')
						}
					]
				})

				return
			}

			if (!queue?.currentTrack) {
				await interaction.followUp({
					embeds: [
						{
							color: 0xfade2b,
							description: translate('NOW_PLAYING_COMMAND_NOTHING_PLAYING')
						}
					]
				})
				return
			}

			const currentStation = client.radio.resolveStation<true>(settings.stationURL!)
			const currentTrackTitle = await client.radio.getCurrentTrackTitle(interaction)
			if (!currentTrackTitle) {
				await interaction.followUp({
					embeds: [
						{
							color: 0xfade2b,
							description: translate('NOW_PLAYING_COMMAND_ERROR')
						}
					]
				})
				return
			}

			await interaction.followUp({
				embeds: [
					{
						color: 0x39ff84,
						description: translate('NOW_PLAYING_COMMAND_CURRENT_TRACK', {
							'{STATION_NAME}': currentStation.name,
							'{TRACK}': currentTrackTitle
						}),
						thumbnail: {
							url: currentStation.logo
						}
					}
				]
			})
		}
	} as ICommand
}
