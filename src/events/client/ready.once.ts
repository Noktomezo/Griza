import type { Griza } from '../../core/Griza.js'

export const event = async (client: Griza<true>) => {
	const loggedInMessage = client.locales.default.get('READY_EVENT_LOGGED_IN') ?? 'READY_EVENT_LOGGED_IN'
	client.logger.info(loggedInMessage.replace('{CLIENT_USER}', client.user.tag))
}
