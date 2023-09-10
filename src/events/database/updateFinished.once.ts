import type { Griza } from '../../core/Griza.js'

export const event = async (client: Griza<true>) => {
	const updateFinishedMessage = client.locales.default.get('DATABASE_UPDATE_FINISHED') ?? 'DATABASE_UPDATE_FINISHED'
	client.logger.info(updateFinishedMessage)
}
