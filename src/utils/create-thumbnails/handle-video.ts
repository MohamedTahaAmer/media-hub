import { mkdir, stat } from "fs/promises"
import path from "path"
import { doesFileExist } from ".."
import { db, schema } from "../db/db"
import { deepStrictEqual, getFileUniqueStats, IMAGE_DIMENSIONS, PUBLIC_THUMBNAILS_FOLDER, readableBytes, sanitizeDir, sanitizeForHref } from "./helpers"
import type { FilesAndFolders, Thumbnail } from "./types"
import Ffmpeg from "fluent-ffmpeg"

async function getVideoDimensions(videoPath: string) {
	return new Promise<{ width: number | undefined; height: number | undefined }>((resolve, reject) => {
		Ffmpeg.ffprobe(videoPath, (err, metadata) => {
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
	let videoDimensions = await getVideoDimensions(videoPath)
	if (!videoDimensions.width || !videoDimensions.height) {
		throw new Error("Couldn't get the dimensions of the video")
	}

	let resizeScale = Math.min(IMAGE_DIMENSIONS.width / videoDimensions.width, IMAGE_DIMENSIONS.height / videoDimensions.height)
	let thumbnailWidth = Math.floor(videoDimensions.width * resizeScale)
	let thumbnailHeight = Math.floor(videoDimensions.height * resizeScale)
	return new Promise<{ thumbnailWidth: number; thumbnailHeight: number }>((resolve, reject) => {
		let start = performance.now()
		Ffmpeg(videoPath)
			.screenshots({
				timestamps: ["1%"],
				filename: `${thumbnailName}.jpeg`,
				folder: thumbnailPath,
				size: `${thumbnailWidth}x${thumbnailHeight}`,
			})
			.on("end", function () {
				console.log(`Time taken to create thumbnail for video: ${thumbnailName}:`, performance.now() - start)
				resolve({ thumbnailWidth, thumbnailHeight })
			})
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
				thumbnail: {
					name: thumbnail.replace(PUBLIC_THUMBNAILS_FOLDER, ""),
					width: dbThumbnail.thumbnailWidth,
					height: dbThumbnail.thumbnailHeight,
				},
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
	let { thumbnailWidth, thumbnailHeight } = await createThumbnail({
		videoPath: videoFile,
		thumbnailName: sanitizedName,
		thumbnailPath,
	})

	let insertedThumbnail = (
		await db
			.insert(schema.thumbnails)
			.values({ key: videoFile, stats, thumbnailWidth, thumbnailHeight })
			.onConflictDoUpdate({
				target: schema.thumbnails.key,
				set: { stats },
			})
			.returning()
	)[0]
	if (!insertedThumbnail) throw new Error("Couldn't insert the thumbnail into the db")

	console.log("\x1b[1;33m%s\x1b[1;36m", "Inserted thumbnail:", insertedThumbnail.key, " \nWith id:", insertedThumbnail.id)

	filesAndFolders.push({
		name: `${parsedVideo.name}${parsedVideo.ext}`,
		isDirectory: false,
		thumbnail: {
			name: thumbnail.replace(PUBLIC_THUMBNAILS_FOLDER, ""),
			width: insertedThumbnail.thumbnailWidth,
			height: insertedThumbnail.thumbnailHeight,
		},
		size: readableBytes(stats.size),
	})
}
