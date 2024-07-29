import type { FilesAndFolders } from "@/utils"
import Link from "next/link"
import path from "path"

const DisplayFiles = ({ filesAndFolders, directoryName = "" }: { filesAndFolders: FilesAndFolders; directoryName?: string }) => {
	return (
		<div>
			{filesAndFolders.map((item) => (
				<div key={item.path} className="flex gap-8">
					{item.isDirectory ? (
						<Link href={`/dir/${encodeURIComponent(path.join(directoryName, item.name))}`} className="font-bold text-blue-900">
							{item.name}
						</Link>
					) : (
						<Link href={`/api/download/${encodeURIComponent(path.join(directoryName, item.name))}`} className="font-bold text-blue-900">
							{item.name}
						</Link>
					)}
					{!item.isDirectory && <div>{item.size}</div>}
				</div>
			))}
		</div>
	)
}

export default DisplayFiles
