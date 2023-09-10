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

	public warn(message: string | unknown) {
		if (message) {
			console.log(this._parseStrings(message, this.wp, 'warn'))
		}
	}

	public error(error: unknown) {
		if (error) {
			console.log(this._parseStrings(error, this.ep, 'error'))
		}
	}

	private _parseStrings(obj: any, prefix: string, type: 'error' | 'info' | 'warn' = 'info') {
		const color = type === 'error' ? colors.red : type === 'warn' ? colors.yellow : colors.green

		const time = getCurrentTime()
		if (typeof obj === 'string') return `[${time}] [${prefix}]: ${color(obj)}`
		if (obj instanceof Error && obj.stack)
			return obj.stack
				.split('\n')
				.map(s => `[${time}] [${prefix}]: ${color(s)}`)
				.join('\n')
		const splitStrings = JSON.stringify(obj.stack ?? obj, null, 4).split('\n')
		return splitStrings.map(str => `[${time}] [${prefix}]: ${color(str)}`).join('\n')
	}
}
