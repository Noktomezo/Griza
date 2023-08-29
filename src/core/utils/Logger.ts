import colors from 'colors'
import { getCurrentTime } from './Utils.js'

export class Logger {
	private readonly ip: string

	private readonly wp: string

	private readonly ep: string

	public constructor() {
		this.ip = `${colors.magenta('Info')}`
		this.wp = `${colors.yellow('Warning')}`
		this.ep = `${colors.red('Error')}`
	}

	public info(message: string | unknown) {
		if (message) {
			console.log(this._parseStrings(message, this.ip, 'info'))
		}
	}

	public warn(message: unknown[]) {
		if (message) {
			console.log(this._parseStrings(message, this.wp, 'warn'))
		}
	}

	public error(error: unknown) {
		if (error) {
			console.log(this._parseStrings(error, this.ep, 'error'))
		}
	}

	private _parseStrings(message: any, prefix: string, type: 'error' | 'info' | 'warn' = 'info'): string {
		const color = type === 'error' ? colors.red : type === 'warn' ? colors.yellow : colors.green

		const time = getCurrentTime()
		if (typeof message === 'string') return `[${time}] [${prefix}]: ${color(message)}`
		const splitStrings = JSON.stringify(message.stack ?? message, null, 4).split('\n')
		return splitStrings.map(str => `[${time}] [${prefix}]: ${color(str)}`).join('\n')
	}
}
