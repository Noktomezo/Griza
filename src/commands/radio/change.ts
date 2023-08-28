import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import type { VoiceChannel } from 'discord.js'
import { ApplicationCommandOptionType } from 'discord.js'
import type { Griza } from '../../core/Griza.js'
import { importJSON, isValidJSON } from '../../core/utils/Utils.js'
import type { ICommand, IStationData } from '../../types/default.js'

const fetchStations = () => {
	const stationFolderPath = join(cwd(), 'stations')
	const stationNames = []

	for (const stationFile of readdirSync(stationFolderPath)) {
		const stationFilePath = join(stationFolderPath, stationFile)
		if (!isValidJSON(stationFilePath)) continue

		const station = importJSON<IStationData>(stationFilePath)
		stationNames.push(station)
	}

	return stationNames
}

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
			const station = client.radio.resolveStation<true>(stationURL)

			await interaction.deferReply()

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

			if (settings.stationURL === stationURL) {
				await interaction.followUp({
					embeds: [
						{
							color: 0xfade2b,
							description: translate('CHANGE_COMMAND_WARNING_SAME_STATION')
						}
					]
				})

				return
			}

			try {
				await client.radio.change(interaction, station)
				await interaction.followUp({
					embeds: [
						{
							color: 0x39ff84,
							description: translate('CHANGE_COMMAND_SUCCESS', {
								'{STATION}': station.name
							})
						}
					]
				})
			} catch (error: unknown) {
				client.logger.error(error)
				await interaction.followUp({
					embeds: [
						{
							color: 0xff1f4f,
							description: translate('CHANGE_COMMAND_ERROR')
						}
					]
				})
			}
		}
	} as ICommand
}
