import { cn } from "@/lib/utils"
import type { FilesAndFolders } from "@/utils/create-thumbnails/types"
import { getIcon } from "@/utils/get-icon"
import { DownloadIcon, type LucideProps } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import path from "path"

const DisplayFiles = ({ filesAndFolders, directoryName = "" }: { filesAndFolders: FilesAndFolders; directoryName?: string }) => {
	return (
		<div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
			{filesAndFolders.map((item) => (
				<div key={item.name} className="overflow-hidden rounded-md pb-2 shadow-xl shadow-slate-400 dark:shadow-slate-700">
					<div className="aspect-[3/2] max-h-[240px]">
						{/* Thumbnails and Icons */}
						{item.thumbnail && <Image src={item.thumbnail} alt={`thumbnail for ${item.name}`} className="h-full object-cover" width={320} height={240} />}
						{!item.thumbnail && (
							<Link href={`/dir/${encodeURIComponent(path.join(directoryName, item.name))}`}>
								<DisplayIcon
									alt={`thumbnail icon for ${item.name}`}
									name={item.name}
									isDirectory={item.isDirectory}
									className={cn("px-[12.5%]", {
										"py-3": item.isDirectory,
									})}
								/>
							</Link>
						)}
					</div>

					<DisplayFileText isDirectory={item.isDirectory} name={item.name} dir={encodeURIComponent(path.join(directoryName, item.name))} />

					{/* size and download button for files */}
					{!item.isDirectory && (
						<div className="flex justify-between gap-2 px-2">
							<Link href={`/api/download/${encodeURIComponent(path.join(directoryName, item.name))}`}>
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

function DisplayFileText({ isDirectory, name, dir }: { isDirectory: boolean; name: string; dir: string }) {
	let baseEndPoint = isDirectory ? "/dir/" : "/api/download/"
	return (
		<div className="truncate-two-lines pl-2">
			<Link href={`${baseEndPoint}${dir}`} className="font-bold">
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
