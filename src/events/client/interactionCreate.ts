import type { Interaction } from 'discord.js'
import type { Griza } from '../../core/Griza.js'

export const event = async (client: Griza, interaction: Interaction) => {
	if (!interaction.isChatInputCommand() || !interaction.guild) return

	const settings = client.database.get(interaction.guild.id)
	const translate = (translatable: string, replaceable: Record<string, string> = {}) =>
		client.locales.translate(settings.locale, translatable, replaceable)

	const command = client.commands.get(interaction.commandName, settings.locale)
	if (command) command.run({ client, interaction, translate, settings })
}
