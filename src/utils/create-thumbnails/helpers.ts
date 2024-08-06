export async function deepStrictEqual<T>(obj1: T, obj2: T) {
	let equal = true
	try {
		let { default: assert } = await import("assert")
		// @ts-expect-error
		assert.deepStrictEqual(obj1, obj2)
	} catch (error) {
		equal = false
	}
	return equal
}
export function sanitizeForHref(input: string): string {
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

	return input
		.split("")
		.map((char) => replacements[char] ?? char)
		.join("")
}

export function sanitizeDir(dir: string) {
	let slugs = dir.split("/")
	return slugs.map(sanitizeForHref).join("/")
}

export function readableBytes(bytes: number) {
	if (bytes === 0) return "0 B"
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	return (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["B", "KB", "MB", "GB", "TB"][i]
}

export async function checkIfFileIsActual(file: string, type: "video" | "image") {
	let { fileTypeFromFile } = await import("node_modules/file-type/index")
	let typeObj = await fileTypeFromFile(file)
	return typeObj?.mime.startsWith(type)
}
