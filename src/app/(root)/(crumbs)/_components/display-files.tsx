import { cn } from "@/lib/utils"
import { getLocalIpAddress } from "@/utils"
import type { FilesAndFolders } from "@/utils/create-thumbnails/types"
import { getIcon } from "@/utils/get-icon"
import { DownloadIcon, type LucideProps } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import path from "path"
import { PORT } from "~/img-server/img-server"

const DisplayFiles = ({ filesAndFolders, directoryName = "" }: { filesAndFolders: FilesAndFolders | string; directoryName?: string }) => {
	if (typeof filesAndFolders === "string") return <div>{filesAndFolders}</div>
	return (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{filesAndFolders.map((item) => (
				<div key={item.name} className="overflow-hidden rounded-md pb-2 shadow-xl shadow-slate-200 dark:shadow-slate-800">
					{/* Thumbnails and Icons */}
					{item.thumbnail && (
						<div className="flex aspect-[16/9] items-center justify-center">
							<DynamicImage name={item.thumbnail.name} width={item.thumbnail.width} height={item.thumbnail.height} />
						</div>
					)}
					{!item.thumbnail && (
						<Link href={`/dir/${encodeURIComponent(path.join(directoryName, item.name))}`}>
							<DisplayIcon alt={`thumbnail icon for ${item.name}`} name={item.name} isDirectory={item.isDirectory} className={cn("px-[17.5%]")} />
						</Link>
					)}

					<DisplayTitle isDirectory={item.isDirectory} name={item.name} dir={encodeURIComponent(path.join(directoryName, item.name))} />

					{/* size and download button for files */}
					{!item.isDirectory && (
						<div className="flex justify-between gap-2 px-2">
							<Link href={`/api/download/${encodeURIComponent(path.join(directoryName, item.name))}`} prefetch={false}>
								<DownloadIcon />
							</Link>
							<div className="">{item.size}</div>
						</div>
					)}
				</div>
			))}
		</div>
	)
}

export default DisplayFiles

async function DynamicImage({ name, width, height }: { name: string; width: number; height: number }) {
	let Host = await getLocalIpAddress()
	let port = PORT
	let imgURL = `http://${Host}:${port}${name}`

	return (
		<Image src={imgURL} alt={`thumbnail for ${name}`} className={cn("object-contain", { grow: width / height === 16 / 9 })} width={width} height={height} />
	)
}

function DisplayTitle({ isDirectory, name, dir }: { isDirectory: boolean; name: string; dir: string }) {
	let baseEndPoint = isDirectory ? "/dir/" : "/api/download/"
	return (
		<div className="truncate-two-lines pl-2">
			<Link prefetch={false} href={`${baseEndPoint}${dir}`} className="font-bold">
				{name}
			</Link>
		</div>
	)
}

async function DisplayIcon({ isDirectory, name, className, alt }: { alt: string; isDirectory: boolean; name: string; className: string }) {
	let Icon: undefined | ((_: LucideProps) => JSX.Element)
	if (isDirectory) {
		Icon = await getIcon(name, "Folder")
	} else {
		Icon = await getIcon(name, "File")
	}
	return <Icon className={className} aria-label={alt} role="img" />
}
