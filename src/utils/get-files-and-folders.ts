import { like } from "drizzle-orm"
import { constants, type Stats } from "fs"
import { access, mkdir, readdir, stat, copyFile } from "fs/promises"
import path from "path"
import { db, schema } from "./db/db"
import { deepStrictEqual } from "."

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

function sanitizeForHref(input: string): string {
	const replacements: Record<string, string> = {
		" ": "_",
		_: "_0",
		"#": "_23",
		"%": "_25",
		"&": "_26",
		"<": "_3C",
		">": "_3E",
		'"': "_22",
		"'": "_27",
		"?": "_3F",
		";": "_3B",
		"@": "_40",
		"=": "_3D",
		"+": "_2B",
		$: "_24",
		",": "_2C",
		"/": "_2F",
		":": "_3A",
		"：": "_3B",
	}

	return input
		.split("")
		.map((char) => replacements[char] ?? char)
		.join("")
}
function sanitizeDir(dir: string) {
	let slugs = dir.split("/")
	return slugs.map(sanitizeForHref).join("/")
}

async function checkIfFileIsActual(file: string, type: "video" | "image") {
	let { fileTypeFromFile } = await import("node_modules/file-type/index")
	let typeObj = await fileTypeFromFile(file)
	return typeObj?.mime.startsWith(type)
}

async function createThumbnail({ videoPath, thumbnailName, thumbnailPath }: { videoPath: string; thumbnailName: string; thumbnailPath: string }) {
	let { default: ffmpeg } = await import("fluent-ffmpeg")
	return new Promise((resolve, reject) => {
		let start = performance.now()
		ffmpeg(videoPath)
			.screenshots({
				timestamps: ["1%"],
				filename: `${thumbnailName}.png`,
				folder: thumbnailPath,
				size: "320x240",
			})
			.on("end", function () {
				console.log(`Time taken to create thumbnail for video: ${thumbnailName}:`, performance.now() - start)
				resolve(`${thumbnailPath}/${thumbnailName}.png`)
			})
	})
}

function handleDirectories({ filesAndFolders, path, name }: { filesAndFolders: FilesAndFolders; path: string; name: string }) {
	filesAndFolders.push({
		name,
		isDirectory: true,
		thumbnail: undefined,
		size: undefined,
	})
}

