import { ThemeProvider } from "@/providers/theme-provider"
import Navbar from "./_components/navbar"

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<Navbar />
			<div className="mt-16 px-8 max-sm:px-4">{children}</div>
		</ThemeProvider>
	)
}
