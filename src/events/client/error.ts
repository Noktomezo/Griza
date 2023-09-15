import type { DiscordAPIError } from 'discord.js'
import type { Griza } from '../../core/Griza.js'

export const event = async (client: Griza<true>, error: DiscordAPIError) => {
	client.logger.error(error)
}
