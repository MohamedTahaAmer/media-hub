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
	app.listen(PORT, HOST, () => {
		console.log(`Server is running on http://${HOST}:${PORT}`)
	})
}