async function handleActualVideos({
	filesAndFolders,
	dbThumbnails,
	videoFile,
}: {
	filesAndFolders: FilesAndFolders
	dbThumbnails: Thumbnail[]
	videoFile: string
}) {
	// find out if we created a thumbnail for this video before
	let parsedVideo = path.parse(videoFile)
	let sanitizedName = sanitizeForHref(parsedVideo.name)
	let sanitizedDir = sanitizeDir(parsedVideo.dir)
	let thumbnailPath = path.join(PUBLIC_THUMBNAILS_FOLDER, sanitizedDir)
	let thumbnail = path.join(thumbnailPath, `${sanitizedName}.png`)
	let stats = getFileUniqueStats(await stat(videoFile))

	let thumbnailExists = await doesFileExist(thumbnail)
	if (thumbnailExists) {
		let dbThumbnail = dbThumbnails.find((t) => t.key === videoFile)
		let isSameStats = dbThumbnail && (await deepStrictEqual(dbThumbnail.stats, stats))
		if (dbThumbnail && isSameStats) {
			filesAndFolders.push({
				name: `${parsedVideo.name}${parsedVideo.ext}`,
				isDirectory: false,
				thumbnail: `/thumbnails${sanitizedDir}/${sanitizedName}.png`,
				size: readableBytes(stats.size),
			})
			return
		}
	}

	/*
	1- the thumbnail doesn't exist in the public folder
	2- the video isn't in the db
	3- the video is in the db but with different stats
	*/
	await mkdir(thumbnailPath, { recursive: true })
	await createThumbnail({ videoPath: videoFile, thumbnailName: sanitizedName, thumbnailPath })

	let insertedThumbnail = await db
		.insert(schema.thumbnails)
		.values({ key: videoFile, stats })
		.onConflictDoUpdate({
			target: schema.thumbnails.key,
			set: { stats },
		})
		.returning()
	console.log(insertedThumbnail)

	filesAndFolders.push({
		name: `${parsedVideo.name}${parsedVideo.ext}`,
		isDirectory: false,
		thumbnail: `/thumbnails${sanitizedDir}/${sanitizedName}.png`,
		size: readableBytes(stats.size),
	})
}
async function handleActualImage({
	filesAndFolders,
	dbThumbnails,
	imageFile,
}: {
	filesAndFolders: FilesAndFolders
	dbThumbnails: Thumbnail[]
	imageFile: string
}) {
	let parsedImage = path.parse(imageFile)
	let sanitizedDir = sanitizeDir(parsedImage.dir)
	let thumbnailPath = path.join(PUBLIC_THUMBNAILS_FOLDER, sanitizedDir)
	let stats = getFileUniqueStats(await stat(imageFile))
	let thumbnail = path.join(thumbnailPath, `${sanitizeForHref(parsedImage.name)}${parsedImage.ext}`)

	let thumbnailExists = await doesFileExist(thumbnail)
	if (thumbnailExists) {
		let dbThumbnail = dbThumbnails.find((t) => t.key === imageFile)
		let isSameStats = dbThumbnail && (await deepStrictEqual(dbThumbnail.stats, stats))
		if (dbThumbnail && isSameStats) {
			filesAndFolders.push({
				name: `${parsedImage.name}.${parsedImage.ext}`,
				isDirectory: false,
				thumbnail: `/thumbnails${sanitizedDir}/${sanitizeForHref(parsedImage.name)}${parsedImage.ext}`,
				size: readableBytes(stats.size),
			})
			return
		}
	}
	await mkdir(thumbnailPath, { recursive: true })
	await copyFile(imageFile, thumbnail)
	let insertedThumbnail = await db
		.insert(schema.thumbnails)
		.values({ key: imageFile, stats })
		.onConflictDoUpdate({
			target: schema.thumbnails.key,
			set: { stats },
		})
		.returning()
	console.log(insertedThumbnail)
	filesAndFolders.push({
		name: `${parsedImage.name}.${parsedImage.ext}`,
		isDirectory: false,
		thumbnail: `/thumbnails${sanitizedDir}/${sanitizeForHref(parsedImage.name)}${parsedImage.ext}`,
		size: readableBytes(stats.size),
	})
}
export type FilesAndFolders = {
	name: string
	isDirectory: boolean
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
	// if dir ends with a slash, remove it
	if (dir.endsWith("/")) dir = dir.slice(0, -1)
	// get all the thumbnails in the db that have the same dir as the current dir, not to make a separate db query for each file in this dir
	let dbThumbnails = (await db
		.select()
		.from(schema.thumbnails)
		.where(like(schema.thumbnails.key, `${dir}%`))) as Thumbnail[]
	const filesAndFolders: FilesAndFolders = []
	const entries = await readdir(dir, { withFileTypes: true })

	let videoHandlerCalls = []
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			handleDirectories({ filesAndFolders, path: fullPath, name: entry.name })
			continue
		}
		if (await checkIfFileIsActual(fullPath, "video")) {
			// await handleActualVideos({ filesAndFolders, dbThumbnails, videoFile: fullPath })
			videoHandlerCalls.push(handleActualVideos({ filesAndFolders, dbThumbnails, videoFile: fullPath }))
			continue
		}
		if (await checkIfFileIsActual(fullPath, "image")) {
			await handleActualImage({ filesAndFolders, dbThumbnails, imageFile: fullPath })
			continue
		}
		const stats = await stat(fullPath)
		const size = readableBytes(stats.size)
		filesAndFolders.push({
			name: entry.name,
			isDirectory: false,
			thumbnail: undefined,
			size,
		})
	}
	await Promise.allSettled(videoHandlerCalls)
	return filesAndFolders.sort((a, b) => {
		if (a.isDirectory && !b.isDirectory) return -1
		if (!a.isDirectory && b.isDirectory) return 1
		return a.name.localeCompare(b.name)
	})
}
/*
1- if there is a slash at the end of the dir, remove it
2- the thumbnail key shouldn't contain any special chars like / space # . , etc, all should be replaced with -
3- only call createThumbnail if the file is a real video file, based on it's binary data, not the extension
4- the actual video name is the one stored in the db, and the corrected thumbnail name is the one used to create the thumbnail, and is the one sent to the client
5- we are returning thumbnails for videos and images only
*/
