import { startServer } from "~/img-server/img-server"
import { globalCache } from "./global-this"

export function startImgServer() {
	if (globalCache.startedImgServer) return
	console.log("\x1b[1;33m%s\x1b[1;36m", "Starting image server...")
	startServer()
	globalCache.startedImgServer = true
}
