import type { Collection } from 'discord.js'
import type { Griza } from '../../core/Griza.js'
import type { ICommand } from '../../types/default.js'

export const createCommand = (client: Griza) => {
	return {
		name: 'help',
		description: 'HELP_COMMAND_DESCRIPTION',
		category: 'info',
		async run({ client, translate, interaction, settings }) {
			await interaction.deferReply()

			const commandCollection = client.commands.getAll(settings.locale)
			const commandCategories = Array.from(commandCollection.values()).map(c => c.category)
			const possibleCommandCategories = new Set<string>(commandCategories)

			const commandGroups = Array.from(possibleCommandCategories.values())
			const adminGroupName = translate('COMMAND_GROUP_ADMIN')
			const infoMessage = translate('HELP_COMMAND_WARNING_ADMIN_ONLY', { '{ADMIN_CATEGORY}': adminGroupName })

			const helpMessage =
				`${infoMessage}\n\n` +
				commandGroups
					.map(ctg => {
						const lowerEmoji = '<:lower_reply:1145717053249028116>'
						const middleEmoji = '<:middle_reply:1145717054872236082>'
						const getSign = <V, K>(v: V, c: Collection<K, V>) => (v === c.at(-1) ? lowerEmoji : middleEmoji)

						const commandGroupName = translate(`COMMAND_GROUP_${ctg.toUpperCase()}`)
						const commandGroup = commandCollection.filter(c => c.category === ctg)

						return (
							`**${commandGroupName}**\n` +
							commandGroup.map((v, _, c) => `${getSign(v, c)}**\`/${v.name}\`**`).join('\n')
						)
					})
					.join('\n\n')

			return interaction.followUp({ embeds: [{ color: 0xfade2b, description: helpMessage }] })
		}
	} as ICommand
}
