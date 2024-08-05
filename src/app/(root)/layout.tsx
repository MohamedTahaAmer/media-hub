import { Toaster } from "sonner"
import Navbar from "./_components/navbar"

export default function NavBarLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<>
			<Navbar />
			<div id="navbar-layout" className="mx-auto max-w-7xl px-8 pt-16 max-sm:px-4">
				{children}
			</div>
			<Toaster />
		</>
	)
}
