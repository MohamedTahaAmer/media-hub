"use client"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import { randomKey, rootDir } from "@/utils/constants"
import { ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"

function getHref({ pathArray, index, pre }: { pathArray: string[]; index: number; pre: string }) {
	let href = ""
	for (let i = 0; i <= index; i++) {
		href += pathArray[i] + (i === index ? "" : "/")
	}
	href = pre + encodeURIComponent(href)
	return href
}

const NavBreadCrumb = () => {
	let homeDir = rootDir.split("/").slice(-1)[0]
	let pathName = usePathname()
	let pathArray = decodeURIComponent(pathName).split("/").slice(2)
	return (
		<Breadcrumb className="fixed top-[56px] z-10 w-full bg-background p-2">
			<BreadcrumbList>
				<BreadcrumbItem
					className={cn("flex gap-2 font-bold", {
						"text-foreground": pathArray.length === 0,
					})}
				>
					<BreadcrumbLink href="/">{homeDir}</BreadcrumbLink>
				</BreadcrumbItem>
				{pathArray.map((item, index) => (
					<BreadcrumbItem
						key={`${item}-${randomKey}`}
						className={cn("flex gap-2 font-bold", {
							"text-foreground": index === pathArray.length - 1,
						})}
					>
						<ChevronRight className="size-4" />
						<BreadcrumbLink href={`${getHref({ pathArray, index, pre: "/dir/" })}`}>{item}</BreadcrumbLink>
					</BreadcrumbItem>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}

export default NavBreadCrumb
