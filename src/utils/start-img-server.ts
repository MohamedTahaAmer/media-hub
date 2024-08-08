import { startServer } from "~/img-server/img-server"
import { globalCache } from "./global-this"

export function startImgServer() {
	if (globalCache.startedImgServer) return
	console.log("\x1b[1;33m%s\x1b[1;36m", "Starting image server...")
	let server = startServer()

	function handleServerClose() {
		console.log("\x1b[1;32m%s\x1b[1;36m", "Will Close the Express Image Server")
		// -- this is to close the Express server when the process is terminated
		server.close()
		// -- this is to close the process 'which will close the next.js server'
		process.exit(0)
	}
	process.on("SIGINT", handleServerClose)
	process.on("SIGTERM", handleServerClose)

	globalCache.startedImgServer = true
}
