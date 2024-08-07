import { mkdir, stat } from "fs/promises"
import { imageSize } from "image-size"
import path from "path"
import sharp from "sharp"
import { doesFileExist } from ".."
import { db, schema } from "../db/db"
import { deepStrictEqual, getFileUniqueStats, IMAGE_DIMENSIONS, PUBLIC_THUMBNAILS_FOLDER, readableBytes, sanitizeDir, sanitizeForHref } from "./helpers"
import type { FilesAndFolders, Thumbnail } from "./types"

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
	let thumbnail = path.join(thumbnailPath, `${sanitizeForHref(parsedImage.name)}.jpeg`)

	let thumbnailExists = await doesFileExist(thumbnail)
	// - if the thumbnail exists in the fs and in the db also has the same stats, then add it to the filesAndFolders array, other wise create a new thumbnail and update the db
	if (thumbnailExists) {
		let dbThumbnail = dbThumbnails.find((t) => t.key === imageFile)
		let isSameStats = dbThumbnail && (await deepStrictEqual(dbThumbnail.stats, stats))
		if (dbThumbnail && isSameStats) {
			filesAndFolders.push({
				name: `${parsedImage.name}.${parsedImage.ext}`,
				isDirectory: false,
				thumbnail: {
					name: thumbnail,
					width: dbThumbnail.thumbnailWidth,
					height: dbThumbnail.thumbnailHeight,
				},
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
	let resizeScale = Math.min(IMAGE_DIMENSIONS.width / dimensions.width, IMAGE_DIMENSIONS.height / dimensions.height)
	let thumbnailWidth = Math.floor(dimensions.width * resizeScale)
	let thumbnailHeight = Math.floor(dimensions.height * resizeScale)
	sharp(imageFile)
		.resize(thumbnailWidth, thumbnailHeight)
		.toFile(thumbnail, (err, info) => {
			if (err) throw new Error("Couldn't resize the image")
		})
	let insertedThumbnail = (
		await db
			.insert(schema.thumbnails)
			.values({ key: imageFile, stats, thumbnailWidth, thumbnailHeight })
			.onConflictDoUpdate({
				target: schema.thumbnails.key,
				set: { stats },
			})
			.returning()
	)[0]
	if (!insertedThumbnail) throw new Error("Couldn't insert the thumbnail")

	filesAndFolders.push({
		name: `${parsedImage.name}.${parsedImage.ext}`,
		isDirectory: false,
		thumbnail: {
			name: thumbnail,
			width: insertedThumbnail.thumbnailWidth,
			height: insertedThumbnail.thumbnailHeight,
		},
		size: readableBytes(stats.size),
	})
}
