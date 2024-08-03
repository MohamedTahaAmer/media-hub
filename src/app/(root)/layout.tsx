import Navbar from "./_components/navbar"

export default function NavBarLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<>
			<Navbar />
			<div className="mx-auto mt-24 max-w-7xl px-8 max-sm:px-4">{children}</div>
		</>
	)
}
