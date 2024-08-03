import { env } from "@/env"
import fs from "fs"
import path from "path"

export async function GET(req: Request, { params }: { params: { dir: string } }) {
	try {
		const fullPath = path.join(env.ROOT_DIR, params.dir)
		await fs.promises.access(fullPath, fs.constants.F_OK)
		const fileStream = await fs.promises.readFile(fullPath)
		let fileName = encodeURIComponent(path.basename(fullPath))
		return new Response(fileStream, {
			status: 200,
			headers: new Headers({
				"content-type": "application/octet-stream",
				"Content-Disposition": `attachment; filename="${fileName}"`,
			}),
		})
	} catch (error) {
		console.error(error)
		return new Response("File Not Found", { status: 404 })
	}
}
