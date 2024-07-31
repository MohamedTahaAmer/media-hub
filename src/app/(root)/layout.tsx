import { ThemeProvider } from "@/providers/theme-provider"
import Navbar from "./_components/navbar"
import NavBreadCrumb from "./_components/nav-bread-crumb"

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<Navbar />

			<div className="mx-auto mt-24 max-w-7xl px-8 max-sm:px-4">
				<NavBreadCrumb />
				{children}
			</div>
		</ThemeProvider>
	)
}
