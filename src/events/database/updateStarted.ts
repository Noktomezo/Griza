import type { Griza } from '../../core/Griza.js'

export const event = async (client: Griza<true>) => {
	const updateStartedMessage = client.locales.default.get('DATABASE_UPDATE_STARTED') ?? 'DATABASE_UPDATE_STARTED'
	client.logger.info(updateStartedMessage)
}
