"server-only"
import { env } from "@/env"
import { checkDirectoryExists } from "."

const globalForRootDir = globalThis as unknown as {
	rootDir: string
}
globalForRootDir.rootDir = globalForRootDir.rootDir ?? env.ROOT_DIR

export async function setRootDir(newRootDir: string) {
	await checkDirectoryExists(newRootDir)
	globalForRootDir.rootDir = newRootDir
	return newRootDir
}

export function getRootDir() {
	return globalForRootDir.rootDir
}
