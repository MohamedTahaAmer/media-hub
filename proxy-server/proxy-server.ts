import express from "express"
import https from "https"
import fs from "fs"
import path from "path"
import { getLocalIpAddress } from "../src/utils"
import { createProxyMiddleware } from "http-proxy-middleware"

let __dirname = path.dirname(new URL(import.meta.url).pathname)
console.log("\x1b[1;32m%s\x1b[1;36m", `__dirname: ${__dirname}`)
const options = {
	key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
	cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
}

const app = express()
const PORT = 3002
const HOST = await getLocalIpAddress()

const proxy = createProxyMiddleware({
	target: "http://localhost:3000",
	changeOrigin: true,
	ws: false,
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.use("/", proxy)

export function startServer() {
	let server = https.createServer(options, app).listen(PORT, HOST, () => {
		console.log("\x1b[1;33m%s\x1b[1;36m", `Server is running on https://${HOST}:${PORT}`)
	})
	server.on("error", (error) => {
		if (error.code === "EADDRINUSE") {
			console.error(`Port ${PORT} is already in use. Please choose another port.`)
		} else {
			console.error("\x1b[1;31m%s\x1b[1;36m", error.message)
		}
	})
	server.on("close", () => {
		console.log("\x1b[1;33m%s\x1b[1;36m", "Proxy Server is closing...")
	})
	return server
}
