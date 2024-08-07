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
			<div id="navbar-layout" className="mx-auto max-w-7xl px-4 pt-16 sm:px-8">
				{children}
			</div>
			<Toaster />
		</>
	)
}
