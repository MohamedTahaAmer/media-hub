import fs from "fs"
import { rootDir } from "@/utils/constants"
import path from "path"

export async function GET(req: Request, { params }: { params: { dir: string } }) {
	try {
		const filePath = decodeURIComponent(params.dir)
		const fullPath = path.join(rootDir, filePath)
		await fs.promises.access(fullPath, fs.constants.F_OK)
		const fileStream = await fs.promises.readFile(fullPath)
		return new Response(fileStream, {
			status: 200,
			headers: new Headers({
				"content-type": "application/octet-stream",
			}),
		})
	} catch (error) {
		console.error(error)
		return new Response("File Not Found", { status: 404 })
	}
}
