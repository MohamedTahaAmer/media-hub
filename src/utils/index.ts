// import { execSync } from "child_process"

export async function getIpAddress() {
	let { execSync } = await import("child_process")
	const result = execSync("ip addr show | grep -oP '(?<=inet 192.168.1).*?(?=/24)'", {
		encoding: "utf-8",
	})
	return "192.168.1" + result.trim()
}

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
