"use client"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LinkIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const ChangeRootDirLink = () => {
	let pathName = usePathname()
	if (pathName === "/change-root") return null
	return (
		<Link href="/change-root" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))} aria-label="Change Root Directory">
			<LinkIcon size={24} />
		</Link>
	)
}

export default ChangeRootDirLink
