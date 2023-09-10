import { bold, inlineCode, type Collection } from 'discord.js'
import type { ICommand } from '../../types/default.js'

export const createCommand = () => {
	return {
		name: 'help',
		description: 'HELP_COMMAND_DESCRIPTION',
		category: 'info',
		async run({ client, translate, interaction, settings }) {
			await interaction.deferReply()

			const commandCollection = client.commands.getAll(settings.locale)
			const commandCategories = [...new Set(commandCollection.map(c => c.category))]

			const adminGroupName = translate('COMMAND_GROUP_ADMIN')
			const infoMessage = translate('HELP_COMMAND_WARNING_ADMIN_ONLY', { '{ADMIN_CATEGORY}': adminGroupName })

			const middleReply = '<:middle_reply:1145717054872236082>'
			const lowerReply = '<:lower_reply:1145717053249028116>'

			const getReply = <V, K>(v: V, c: Collection<K, V>) => (v === c.at(-1) ? lowerReply : middleReply)

			const helpMessage = commandCategories
				.map(category => {
					const commandGroupName = bold(translate(`COMMAND_GROUP_${category.toUpperCase()}`))
					const commandGroup = commandCollection.filter(c => c.category === category)

					return (
						`${commandGroupName}\n` +
						commandGroup.map((v, _, c) => `${getReply(v, c)}${bold(inlineCode(`/${v.name}`))}`).join('\n')
					)
				})
				.join('\n\n')

			const finalMessage = `${infoMessage}\n\n${helpMessage}`
			return interaction.followUp({ embeds: [{ color: 0xfade2b, description: finalMessage }] })
		}
	} as ICommand
}
