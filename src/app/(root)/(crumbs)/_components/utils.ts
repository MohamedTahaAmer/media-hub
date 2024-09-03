export function readableBytesToNumber(size: string): number {
	const units = ["B", "KB", "MB", "GB", "TB"]
	const regex = /^(\d+(?:\.\d+)?)\s?([a-zA-Z]+)$/
	const matches = size.match(regex)

	if (!matches?.length) {
		throw new Error("Invalid size format")
	}

	const value = parseFloat(matches[1]!)
	const unit = matches[2]!.toUpperCase()
	const exponent = units.indexOf(unit)

	if (exponent === -1) {
		throw new Error("Invalid unit")
	}

	return value * Math.pow(1024, exponent)
}

export async function downloadFile(url: string, name: string) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		xhr.open("GET", url, true)
		xhr.responseType = "blob"

		xhr.onload = function () {
			if (xhr.status === 200) {
				const blob = xhr.response as Blob
				// Assuming you want to save the file locally
				const url = window.URL.createObjectURL(blob)
				const a = document.createElement("a")
				a.href = url
				a.download = name
				document.body.appendChild(a)
				a.click()
				document.body.removeChild(a)
				window.URL.revokeObjectURL(url)
				resolve(0)
			} else {
				reject(`Failed to download ${name}`)
			}
		}

		xhr.onerror = function () {
			reject(`Network error while downloading ${name}`)
		}

		xhr.send()
	})
}
