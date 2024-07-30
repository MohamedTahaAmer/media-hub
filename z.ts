import { env } from "@/env"
import { db, schema } from "@/utils/db/db"
import { eq } from "drizzle-orm"
import ffmpeg from "fluent-ffmpeg"
import { stat } from "fs/promises"
import path from "path"

// - Bun doesn't support better-sqlite3 yet, so we have to create our own instance of drizzle to be able to run this z.ts file with bun, running it with tsx will require a lot of config and stuff
// - No running with tsx worked fine, will comment the bun db instance for now and use tsx with the original db instance
// import { drizzle } from "drizzle-orm/bun-sqlite"
// import * as schema from "@/utils/db/schema"
// import { Database } from "bun:sqlite"
// const sqlite = new Database(env.SQLITE_DB_NAME)
// export const db = drizzle(sqlite)

function testFluentFfmpeg() {
	// let img = ffmpeg("/media/mohamed/640/DOWNLOADS/IDM/videos/React Compiler： In-Depth Beyond React Conf 2024.mp4'").size("640x480")
	// console.log(img)
	let videoPath = "/media/mohamed/640/DOWNLOADS/IDM/videos/"
	let videoName = "Drizzle The TypeScript SQL.ORM.mkv"
	const parsedPath = path.parse(videoName)
	const videoNameWithoutExtension = parsedPath.name
	console.log(videoNameWithoutExtension)
	console.log(parsedPath.ext)

	let start = performance.now()
	ffmpeg(videoPath + videoName)
		.screenshots({
			timestamps: ["1"],
			filename: `${videoNameWithoutExtension}.png`,
			folder: "/media/mohamed/640/DOWNLOADS/IDM/videos/imgs",
			size: "320x240",
		})
		.on("end", function () {
			console.log("Time taken:", performance.now() - start)
		})
}
// testFluentFfmpeg()
function testFluentFfmpeg2() {
	// let img = ffmpeg("/media/mohamed/640/DOWNLOADS/IDM/videos/React Compiler： In-Depth Beyond React Conf 2024.mp4'").size("640x480")
	// console.log(img)
	let videoPath = "/media/mohamed/640/DOWNLOADS/IDM/videos/"
	let videoName = "Drizzle The TypeScript SQL.ORM.mkv"
	const parsedPath = path.parse(videoName)
	const videoNameWithoutExtension = parsedPath.name
	console.log(videoNameWithoutExtension)
	console.log(parsedPath.ext)

	let start = performance.now()
	ffmpeg(videoPath + videoName)
		.screenshots({
			timestamps: ["1200"],
			filename: `${videoNameWithoutExtension}.png`,
			folder: "/media/mohamed/640/DOWNLOADS/IDM/videos/imgs",
			size: "320x240",
		})
		.on("end", function () {
			console.log("Time taken:", performance.now() - start)
		})
}
// testFluentFfmpeg2()
async function testGetFilesAndFolders() {
	let { getFilesAndFolders } = await import("@/utils/get-files-and-folders")
	// await getFilesAndFolders("/media/mohamed/640/DOWNLOADS/IDM/videos")
	// await getFilesAndFolders("/media/mohamed/640/DOWNLOADS/IDM/videos/1/2")
	await getFilesAndFolders("/media/mohamed/640/DOWNLOADS/IDM/videos/2/1")
}
// void testGetFilesAndFolders()
async function selectDB() {
	let res = await db.select().from(schema.thumbnails)
	console.log(res)
}
// void selectDB()
async function selectDistinct() {
	let res = await db.selectDistinct().from(schema.thumbnails).where(eq(schema.thumbnails.key, "videoNameWithoutExtension"))
	console.log(res)
}
// void selectDistinct()
async function insertDB() {
	let res = await db.insert(schema.thumbnails).values({ key: "videoNameWithoutExtension-1", stats: "stats" }).returning()
	console.log(res)
}
// void insertDB()
async function insertObject() {
	let stats = { a: 1, b: 2 }
	let res = await db.insert(schema.thumbnails).values({ key: "videoNameWithoutExtension-2", stats }).returning()
	console.log(res)
}
// void insertObject()
async function updateDB() {
	// if the key isn't there, then nothing will be updated
	let res = await db.update(schema.thumbnails).set({ stats: "new stats" }).where(eq(schema.thumbnails.key, "videoNameWithoutExtension")).returning()
	console.log(res)
}
// void updateDB()
async function upsertDB() {
	let stats = "new stats -1"
	let res = await db
		.insert(schema.thumbnails)
		.values({ key: "videoNameWithoutExtension", stats })
		.onConflictDoUpdate({
			target: schema.thumbnails.key,
			set: { stats },
		})
		.returning()
	console.log(res)
}
// void upsertDB()
async function emptyDB() {
	let res = await db.delete(schema.thumbnails)
	console.log(res)
}
// void emptyDB()
async function getFileStats() {
	let stats = await stat("/home/mohamed/Desktop/videos/Drizzle The TypeScript SQL.ORM.mkv")
	console.log(stats)
}
// void getFileStats()
function testBunDeepEqual() {
	let a = { a: 1, b: 2 }
	let b = { a: 1, b: 2 }
	console.log(a === b)
	console.log(Bun.deepEquals(a, b))
}
// testBunDeepEqual()
function testBunEnv() {
	console.log(Bun.env)
	console.log("----------------------------------------------")
	console.log(process.env)
}
// testBunEnv()
function testT3Env() {
	console.log(env.NODE_ENV)
	console.log(process.env.NODE_ENV)
}
// testT3Env()
async function testNodeStrictDeepEqual() {
	// throws an error if the values are not deeply equal
	// doesn't work well with TS
	let start = performance.now()
	let { default: assert } = await import("assert")
	console.log("Time taken to import assert:", performance.now() - start)
	let a: { a: number; b: number } = { a: 1, b: 2 }
	let b: { a: number; b: number } = { a: 1, b: 2 }

	let isEqual = true
	try {
		// @ts-expect-error
		assert.deepStrictEqual(a, b)
	} catch (error) {
		isEqual = false
	}
	console.log(a === b)
}
// void testNodeStrictDeepEqual()
