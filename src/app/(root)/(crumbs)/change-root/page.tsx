import { checkIfClientIsSameAsServer } from "@/utils/next-js-helper"
import { notFound } from "next/navigation"
import FullScreenBg from "./full-screen-bg"
import UpdateRoot from "./update-root"

const Page = () => {
	if (!checkIfClientIsSameAsServer()) return notFound()
	return (
		<>
			<FullScreenBg />
			<div className="fixed inset-0 flex items-center justify-center px-2">
				<UpdateRoot />
			</div>
		</>
	)
}

export default Page
