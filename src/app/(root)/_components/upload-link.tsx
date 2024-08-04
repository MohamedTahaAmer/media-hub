"use client"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const UploadLink = () => {
	let pathName = usePathname()
	if (pathName === "/upload") return null
	return (
		<Link href="/upload" className={cn(buttonVariants({ variant: "ghost" }))}>
			Upload
		</Link>
	)
}

export default UploadLink
