import { Toaster } from "sonner"
import Navbar from "./_components/navbar"
import { startImgServer } from "@/utils/start-img-server"
import { startProxyServer } from "@/utils/start-proxy-server"

export default function NavBarLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	startImgServer()
	startProxyServer()
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
