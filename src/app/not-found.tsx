import NotFound404 from "@/components/svgs/not-found-404"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Navbar from "./(root)/_components/navbar"

export default function NotFound() {
	return (
		<>
			<Navbar />
			<div className="mx-auto flex min-h-screen max-w-[80%] flex-col items-center justify-center gap-8 bg-background pt-16">
				<NotFound404 className="size-1/2 max-sm:size-full" primaryColor="#B2E12F" secondaryColor="#4C9F35" />
				<p className="text-xl font-bold">Could not find requested resource</p>
				<Link href="/" className={cn(buttonVariants())}>
					Return Home
				</Link>
			</div>
		</>
	)
}
