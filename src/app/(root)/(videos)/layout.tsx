import { env } from "@/env"
import NavBreadCrumb from "../_components/nav-bread-crumb"

export default function BreadCrumbsLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	let root = env.ROOT_DIR.split("/").pop()
	return (
		<>
			<NavBreadCrumb root={root} />
			{children}
		</>
	)
}
