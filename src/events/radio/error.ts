import type { Griza } from '../../core/Griza.js'

export const event = async (client: Griza<true>, _: never, error: Error) => {
	client.logger.error(error)
}
