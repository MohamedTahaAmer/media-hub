"use server"
import { enableCleanup } from "@/utils/create-thumbnails/cleanup-old-thumbnails"
import { setRootDir } from "@/utils/root-dir"
import { revalidatePath } from "next/cache"

export async function handleRootChange(newRoot: string) {
	await setRootDir(newRoot)
	enableCleanup()
	revalidatePath("/")
	return "Root Folder Updated Successfully"
}
