import type { Griza } from '../../core/Griza.js'
import type { ICommand } from '../../types/default.js'

export const createCommand = (client: Griza) => {
	return {
		name: 'help',
		description: 'HELP_COMMAND_DESCRIPTION',
		category: 'info',
		async run({ client, translate, interaction, settings }) {
			await interaction.deferReply()

			const possibleCommandCategories = new Set<string>()
			const commands = client.commands.getAll(settings.locale)

			for (const command of commands.values()) {
				possibleCommandCategories.add(command.category)
			}

			const commandGroups = Array.from(possibleCommandCategories.values())

			const helpMessage =
				`${translate('HELP_COMMAND_ONLY_ADMIN', {
					'{ADMIN_CATEGORY}': translate('COMMAND_GROUP_ADMIN')
				})}\n\n` +
				commandGroups
					.map(ctg => {
						const lowerReplyEmoji = '<:lower_reply:1145717053249028116>'
						const middleReplyEmoji = '<:middle_reply:1145717054872236082>'
						const getReplySign = (index: number, max: number) =>
							index === max ? lowerReplyEmoji : middleReplyEmoji

						const commandGroupName = translate(`COMMAND_GROUP_${ctg.toUpperCase()}`)
						const commandGroup = commands.filter(c => c.category === ctg).map(c => c)

						return (
							`**${commandGroupName}**\n` +
							commandGroup
								.map((c, i) => `${getReplySign(i, commandGroup.length - 1)} **\`/${c.name}\`**`)
								.join('\n')
						)
					})
					.join('\n\n')

			return interaction.followUp({
				embeds: [
					{
						color: 0xfade2b,
						description: helpMessage
					}
				]
			})
		}
	} as ICommand
}
