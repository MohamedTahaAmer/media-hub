import { startServer } from "~/proxy-server/proxy-server"
import { globalCache } from "./global-this"

export function startProxyServer() {
	if (globalCache.startedProxyServer) return
	console.log("\x1b[1;33m%s\x1b[1;36m", "Starting the Express Proxy Server...")
	let server = startServer()

	function handleServerClose() {
		console.log("\x1b[1;32m%s\x1b[1;36m", "Will Close the Express Proxy Server")
		// -- this is to close the Express server when the process is terminated
		server.close()
		// -- this is to close the process 'which will close the next.js server'
		process.exit(0)
	}
	process.on("SIGINT", handleServerClose)
	process.on("SIGTERM", handleServerClose)

	globalCache.startedProxyServer = true
}
