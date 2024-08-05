import { getRootDir } from "@/utils/root-dir"
import FullScreenBg from "./full-screen-bg"
import UpdateRoot from "./update-root"
import { notFound } from "next/navigation"
import { getHeaders } from "@/utils/next.-js-helper"

const Page = () => {
	let headers = getHeaders()
	if (headers["x-forwarded-for"] !== "::1") return notFound()
	return (
		<>
			<FullScreenBg />
			<div className="fixed inset-0 flex items-center justify-center px-2">
				<UpdateRoot currentRootDir={getRootDir()} />
			</div>
		</>
	)
}

export default Page
