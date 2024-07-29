import { readdir, stat } from "fs/promises"
import path from "path"
import { execSync } from "child_process"

export type FilesAndFolders = { name: string; path: string; isDirectory: boolean; size: string }[]
export async function getFilesAndFolders(directoryPath: string) {
	const entries = await readdir(directoryPath, { withFileTypes: true })
	const filesAndFolders: FilesAndFolders = []
	for (const entry of entries) {
		const fullPath = path.join(directoryPath, entry.name)
		const stats = await stat(fullPath)
		let isDirectory = entry.isDirectory()
		filesAndFolders.push({
			name: entry.name,
			path: fullPath,
			isDirectory,
			size: readableBytes(stats.size),
		})
	}
	return filesAndFolders.sort((a, b) => {
		if (a.isDirectory && !b.isDirectory) return -1
		if (!a.isDirectory && b.isDirectory) return 1
		return a.name.localeCompare(b.name)
	})
}

export function getIpAddress(): string {
	const result = execSync("ip addr show | grep -oP '(?<=inet 192.168.1).*?(?=/24)'", {
		encoding: "utf-8",
	})
	return "192.168.1" + result.trim()
}

function readableBytes(bytes: number) {
	if (bytes === 0) return "0 B"
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	return (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["B", "KB", "MB", "GB", "TB"][i]
}
