import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ClusterManager } from 'discord-hybrid-sharding'
import { env } from './env.js'

const manager = new ClusterManager(`${dirname(fileURLToPath(import.meta.url))}/index.js`, {
	totalShards: 'auto',
	shardsPerClusters: 2,
	mode: 'process',
	token: env.DISCORD_TOKEN
})

await manager.spawn({ timeout: -1 })
