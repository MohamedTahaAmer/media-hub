await import("./src/env.js")

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ["192.168.1.110"],
	},
	experimental: {
		serverActions: {
			allowedOrigins: ["192.168.1.110:3002"],
		},
	},
}

export default nextConfig
