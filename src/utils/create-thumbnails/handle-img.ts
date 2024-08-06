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
