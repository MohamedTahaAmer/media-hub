"use server"
import { setRootDir } from "@/utils/root-dir"
import { revalidatePath } from "next/cache"

export async function handleRootChange(newRoot: string) {
	await setRootDir(newRoot)
	revalidatePath("/")
	return "Root Folder Updated Successfully"
}
