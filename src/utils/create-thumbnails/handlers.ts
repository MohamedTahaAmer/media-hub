import { type Stats } from "fs"
import { copyFile, mkdir, stat } from "fs/promises"
import path from "path"
import { doesFileExist } from ".."
import { db, schema } from "../db/db"
import { deepStrictEqual, readableBytes, sanitizeDir, sanitizeForHref } from "./helpers"
import type { FilesAndFolders, Thumbnail } from "./types"

const PUBLIC_THUMBNAILS_FOLDER = "public/thumbnails"

function getFileUniqueStats(stats: Stats) {
	return {
		size: stats.size,
		ctime: stats.ctime.toISOString(),
		mtime: stats.mtime.toISOString(),
	}
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

export function handleDirectories({ filesAndFolders, path, name }: { filesAndFolders: FilesAndFolders; path: string; name: string }) {
	filesAndFolders.push({
		name,
		isDirectory: true,
		thumbnail: undefined,
		size: undefined,
	})
}

export async function handleVideos({
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
export async function handleImage({
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
