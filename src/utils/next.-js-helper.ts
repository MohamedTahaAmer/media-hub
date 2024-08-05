import { headers } from "next/headers"
interface RequestHeaders {
	host: string
	connection: string
	"sec-ch-ua": string
	"sec-ch-ua-mobile": string
	"user-agent": string
	"sec-ch-ua-platform": string
	accept: string
	"sec-fetch-site": string
	"sec-fetch-mode": string
	"sec-fetch-dest": string
	referer: string
	"accept-encoding": string
	"accept-language": string
	cookie: string
	"x-forwarded-host": string
	"x-forwarded-port": string
	"x-forwarded-proto": string
	"x-forwarded-for": string
}

export function getHeaders() {
	const headersList = headers()
	return Object.fromEntries(headersList) as unknown as RequestHeaders
}

export function checkIfClientIsSameAsServer() {
	let headers = getHeaders()
	return headers["x-forwarded-for"] === "::1"
}
