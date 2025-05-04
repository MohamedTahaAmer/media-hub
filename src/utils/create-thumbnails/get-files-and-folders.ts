import { like } from "drizzle-orm"
import { readdir, stat } from "fs/promises"
import path from "path"
import { db, schema } from "../db/db"
import { handleImage } from "./handle-img"
import { handleVideos } from "./handle-video"
import { checkIfFileIsActual, DetailedError, forbiddenDirs, handleDirectories, readableBytes } from "./helpers"
import type { FilesAndFolders, Thumbnail } from "./types"

function cleanDir(dir: string) {
	// if dir ends with a slash, remove it
	if (dir.endsWith("/")) return dir.slice(0, -1)

	// if the dir is forbidden, return
	let lastFolder = dir.split("/").pop() ?? dir // if it doesn't have / then it's the root dir
	if (forbiddenDirs.includes(lastFolder)) return { error: "This Folder Contain Too Much Files to Process" }
	return dir
}
// - function to get the folders and files inside a dir, also get the file stats, and if video, then create a thumbnail for it
export async function getFilesAndFolders(_dir: string) {
	let dir = cleanDir(_dir)
	// if (dir.error) return dir.error
	if (typeof dir !== "string") return dir.error
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
	let videoHandlersResults = await Promise.allSettled(videoHandlerCalls)
	for (const result of videoHandlersResults) {
		if (result.status === "rejected" && result.reason instanceof DetailedError) {
			let fullPath = result.reason.details.videoPath as string
			let stats = await stat(fullPath)
			let size = readableBytes(stats.size)
			filesAndFolders.push({
				name: path.basename(fullPath),
				isDirectory: false,
				thumbnail: undefined,
				size,
			})
		}
	}

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
