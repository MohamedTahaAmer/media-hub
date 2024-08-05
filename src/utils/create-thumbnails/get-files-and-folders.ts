import { like } from "drizzle-orm"
import { readdir, stat } from "fs/promises"
import path from "path"
import { db, schema } from "../db/db"
import type { FilesAndFolders, Thumbnail } from "./types"
import { handleImage, handleVideos, handleDirectories } from "./handlers"
import { checkIfFileIsActual, readableBytes } from "./helpers"

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
			videoHandlerCalls.push(handleVideos({ filesAndFolders, dbThumbnails, videoFile: fullPath }))
			continue
		}
		if (await checkIfFileIsActual(fullPath, "image")) {
			await handleImage({ filesAndFolders, dbThumbnails, imageFile: fullPath })
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
