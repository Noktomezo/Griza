import type { Griza } from '../../core/Griza.js'

export const event = async (client: Griza<true>) => {
	const loggedInMessage = client.locales.default.get('LOGGED_IN') ?? 'LOGGED_IN'
	client.logger.info(loggedInMessage.replace('{CLIENT_USER}', client.user.tag))
}
