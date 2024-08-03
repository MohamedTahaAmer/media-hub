import NavBreadCrumb from "../_components/nav-bread-crumb"

export default function BreadCrumbsLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<>
			<NavBreadCrumb />
			{children}
		</>
	)
}
