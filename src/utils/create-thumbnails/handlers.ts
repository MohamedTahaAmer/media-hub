import { type Stats } from "fs"
import { copyFile, mkdir, stat } from "fs/promises"
import path from "path"
import { doesFileExist } from ".."
import { db, schema } from "../db/db"
import { deepStrictEqual, readableBytes, sanitizeDir, sanitizeForHref } from "./helpers"
import type { FilesAndFolders, Thumbnail } from "./types"
import sharp from "sharp"
import { imageSize } from "image-size"

const PUBLIC_THUMBNAILS_FOLDER = "public/thumbnails"
const IMAGE_DIMENSIONS = { width: 320, height: 180 }

function getFileUniqueStats(stats: Stats) {
	return {
		size: stats.size,
		ctime: stats.ctime.toISOString(),
		mtime: stats.mtime.toISOString(),
	}
}
async function getVideoDimensions(videoPath: string) {
	let { default: ffmpeg } = await import("fluent-ffmpeg")
	return new Promise<{ width: number | undefined; height: number | undefined }>((resolve, reject) => {
		ffmpeg.ffprobe(videoPath, (err, metadata) => {
			if (err) {
				reject(err)
			}
			resolve({
				width: metadata.streams[0]?.width,
				height: metadata.streams[0]?.height,
			})
		})
	})
}
async function createThumbnail({ videoPath, thumbnailName, thumbnailPath }: { videoPath: string; thumbnailName: string; thumbnailPath: string }) {
	let { default: ffmpeg } = await import("fluent-ffmpeg")
	let videoDimensions = await getVideoDimensions(videoPath)
	if (!videoDimensions.width || !videoDimensions.height) {
		throw new Error("Couldn't get the dimensions of the video")
	}

	let resizeScale = Math.min(IMAGE_DIMENSIONS.width / videoDimensions.width, IMAGE_DIMENSIONS.height / videoDimensions.height)
	let thumbnailWidth = Math.floor(videoDimensions.width * resizeScale)
	let thumbnailHeight = Math.floor(videoDimensions.height * resizeScale)
	return new Promise((resolve, reject) => {
		let start = performance.now()
		ffmpeg(videoPath)
			.screenshots({
				timestamps: ["1%"],
				filename: `${thumbnailName}.jpeg`,
				folder: thumbnailPath,
				size: `${thumbnailWidth}x${thumbnailHeight}`,
			})
			.on("end", function () {
				console.log(`Time taken to create thumbnail for video: ${thumbnailName}:`, performance.now() - start)
				resolve(`${thumbnailPath}/${thumbnailName}.jpeg`)
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
	let thumbnail = path.join(thumbnailPath, `${sanitizedName}.jpeg`)
	let stats = getFileUniqueStats(await stat(videoFile))

	let thumbnailExists = await doesFileExist(thumbnail)
	if (thumbnailExists) {
		let dbThumbnail = dbThumbnails.find((t) => t.key === videoFile)
		let isSameStats = dbThumbnail && (await deepStrictEqual(dbThumbnail.stats, stats))
		if (dbThumbnail && isSameStats) {
			filesAndFolders.push({
				name: `${parsedVideo.name}${parsedVideo.ext}`,
				isDirectory: false,
				thumbnail: thumbnail.replace("public", ""),
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
		thumbnail: thumbnail.replace("public", ""),
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
	// let thumbnail = path.join(thumbnailPath, `${sanitizeForHref(parsedImage.name)}${parsedImage.ext}`)
	let thumbnail = path.join(thumbnailPath, `${sanitizeForHref(parsedImage.name)}$.jpeg`)

	let thumbnailExists = await doesFileExist(thumbnail)
	// - if the thumbnail exists in the fs and in the db also has the same stats, then add it to the filesAndFolders array, other wise create a new thumbnail and update the db
	if (thumbnailExists) {
		let dbThumbnail = dbThumbnails.find((t) => t.key === imageFile)
		let isSameStats = dbThumbnail && (await deepStrictEqual(dbThumbnail.stats, stats))
		if (dbThumbnail && isSameStats) {
			filesAndFolders.push({
				name: `${parsedImage.name}.${parsedImage.ext}`,
				isDirectory: false,
				thumbnail: thumbnail.replace("public", ""),
				size: readableBytes(stats.size),
			})
			return
		}
	}

	await mkdir(thumbnailPath, { recursive: true })
	// await copyFile(imageFile, thumbnail)

	const dimensions = imageSize(imageFile)
	if (!dimensions.height || !dimensions.width) {
		throw new Error("Couldn't get the dimensions of the image")
	}
	console.log(dimensions.width, dimensions.height)
	let resizeScale = Math.min(IMAGE_DIMENSIONS.width / dimensions.width, IMAGE_DIMENSIONS.height / dimensions.height)
	let thumbnailWidth = Math.floor(dimensions.width * resizeScale)
	let thumbnailHeight = Math.floor(dimensions.height * resizeScale)
	sharp(imageFile)
		.resize(thumbnailWidth, thumbnailHeight)
		.toFile(thumbnail, (err, info) => {
			console.log(err, info)
		})
	let insertedThumbnail = await db
		.insert(schema.thumbnails)
		.values({ key: imageFile, stats })
		.onConflictDoUpdate({
			target: schema.thumbnails.key,
			set: { stats },
		})
		.returning()
	console.log(insertedThumbnail)
	console.log(thumbnail.replace("public", ""))
	filesAndFolders.push({
		name: `${parsedImage.name}.${parsedImage.ext}`,
		isDirectory: false,
		thumbnail: thumbnail.replace("public", ""),
		size: readableBytes(stats.size),
	})
}
