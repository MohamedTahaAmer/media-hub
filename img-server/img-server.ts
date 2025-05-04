import { getLocalIpAddress } from "@/utils"
import express from "express"
import path from "path"

const app = express()
let __dirname = path.dirname(new URL(import.meta.url).pathname)
export const PORT = 3001
let HOST = await getLocalIpAddress()

const imagesDirectory = path.join(__dirname, "thumbnails")
app.use(express.static(imagesDirectory))

app.get("/", (req, res) => {
	res.send("Image server is running. Access images by navigating to /image.jpg")
})
export function startServer() {
	const server = app.listen(PORT, HOST, () => {
		console.log(`Server is running on http://${HOST}:${PORT}`)
	})
	server.on("error", (error) => {
		if (error.code === "EADDRINUSE") {
			console.error(`Port ${PORT} is already in use. Please choose another port.`)
		} else {
			console.error("\x1b[1;31m%s\x1b[1;36m", error.message)
		}
	})
	server.on("close", () => {
		console.log("\x1b[1;33m%s\x1b[1;36m", "Images Server is closing...")
	})
	return server
}
