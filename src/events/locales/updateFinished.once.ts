import type { Griza } from '../../core/Griza.js'

export const event = async (client: Griza<true>) => {
	const updateFinishedMessage = client.locales.default.get('LOCALES_UPDATE_FINISHED') ?? 'LOCALES_UPDATE_FINISHED'
	client.logger.info(updateFinishedMessage)
}
