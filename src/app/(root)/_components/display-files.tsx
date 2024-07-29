import type { FilesAndFolders } from "@/utils/get-files-and-folders"
import Image from "next/image"
import Link from "next/link"
import path from "path"

const DisplayFiles = ({ filesAndFolders, directoryName = "" }: { filesAndFolders: FilesAndFolders; directoryName?: string }) => {
	return (
		<div className="flex flex-wrap gap-2">
			{filesAndFolders.map((item) => (
				<div key={item.path} className="relative">
					<div className="size-48 truncate rounded-xl bg-slate-300">
						{item.thumbnail && <Image src={item.thumbnail} alt={`thumbnail for video ${item.name}`} className="" width={320} height={240} />}
						<DisplayFileText isDirectory={item.isDirectory} name={item.name} dir={encodeURIComponent(path.join(directoryName, item.name))} />
						{!item.isDirectory && <div className="absolute bottom-1 right-4">{item.size}</div>}
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
		<Link href={`${baseEndPoint}${dir}`} className="pl-2 font-bold text-blue-900">
			{name}
		</Link>
	)
}
