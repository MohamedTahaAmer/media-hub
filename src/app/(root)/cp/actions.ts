"use server"

import { db, schema } from "@/utils/db/db"
import { eq } from "drizzle-orm"

export async function addText(content: string) {
	let textEntries = schema.textEntries
	let res = await db.insert(textEntries).values({ content }).returning({ id: textEntries.id, content: textEntries.content })
	// console.log(res)
	return res
}

export async function getAllTextEntries() {
	let textEntries = schema.textEntries
	let entries = await db.select({ id: textEntries.id, content: textEntries.content }).from(textEntries)
	// console.log(entries)
	return entries
}
export async function deleteTextEntry(id: number) {
	let textEntries = schema.textEntries
	let res = await db.delete(textEntries).where(eq(textEntries.id, id)).returning({ id: textEntries.id, content: textEntries.content })
	// console.log(res)
	return res
}
