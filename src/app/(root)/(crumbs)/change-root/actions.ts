"use server"
import { globalCache } from "@/utils/global-this"
import { setRootDir } from "@/utils/root-dir"
import { revalidatePath } from "next/cache"

export async function handleRootChange(newRoot: string) {
	await setRootDir(newRoot)
	globalCache.didCleanUp = false
	revalidatePath("/")
	return "Root Folder Updated Successfully"
}
