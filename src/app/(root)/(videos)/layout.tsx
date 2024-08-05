import { getRootDir } from "@/utils/root-dir"
import NavBreadCrumb from "./_components/nav-bread-crumb"

export default function BreadCrumbsLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	let root = getRootDir().split("/").pop()
	return (
		<>
			<NavBreadCrumb root={root} />
			<div id="videos-layout" className="pt-8">
				{children}
			</div>
		</>
	)
}
