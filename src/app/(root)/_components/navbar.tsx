import { ThemeProvider } from "@/providers/theme-provider"
import Image from "next/image"
import Link from "next/link"
import ThemeToggleInLine from "./ThemeToggleInLine"
import UploadLink from "./upload-link"

const Navbar = () => {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<div className="gradient-bg fixed inset-x-0 top-0 z-10 h-fit border-b bg-lime-900 p-4 py-2 shadow-lg backdrop-blur-sm dark:bg-lime-900">
				<div className="container mx-auto flex h-full max-w-7xl items-center justify-between gap-2">
					{/* logo */}
					<Link href="/" className="flex items-center gap-2">
						<div className="relative size-10">
							<Image src="/favicon.svg" width={40} height={40} alt="Logo" />
						</div>
						<p className="hidden text-2xl font-bold dark:text-background sm:block">Media Hub</p>
					</Link>

					<div className="flex items-center justify-center gap-x-4">
						<UploadLink />
						<ThemeToggleInLine />
					</div>
				</div>
			</div>
		</ThemeProvider>
	)
}

export default Navbar
