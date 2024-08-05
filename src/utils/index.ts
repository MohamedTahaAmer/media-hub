export async function getIpAddress() {
	let { execSync } = await import("child_process")
	const result = execSync("ip addr show | grep -oP '(?<=inet 192.168.1).*?(?=/24)'", {
		encoding: "utf-8",
	})
	return "192.168.1" + result.trim()
}
