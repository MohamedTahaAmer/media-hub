import { readdir, stat, exists } from "fs/promises"
import path from "path"
import { execSync } from "child_process"
import { db, schema } from "./db/db"
import { eq } from "drizzle-orm"
import type { Stats } from "fs"
import { mkdir } from "fs/promises"

export type FilesAndFolders = { name: string; path: string; isDirectory: boolean; isVideoFile: boolean; thumbnail: string | undefined; size: string }[]
export async function getFilesAndFolders(dir: string) {
	const entries = await readdir(dir, { withFileTypes: true })
	const filesAndFolders: FilesAndFolders = []
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)

		let isVideoFile = false
		let isDirectory = entry.isDirectory()
		const parsedPath = path.parse(entry.name)
		if (!isDirectory) {
			const videoExtensions = ["mp4", "mkv", "avi", "flv", "wmv", "mov", "webm", "m4v"]
			const extension = parsedPath.ext.slice(1)
			isVideoFile = videoExtensions.includes(extension)
		}

		// if this is a video file, get its thumbnail
		function getFileUniqueStats(stats: Stats) {
			return {
				size: stats.size,
				ctime: stats.ctime,
				mtime: stats.mtime,
			}
		}
		const stats = getFileUniqueStats(await stat(fullPath))
		let thumbnail: string | undefined
		if (isVideoFile) {
			let videoNameWithoutExtension = parsedPath.name
			let thumbnailPath = `public/thumbnails${dir}`
			let thumbnailPathPng = `${thumbnailPath}/${videoNameWithoutExtension}.png`

			let thumbnailExists = await exists(thumbnailPathPng)
			let dbThumbnail = (await db.select().from(schema.thumbnails).where(eq(schema.thumbnails.key, thumbnailPathPng)))[0]
			if (thumbnailExists && dbThumbnail && dbThumbnail.stats === stats) {
				thumbnail = dbThumbnail.key!
			} else {
				if (!(await exists(thumbnailPath))) {
					await mkdir(thumbnailPath, { recursive: true })
				}
				let { default: ffmpeg } = await import("fluent-ffmpeg")

				let start = performance.now()
				ffmpeg(fullPath)
					.screenshots({
						timestamps: ["2%"],
						filename: `${videoNameWithoutExtension}.png`,
						folder: thumbnailPath,
						size: "320x240",
					})
					.on("end", function () {
						console.log(`Time taken to create thumbnail for video: ${videoNameWithoutExtension}:`, performance.now() - start)
					})
				thumbnail = `${thumbnailPath}/${videoNameWithoutExtension}.png`
				let insertedThumbnail = await db
					.insert(schema.thumbnails)
					.values({ key: thumbnail, stats: stats })
					.onConflictDoUpdate({
						target: schema.thumbnails.key,
						set: { stats },
					})
					.returning()
				console.log(insertedThumbnail)
			}
		}
		filesAndFolders.push({
			name: entry.name,
			path: fullPath,
			isDirectory,
			isVideoFile,
			thumbnail,
			size: readableBytes(stats.size),
		})
	}
	return filesAndFolders.sort((a, b) => {
		if (a.isDirectory && !b.isDirectory) return -1
		if (!a.isDirectory && b.isDirectory) return 1
		return a.name.localeCompare(b.name)
	})
}

export function getIpAddress(): string {
	const result = execSync("ip addr show | grep -oP '(?<=inet 192.168.1).*?(?=/24)'", {
		encoding: "utf-8",
	})
	return "192.168.1" + result.trim()
}

function readableBytes(bytes: number) {
	if (bytes === 0) return "0 B"
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	return (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["B", "KB", "MB", "GB", "TB"][i]
}
