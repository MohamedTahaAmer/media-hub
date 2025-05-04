"use server"

import { readableBytes } from "@/utils/create-thumbnails/helpers"
import { getRootDir } from "@/utils/root-dir"
import { stat } from "fs/promises"
import { readdir } from "fs/promises"
import path from "path"

export async function getFirstLevelFilesFromDir(dir: string) {
	try {
		let files = []
		let entries = await readdir(path.join(getRootDir(), dir), { withFileTypes: true })
		for (let entry of entries) {
			// returning only the first level of files, and ignoring subfolders
			if (entry.isFile()) {
				let fileStats = await stat(path.join(getRootDir(), dir, entry.name))
				files.push({ name: entry.name, size: readableBytes(fileStats.size) })
			}
		}
		return files
	} catch (error) {
		console.error(error)
		throw new Error("Error reading directory")
	}
}
