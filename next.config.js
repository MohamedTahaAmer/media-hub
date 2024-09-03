await import("./src/env.js")

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ["192.168.1.106"],
	},
	experimental: {
		serverActions: {
			allowedOrigins: ["192.168.1.106:3002"],
		},
	},
}

export default nextConfig
