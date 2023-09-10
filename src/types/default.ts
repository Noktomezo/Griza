import type {
	ClientOptions,
	Guild,
	GuildTextBasedChannel,
	Interaction,
	LocaleString,
	Snowflake,
	VoiceBasedChannel,
	GuildMember,
	Message,
	VoiceState,
	ChatInputApplicationCommandData,
	Collection,
	ChatInputCommandInteraction
} from 'discord.js'
import type { Griza } from '../core/Griza.js'
import type { TimeZoneString, If } from './utils.js'

export interface IGrizaOptions extends ClientOptions {
	defaultLocale: LocaleString
	mongoConnectionURL: string
	timeZone: TimeZoneString
}

export interface IGuildSettings {
	commandChannelId: Snowflake | null
	locale: TLocaleCode
	stationURL: string | null
	voiceChannelId: Snowflake | null
}

export interface IStationData {
	description: string
	emoji: string
	logo: string
	name: string
	url: string
}

export interface ICommand extends ChatInputApplicationCommandData {
	category: string
	run(options: ICommandRunOptions): void
}

export interface ICommandRunOptions {
	client: Griza
	interaction: ChatInputCommandInteraction
	settings: IGuildSettings
	translate: TTranslateFunction
}

export interface IDatabaseEvents {
	'updateFinished'(): void
	'updateStarted'(): void
}

export interface ILocaleManagerEvents {
	'fetchFinished'(): void
	'fetchStarted'(): void
	'updateFinished'(): void
	'updateStarted'(): void
}

export type TStationSettings = {
	[K in Exclude<keyof IGuildSettings, 'commandChannelId' | 'locale'>]: NonNullable<IGuildSettings[K]>
} & {
	commandChannelId: IGuildSettings['commandChannelId']
}

export type TChoiceStation<Choice extends boolean> = If<Choice, IStationData, IStationData | undefined>

export type TStationResolvable = IStationData | string

export type TStationCollection = Collection<string, IStationData>

export type TLocalizedStationCollections = Collection<TLocaleCode, TStationCollection>

export type TEventFunction = (client: Griza, ...args: unknown[]) => void

export type TCreateCommandFunction = (client: Griza) => ICommand

export type TCommandCollection = Collection<string, ICommand>

export type TLocalizedCommandCollections = Collection<LocaleString, TCommandCollection>

export type TTranslateFunction = (translatable: string, replaceable?: Record<string, string>) => string

export type TLocaleCode = LocaleString

export type TLocaleJSON = Record<string, string>

export type TLocaleMap = Map<string, string>

export type TLocaleResolvable = TGuildIdResolvable | TLocaleCode | TLocaleJSON | TLocaleMap

export type TGuildIdResolvable =
	| Guild
	| GuildMember
	| GuildTextBasedChannel
	| Interaction
	| Message
	| Snowflake
	| VoiceBasedChannel
	| VoiceState
	| string
