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
	let { getFilesAndFolders } = await import("@/utils/create-thumbnails/get-files-and-folders")
	// await getFilesAndFolders("/media/mohamed/640/DOWNLOADS/IDM/videos")
	// await getFilesAndFolders("/media/mohamed/640/DOWNLOADS/IDM/videos/1/2")
	// await getFilesAndFolders("/media/mohamed/640/DOWNLOADS/IDM/videos/2/1")
	await getFilesAndFolders("/home/mohamed/Desktop/videos/imgs")
}
void testGetFilesAndFolders()
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

function replaceInvalidChars(input: string) {
	// Define a regular expression that matches any character that is not a letter or number.
	const invalidCharRegex = /[^a-zA-Z0-9]/g
	// Replace all invalid characters with '_'.
	console.log(input.replace(invalidCharRegex, "_"))
}
// replaceInvalidChars("Drizzle The TypeScript SQL.ORM.mkv")

function parsedPath() {
	// let videoName = "root/test/test2/Drizzle The TypeScript SQL.ORM.mkv"
	let videoName = "/root/test/test2/Drizzle The.txt"
	const parsedPath = path.parse(videoName)
	console.log(parsedPath)
}
// parsedPath()

async function testFileType() {
	// @ts-expect-error // - the fileTypeFromFile is there in the index.js file, but I don't know why TS is looking inside the core.js file only
	let { fileTypeFromFile: s } = await import("file-type")
	// eslint-disable-next-line
	console.log(await s("z.ts"))

	// - if we logged the keys of t, we will get the fileTypeFromFile key
	let t = await import("file-type")
	// loop over the keys in t
	for (let key in t) {
		console.log(key)
	}

	// - this is the way I was able to get TS pick the type, by explicitly importing it from the index.js file
	let { fileTypeFromFile } = await import("node_modules/file-type/index")

	return
}
// void testFileType()

function splitVsArray() {
	console.time("Array.from")
	for (let i = 0; i < 100000; i++) {
		const result = Array.from("Hello World")
	}
	console.timeEnd("Array.from")
	console.time("split")
	for (let i = 0; i < 100000; i++) {
		const result = "Hello World".split("")
	}
	console.timeEnd("split")
}
// splitVsArray()

function sanitizeForHref(input: string) {
	const replacements: Record<string, string> = {
		" ": "_",
		_: "_0",
		"#": "_23",
		"%": "_25",
		"&": "_26",
		"<": "_3C",
		">": "_3E",
		'"': "_22",
		"'": "_27",
		"?": "_3F",
		";": "_3B",
		"@": "_40",
		"=": "_3D",
		"+": "_2B",
		$: "_24",
		",": "_2C",
		"/": "_2F",
		":": "_3A",
		"：": "_3B",
	}

	console.log("\x1b[1;32m%s\x1b[1;36m", replacements[" "])
	console.log("\x1b[1;32m%s\x1b[1;36m", replacements[" "] ?? " ")

	let sanitizedStr = Array.from(input)
		.map((char) => {
			return replacements[char] ?? char
		})
		.join("")

	console.log(sanitizedStr)
}

// sanitizeForHref("Next.js： Authentication (Best Practices for Server Components, Actions, Middleware)")
// sanitizeForHref("d:_d")

async function testReactRenderToString() {
	// let React = require("react")
	// let ReactDOMServer = require("react-dom/server")
	// let html = ReactDOMServer.renderToString(Y)
	let React = await import("react")
	let ReactDOMServer = await import("react-dom/server")
	// - create y.tsx file and then import it here
	// let { default: Y } = await import("./y")
	// let html = ReactDOMServer.renderToString(React.createElement(Y))
	// console.log(html)
}
// void testReactRenderToString()

async function testAsyncAwait() {
	console.log("first")
	await new Promise((resolve) => {
		setTimeout(() => {
			console.log("second")
			resolve(1)
		}, 1000)
	})

	console.log("last")
}
// void testAsyncAwait()

async function testSyncMemoryCache() {
	let { setRootDir, getRootDir } = await import("@/utils/root-dir")
	await setRootDir("root/es")
	console.log(getRootDir())
}
// void testSyncMemoryCache()

async function testFSStateSync() {
	let { statSync } = await import("fs")
	let stats = statSync("/home/mohamed/Desktop/videos/Drizzle The TypeScript SQL.ORM.mkv")
	console.log(stats.isFile(), "file")
	console.log(stats.isDirectory(), "file")
	let statsDir = statSync("/home/mohamed/Desktop/videos")
	console.log(statsDir.isDirectory(), "dir")

	// try {
	// 	let statsDir2 = statSync("/home/mohamed/Desktop/videos/test/sd")
	// 	console.log(statsDir2.isDirectory(), "dir")
	// }
	// catch (error) {
	// 	console.log(error.message)
	// 	console.log(error.code)
	// }
}
// void testFSStateSync()
