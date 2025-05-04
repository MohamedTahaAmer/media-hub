import assert from "assert"

export function syncDeepStrictEqual<T>(obj1: T, obj2: T) {
	try {
		assert.deepStrictEqual(obj1, obj2)
		return true
	} catch (error) {
		return false
	}
}
