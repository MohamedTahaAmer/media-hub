export async function getLocalIpAddress() {
	let { execSync } = await import("child_process")
	const result = execSync("ip addr show | grep -oP '(?<=inet 192.168.1).*?(?=/24)'", {
		encoding: "utf-8",
	})
	return "192.168.1" + result.trim()
}

export async function doesFileExist(filePath: string) {
	let { access, constants } = await import("fs/promises")
	let exist = true
	try {
		await access(filePath, constants.F_OK)
	} catch (error) {
		exist = false
	}
	return exist
}

export async function checkDirectoryExists(dirPath: string) {
	let { stat } = await import("fs/promises")
	try {
		await stat(dirPath)
	} catch (error) {
		if (error instanceof Error && error.message.startsWith("ENOENT")) {
			throw new Error(`Directory doesn't exist: ${dirPath}`)
		}
		throw new Error("An error occurred while checking if the directory exists")
	}
}

export async function logExecutionTime<T>(func: () => T | Promise<T>, title?: string): Promise<T> {
	const funcName = title ?? "anonymous function"

	const start = performance.now()

	const result = await func()

	const end = performance.now()

	console.log("\x1b[1;33m%s\x1b[1;36m", `⏰ Time to ${funcName} is: ${(end - start).toFixed(2)}ms`)

	return result
}
