import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { ApplicationCommandOptionType, ChannelType } from 'discord.js'
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
		name: 'setup',
		description: 'SETUP_COMMAND_DESCRIPTION',
		category: 'admin',
		options: [
			{
				name: 'voice-channel',
				type: ApplicationCommandOptionType.Channel,
				channelTypes: [ChannelType.GuildVoice],
				required: true,
				description: 'SETUP_COMMAND_OPTION_VOICE_CHANNEL_DESCRIPTION'
			},
			{
				name: 'station',
				type: ApplicationCommandOptionType.String,
				choices: fetchStations().map(s => ({ name: `${s.emoji} ${s.name}`, value: s.url })),
				required: false,
				description: 'SETUP_COMMAND_OPTION_STATION_DESCRIPTION'
			},
			{
				name: 'text-channel',
				type: ApplicationCommandOptionType.Channel,
				channelTypes: [ChannelType.GuildText],
				required: false,
				description: 'SETUP_COMMAND_OPTION_TEXT_CHANNEL_DESCRIPTION'
			}
		],
		async run({ client, translate, interaction, settings }) {
			const voiceChannel = interaction.options.getChannel<ChannelType.GuildVoice>('voice-channel', true)
			const textChannel = interaction.options.getChannel<ChannelType.GuildText>('text-channel', false)
			const stationURL = interaction.options.getString('station', false)
			const isStationRandom = stationURL !== null
			const randomStation = client.radio.stations[Math.floor(Math.random() * client.radio.stations.length)]
			const station = isStationRandom ? client.radio.resolveStation<true>(stationURL) : randomStation

			await interaction.deferReply()

			if (settings.voiceChannelId && settings.stationURL) {
				await interaction.followUp({
					embeds: [
						{
							color: 0xfade2b,
							description: translate('SETUP_COMMAND_WARNING_ALREADY_SET')
						}
					]
				})

				return
			}

			try {
				await client.radio.set(interaction, {
					voiceChannelId: voiceChannel.id,
					stationURL: isStationRandom ? randomStation.url : station.url,
					textChannelId: textChannel?.id ?? interaction.channel!.id
				})

				await interaction.followUp({
					embeds: [
						{
							color: 0x39ff84,
							description: translate('SETUP_COMMAND_SUCCESS', {
								'{VOICE_CHANNEL}': `<#${voiceChannel.id}>`,
								'{STATION}': isStationRandom ? randomStation.name : station.name
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
							description: translate('SETUP_COMMAND_ERROR')
						}
					]
				})
			}
		}
	} as ICommand
}
