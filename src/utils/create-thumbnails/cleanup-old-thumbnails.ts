import { eq, like } from "drizzle-orm"
import { readdir } from "fs/promises"
import path from "path"
import { db, schema } from "../db/db"
import { getFilesAndFolders } from "./get-files-and-folders"
import { sanitizeDir, sanitizeForHref } from "./helpers"
import type { Thumbnail } from "./types"
import { checkDirectoryExists } from ".."
import { rm } from "fs/promises"

export const globalForRootDir = globalThis as unknown as {
	didCleanUp: boolean
}
export function enableCleanup() {
	globalForRootDir.didCleanUp = false
}
export async function cleanupOldThumbnails(rootDir: string) {
	if (globalForRootDir.didCleanUp) return
	console.log("\x1b[1;33m%s\x1b[1;36m", "Cleaning up old thumbnails for root directory:", rootDir)
	let thumbnailsForExistingFiles = await processDirectory(rootDir)
	if (!thumbnailsForExistingFiles) return
	let dbThumbnails = (await db
		.select()
		.from(schema.thumbnails)
		.where(like(schema.thumbnails.key, `${rootDir}%`))) as Thumbnail[]

	let allThumbnails = dbThumbnails.map((thumbnail) => ({ dir: fileDirToThumbnail(thumbnail.key), key: thumbnail.key }))

	let thumbnailKeysToDelete = allThumbnails.filter((thumbnail) => !thumbnailsForExistingFiles.includes(thumbnail.dir))
	console.log("thumbnails to delete:", thumbnailKeysToDelete)

	for (const thumbnailKey of thumbnailKeysToDelete) {
		await db.delete(schema.thumbnails).where(eq(schema.thumbnails.key, thumbnailKey.key))
		await rm(path.join("public", thumbnailKey.dir))
	}
	globalForRootDir.didCleanUp = true
}

async function processDirectory(directoryPath: string) {
	let thumbnailsForExistingFiles: string[] = []
	await checkDirectoryExists(directoryPath)
	console.log("Processing directory:", directoryPath)
	thumbnailsForExistingFiles.push(...(await getThumbnailsFromGetFilesAndFolders(directoryPath)))
	async function loopOverDirs(directoryPath: string) {
		try {
			const entries = await readdir(directoryPath, { withFileTypes: true })
			for (const entry of entries) {
				if (!entry.isDirectory()) continue
				let currentDir = path.join(directoryPath, entry.name)
				console.log("Processing directory:", currentDir)
				let thumbNailsForCurrentDir = await getThumbnailsFromGetFilesAndFolders(currentDir)
				thumbnailsForExistingFiles.push(...thumbNailsForCurrentDir)
				await loopOverDirs(currentDir)
			}
		} catch (err) {
			console.error("Error processing directory:", err)
		}
	}
	await loopOverDirs(directoryPath)
	return thumbnailsForExistingFiles
}

function fileDirToThumbnail(fileDir: string) {
	let parsedFile = path.parse(fileDir)
	let thumbnail = path.join("/thumbnails", sanitizeDir(parsedFile.dir), sanitizeForHref(parsedFile.name) + ".jpeg")
	return thumbnail
}

async function getThumbnailsFromGetFilesAndFolders(dir: string) {
	let thumbNailsForCurrentDir = (await getFilesAndFolders(dir)).filter((file) => file.thumbnail?.name).map((file) => file.thumbnail?.name!)
	return thumbNailsForCurrentDir
}