import { like } from "drizzle-orm"
import { constants, type Stats } from "fs"
import { access, mkdir, readdir, stat } from "fs/promises"
import path from "path"
import { db, schema } from "./db/db"

// if this is a video file, get its thumbnail
function getFileUniqueStats(stats: Stats) {
	return {
		size: stats.size,
		ctime: stats.ctime.toISOString(),
		mtime: stats.mtime.toISOString(),
	}
}

async function doesFileExist(filePath: string) {
	let exist = true
	try {
		await access(filePath, constants.F_OK)
	} catch (error) {
		exist = false
	}
	return exist
}

function readableBytes(bytes: number) {
	if (bytes === 0) return "0 B"
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	return (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["B", "KB", "MB", "GB", "TB"][i]
}

async function deepStrictEqual<T>(obj1: T, obj2: T) {
	let equal = true
	try {
		let { default: assert } = await import("assert")
		// @ts-expect-error
		assert.deepStrictEqual(obj1, obj2)
	} catch (error) {
		equal = false
	}
	return equal
}

function checkIfVideoFile(ext: string) {
	const videoExtensions = ["mp4", "mkv", "avi", "flv", "wmv", "mov", "webm", "m4v"]
	return videoExtensions.includes(ext)
}

async function createThumbnail({ videoPath, thumbnailName, thumbnailPath }: { videoPath: string; thumbnailName: string; thumbnailPath: string }) {
	let start = performance.now()
	let { default: ffmpeg } = await import("fluent-ffmpeg")
	ffmpeg(videoPath)
		.screenshots({
			timestamps: ["2%"],
			filename: `${thumbnailName}.png`,
			folder: thumbnailPath,
			size: "320x240",
		})
		.on("end", function () {
			console.log(`Time taken to create thumbnail for video: ${thumbnailName}:`, performance.now() - start)
		})
	return `${thumbnailPath}/${thumbnailName}.png`
}

export type FilesAndFolders = {
	name: string
	path: string
	isDirectory: boolean
	isVideoFile: boolean
	thumbnail: string | undefined
	size: string | undefined
}[]
type UniqueStats = {
	size: number
	ctime: string
	mtime: string
}
type Thumbnail = {
	id: number
	key: string
	stats: UniqueStats
}
const PUBLIC_THUMBNAILS_FOLDER = "public/thumbnails"

// - function to get the folders and files inside a dir, also get the file stats, and if video, then create a thumbnail for it
export async function getFilesAndFolders(dir: string) {
	const entries = await readdir(dir, { withFileTypes: true })
	let dbThumbnails = (await db
		.select()
		.from(schema.thumbnails)
		.where(like(schema.thumbnails.key, `${PUBLIC_THUMBNAILS_FOLDER}${dir}%`))) as Thumbnail[]
	const filesAndFolders: FilesAndFolders = []
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)
		const parsedPath = path.parse(entry.name)
		let isDirectory = entry.isDirectory()

		// - if the entry is not a directory, get the file size and stats then check if it's a video file
		let stats: undefined | UniqueStats
		let size: string | undefined
		let isVideoFile = false
		if (!isDirectory) {
			stats = getFileUniqueStats(await stat(fullPath))
			size = readableBytes(stats.size)
			isVideoFile = checkIfVideoFile(parsedPath.ext.slice(1))
		}

		// - if it's a video file, then get it's thumbnail
		let thumbnail: string | undefined
		if (isVideoFile) {
			let videoNameWithoutExtension = parsedPath.name
			let thumbnailPath = `${PUBLIC_THUMBNAILS_FOLDER}${dir}`
			let thumbnailPathPng = `${thumbnailPath}/${videoNameWithoutExtension}.png`

			let dbThumbnail = dbThumbnails.find((t) => t.key === thumbnailPathPng)

			let thumbnailExists = await doesFileExist(thumbnailPathPng)
			let isSameStats = dbThumbnail && (await deepStrictEqual(dbThumbnail.stats, stats))

			if (thumbnailExists && isSameStats) {
				// this ? is because TS can't know that isSameState makes sure that dbThumbnail is defined
				thumbnail = dbThumbnail?.key
			} else {
				await mkdir(thumbnailPath, { recursive: true })
				thumbnail = await createThumbnail({ videoPath: fullPath, thumbnailName: videoNameWithoutExtension, thumbnailPath })
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
			size,
		})
	}
	return filesAndFolders.sort((a, b) => {
		if (a.isDirectory && !b.isDirectory) return -1
		if (!a.isDirectory && b.isDirectory) return 1
		return a.name.localeCompare(b.name)
	})
}
