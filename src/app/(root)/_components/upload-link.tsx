"use client"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UploadCloud } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const UploadLink = () => {
	let pathName = usePathname()
	if (pathName === "/upload") return null
	return (
		<Link
			href="/upload"
			className={cn(
				buttonVariants({ variant: "ghost", size: "sm" }),
				"rounded-full p-2 hover:bg-lime-900 hover:bg-opacity-20 dark:hover:bg-lime-900 dark:hover:bg-opacity-20",
			)}
			aria-label="Upload"
		>
			<UploadCloud size={24} />
		</Link>
	)
}

export default UploadLink
