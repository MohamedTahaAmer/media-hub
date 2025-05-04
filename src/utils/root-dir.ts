"server-only"
import { env } from "@/env"
import { checkDirectoryExists } from "."
import { globalCache } from "./global-this"

globalCache.rootDir = globalCache.rootDir ?? env.NEXT_PUBLIC_ROOT_DIR

export async function setRootDir(newRootDir: string) {
	await checkDirectoryExists(newRootDir)
	globalCache.rootDir = newRootDir
	return newRootDir
}

export function getRootDir() {
	return globalCache.rootDir
}
