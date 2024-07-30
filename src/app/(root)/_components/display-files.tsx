import type { FilesAndFolders } from "@/utils/get-files-and-folders"
import { DownloadIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import path from "path"

const DisplayFiles = ({ filesAndFolders, directoryName = "" }: { filesAndFolders: FilesAndFolders; directoryName?: string }) => {
	return (
		<div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-2 max-2xl:grid-cols-10 max-xl:grid-cols-8 max-lg:grid-cols-6 max-md:grid-cols-4 max-sm:grid-cols-3">
			{filesAndFolders.map((item) => (
				<div key={item.path} className="relative">
					<div className="truncate rounded-xl bg-slate-200 pb-2 dark:bg-slate-700">
						{item.thumbnail && <Image src={item.thumbnail} alt={`thumbnail for video ${item.name}`} className="" width={320} height={240} />}
						{!item.thumbnail && (
							<>
								<div className="px-[12.5%] py-3">
									<Image src="/favicon.svg" alt={`thumbnail for video ${item.name}`} className="p-4" width={320} height={240} />
								</div>
							</>
						)}
						<DisplayFileText isDirectory={item.isDirectory} name={item.name} dir={encodeURIComponent(path.join(directoryName, item.name))} />
						{!item.isDirectory && (
							<div className="flex justify-between gap-2 px-2">
								<Link href={`/api/download/${encodeURIComponent(path.join(directoryName, item.name))}`}>
									<DownloadIcon />
								</Link>
								<div className="">{item.size}</div>
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	)
}

export default DisplayFiles

function DisplayFileText({ isDirectory, name, dir }: { isDirectory: boolean; name: string; dir: string }) {
	let baseEndPoint = isDirectory ? "/dir/" : "/api/download/"
	return (
		<Link href={`${baseEndPoint}${dir}`} className="pl-2 font-bold">
			{name}
		</Link>
	)
}
