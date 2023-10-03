import { PermissionFlagsBits, type Interaction } from 'discord.js'
import type { Griza } from '../../core/Griza.js'

export const event = async (client: Griza, interaction: Interaction) => {
	if (!interaction.isChatInputCommand() || !interaction.guild) return

	const settings = client.database.get(interaction.guild.id)
	const translate = (translatable: string, replaceable: Record<string, string> = {}) =>
		client.locales.translate(settings.locale, translatable, replaceable)

	const command = client.commands.get(interaction.commandName, settings.locale)
	if (!command) return

	if (command.category === 'admin' && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
		const warningMessage = translate('INTERACTION_CREATE_EVENT_WARNING_ADMIN_ONLY')
		await interaction.reply({ embeds: [{ color: 0xfade2b, description: warningMessage }], ephemeral: true })
		return
	}

	command.run({ client, interaction, translate, settings })
}
