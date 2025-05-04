import { env } from "@/env"
import { promises as fs } from "fs"
import path from "path"

export async function POST(req: Request) {
	const formData = await req.formData()
	const files = formData.getAll("file") as unknown as File[]
	if (!files.length) {
		return new Response(JSON.stringify({ message: "No file(s) uploaded" }), { status: 400 })
	}

	let uploadDir = env.UPLOAD_DIR

	// Ensure the upload directory exists
	await fs.mkdir(uploadDir, { recursive: true })

	for (const file of files) {
		let fileName = file.name
		let filePath = path.join(uploadDir, fileName)
		let fileExtension = path.extname(fileName)
		let fileNameWithoutExt = path.basename(fileName, fileExtension)
		let counter = 1

		// Increment the file name if it already exists
		while (await fileExists(filePath)) {
			fileName = `${fileNameWithoutExt}(${counter})${fileExtension}`
			filePath = path.join(uploadDir, fileName)
			counter++
		}

		// Save the file
		const fileData = await file.arrayBuffer()
		await fs.writeFile(filePath, Buffer.from(fileData))
	}

	return new Response(JSON.stringify({ message: "File(s) uploaded successfully" }), { status: 200 })
}

// Helper function to check if a file exists
async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath)
		return true
	} catch {
		return false
	}
}
