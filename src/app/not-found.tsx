import NotFound404 from "@/components/svgs/not-found-404"
import Link from "next/link"
import Navbar from "./(root)/_components/navbar"
import { ThemeProvider } from "@/providers/theme-provider"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<Navbar />
			<div className="mx-auto flex min-h-screen max-w-[80%] flex-col items-center justify-center gap-8 bg-background pt-16">
				<NotFound404 className="size-1/2 max-sm:size-full" primaryColor="#B2E12F" secondaryColor="#4C9F35" />
				<p className="text-xl font-bold">Could not find requested resource</p>
				<Link href="/" className={cn(buttonVariants())}>
					Return Home
				</Link>
			</div>
		</ThemeProvider>
	)
}
