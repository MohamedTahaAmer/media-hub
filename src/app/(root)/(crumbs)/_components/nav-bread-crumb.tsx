"use client"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

function getHref({ pathArray, index, pre }: { pathArray: string[]; index: number; pre: string }) {
	let href = ""
	for (let i = 0; i <= index; i++) {
		href += pathArray[i] + (i === index ? "" : "/")
	}
	href = pre + encodeURIComponent(href)
	return href
}

const NavBreadCrumb = ({ root = "" }: { root?: string }) => {
	let pathName = usePathname()
	let pathArray = decodeURIComponent(pathName).split("/").slice(2)
	return (
		<Breadcrumb className="sticky top-[56px] z-10 bg-background p-2 shadow-sm shadow-slate-200 dark:shadow-slate-700">
			<BreadcrumbList>
				<BreadcrumbItem
					className={cn("flex gap-2 font-bold", {
						"text-foreground": pathArray.length === 0,
					})}
				>
					<Link href="/">{root}</Link>
				</BreadcrumbItem>
				{pathArray.map((item, index) => (
					<BreadcrumbItem
						key={`${getHref({ pathArray, index, pre: "/dir/" })}`}
						className={cn("flex gap-2 font-bold", {
							"text-foreground": index === pathArray.length - 1,
						})}
					>
						<ChevronRight className="size-4" />
						<Link href={`${getHref({ pathArray, index, pre: "/dir/" })}`}>{item}</Link>
					</BreadcrumbItem>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}

export default NavBreadCrumb
