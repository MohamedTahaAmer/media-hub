await import("./src/env.js")

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		// eslint-disable-next-line
		config.externals.push("bun:sqlite")
		// eslint-disable-next-line
		return config
	},
}

export default nextConfig
